import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Post } from "../models/post.models.js";
import { Follow } from "../models/follow.models.js";
import { User } from "../models/user.models.js";

import { uploadOnCloudinary } from "../utils/Cloudinary.js";

/*
========================================
CREATE POST
========================================
*/
const createPost = asyncHandler(async (req, res) => {
  const { caption, mediaType } = req.body;

  const mediaLocalPath = req.file?.path;
  if (!mediaLocalPath) {
    throw new ApiError(400, "Post media is required");
  }

  if (!["image", "video"].includes(mediaType)) {
    throw new ApiError(400, "Invalid media type");
  }

  const uploadedMedia = await uploadOnCloudinary(mediaLocalPath);
  if (!uploadedMedia) {
    throw new ApiError(500, "Media upload failed");
  }

  const post = await Post.create({
    mediaUrl: uploadedMedia.url,
    mediaType,
    caption: caption || "",
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, post, "Post created successfully"));
});

/*
========================================
GET USER PROFILE POSTS (PRIVACY SAFE)
========================================
*/
const getUserProfilePosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // 1️⃣ Check target user
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const viewerId = req.user._id.toString();
  const targetId = targetUser._id.toString();

  // 2️⃣ Decide access
  let canView = false;

  // Same user
  if (viewerId === targetId) {
    canView = true;
  }

  // Public account
  if (!targetUser.isPrivate) {
    canView = true;
  }

  // Private account → check accepted follow
  if (!canView && targetUser.isPrivate) {
    const isFollower = await Follow.exists({
      follower: viewerId,
      following: targetId,
      status: "accepted",
    });

    if (isFollower) {
      canView = true;
    }
  }

  if (!canView) {
    throw new ApiError(403, "This account is private");
  }

  // 3️⃣ Fetch posts
  const posts = await Post.find({
    owner: targetId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .populate("owner", "username profilePicture");

  res.status(200).json(
    new ApiResponse(200, posts, "Profile posts fetched successfully")
  );
});

/*
========================================
GET FEED POSTS (PRIVACY + FOLLOW LOGIC)
========================================
*/
const getFeedPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // 1️⃣ People I follow (accepted)
  const followingDocs = await Follow.find({
    follower: req.user._id,
    status: "accepted",
  }).select("following");

  const followingIds = followingDocs.map((f) => f.following);

  // 2️⃣ Public users
  const publicUsers = await User.find({ isPrivate: false }).select("_id");
  const publicUserIds = publicUsers.map((u) => u._id);

  // 3️⃣ Allowed owners
  const allowedOwners = [
    req.user._id,
    ...followingIds,
    ...publicUserIds,
  ];

  // 4️⃣ Fetch feed posts
  const posts = await Post.find({
    owner: { $in: allowedOwners },
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("owner", "username profilePicture")
    .populate("comments.user", "username profilePicture");

  res
    .status(200)
    .json(new ApiResponse(200, posts, "Feed fetched successfully"));
});

/*
========================================
LIKE / UNLIKE POST
========================================
*/
const likeOrUnlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post || post.isDeleted) {
    throw new ApiError(404, "Post not found");
  }

  const userId = req.user._id;
  const alreadyLiked = post.likes.includes(userId);

  if (alreadyLiked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { liked: !alreadyLiked },
      alreadyLiked ? "Post unliked" : "Post liked"
    )
  );
});

/*
========================================
ADD COMMENT
========================================
*/
const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    throw new ApiError(400, "Comment text is required");
  }

  const post = await Post.findById(postId);
  if (!post || post.isDeleted) {
    throw new ApiError(404, "Post not found");
  }

  post.comments.push({
    user: req.user._id,
    text,
  });

  await post.save();

  res
    .status(200)
    .json(new ApiResponse(200, post.comments, "Comment added"));
});

/*
========================================
DELETE POST (SOFT DELETE)
========================================
*/
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post || post.isDeleted) {
    throw new ApiError(404, "Post not found");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this post");
  }

  post.isDeleted = true;
  await post.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

/*
========================================
EXPORTS (IMPORTANT)
========================================
*/
export {
  createPost,
  getFeedPosts,
  getUserProfilePosts,
  likeOrUnlikePost,
  addComment,
  deletePost,
};
