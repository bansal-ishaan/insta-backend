import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Follow } from "../models/follow.models.js";
import { User } from "../models/user.models.js";

/*
========================================
FOLLOW USER
========================================
*/
const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Cannot follow yourself
  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Check if already exists
  const existingFollow = await Follow.findOne({
    follower: req.user._id,
    following: userId,
  });

  if (existingFollow) {
    throw new ApiError(400, "Follow request already exists");
  }

  const status = targetUser.isPrivate ? "pending" : "accepted";

  await Follow.create({
    follower: req.user._id,
    following: userId,
    status,
  });

  res.json(
    new ApiResponse(
      200,
      {},
      status === "pending"
        ? "Follow request sent"
        : "User followed successfully"
    )
  );
});

// ========================= GET MY FOLLOWERS =========================
// People who follow ME (status = accepted)

const getFollowers = asyncHandler(async (req, res) => {
  const followers = await Follow.find({
    following: req.user._id,
    status: "accepted",
  })
    .populate("follower", "username profilePicture bio")
    .select("-__v");

  res.json(
    new ApiResponse(
      200,
      followers.map((f) => f.follower),
      "Followers fetched successfully"
    )
  );
});

// ========================= GET MY FOLLOWING =========================
// People I FOLLOW (status = accepted)

const getFollowing = asyncHandler(async (req, res) => {
  const following = await Follow.find({
    follower: req.user._id,
    status: "accepted",
  })
    .populate("following", "username profilePicture bio")
    .select("-__v");

  res.json(
    new ApiResponse(
      200,
      following.map((f) => f.following),
      "Following fetched successfully"
    )
  );
});


/*
========================================
ACCEPT FOLLOW REQUEST
========================================
*/
const acceptFollowRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const follow = await Follow.findOneAndUpdate(
    {
      follower: userId,
      following: req.user._id,
      status: "pending",
    },
    { status: "accepted" },
    { new: true }
  );

  if (!follow) {
    throw new ApiError(404, "Follow request not found");
  }

  res.json(new ApiResponse(200, {}, "Follow request accepted"));
});

/*
========================================
REJECT FOLLOW REQUEST
========================================
*/
const rejectFollowRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const deleted = await Follow.findOneAndDelete({
    follower: userId,
    following: req.user._id,
    status: "pending",
  });

  if (!deleted) {
    throw new ApiError(404, "Follow request not found");
  }

  res.json(new ApiResponse(200, {}, "Follow request rejected"));
});

/*
========================================
UNFOLLOW USER
========================================
*/
const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await Follow.findOneAndDelete({
    follower: req.user._id,
    following: userId,
    status: "accepted",
  });

  res.json(new ApiResponse(200, {}, "Unfollowed successfully"));
});

/*
========================================
GET PENDING FOLLOW REQUESTS
========================================
*/
const getFollowRequests = asyncHandler(async (req, res) => {
  const requests = await Follow.find({
    following: req.user._id,
    status: "pending",
  }).populate("follower", "username profilePicture");

  res.json(
    new ApiResponse(200, requests, "Follow requests fetched")
  );
});

export {
  followUser,
  acceptFollowRequest,
  rejectFollowRequest,
  unfollowUser,
  getFollowRequests,
  getFollowers,
  getFollowing
};
