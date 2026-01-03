import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Story } from "../models/story.models.js";
import { Follow } from "../models/follow.models.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

/*
========================================
CREATE STORY
========================================
*/
const createStory = asyncHandler(async (req, res) => {
  const { mediaType } = req.body;

  const mediaLocalPath = req.file?.path;
  if (!mediaLocalPath) {
    throw new ApiError(400, "Story media is required");
  }

  if (!["image", "video"].includes(mediaType)) {
    throw new ApiError(400, "Invalid media type");
  }

  const uploadedMedia = await uploadOnCloudinary(mediaLocalPath);
  if (!uploadedMedia) {
    throw new ApiError(500, "Story upload failed");
  }

  const story = await Story.create({
    owner: req.user._id,
    mediaUrl: uploadedMedia.url,
    mediaType,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  res
    .status(201)
    .json(new ApiResponse(201, story, "Story created successfully"));
});

/*
========================================
GET ACTIVE STORIES (PRIVACY AWARE)
========================================
*/
const getActiveStories = asyncHandler(async (req, res) => {
  const now = new Date();

  // 1️⃣ Users I follow (accepted)
  const followingDocs = await Follow.find({
    follower: req.user._id,
    status: "accepted",
  }).select("following");

  const followingIds = followingDocs.map((f) => f.following);

  // 2️⃣ Public users
  const publicUsers = await User.find({ isPrivate: false }).select("_id");
  const publicUserIds = publicUsers.map((u) => u._id);

  // 3️⃣ Allowed story owners
  const allowedOwners = [
    req.user._id,
    ...followingIds,
    ...publicUserIds,
  ];

  // 4️⃣ Fetch stories
  const stories = await Story.find({
    owner: { $in: allowedOwners },
    expiresAt: { $gt: now },
  })
    .sort({ createdAt: -1 })
    .populate("owner", "username profilePicture");

  res
    .status(200)
    .json(new ApiResponse(200, stories, "Stories fetched successfully"));
});

export {
  createStory,
  getActiveStories,
};
