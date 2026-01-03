// ========================= IMPORTS =========================

// Async error wrapper
import { asyncHandler } from "../utils/asyncHandler.js";

// Custom error class
import ApiError from "../utils/ApiError.js";

// Standard API response
import { ApiResponse } from "../utils/ApiResponse.js";

// User model
import { User } from "../models/user.models.js";

// Follow model
import { Follow } from "../models/follow.models.js";

// Cloudinary uploader
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

// JWT
import jwt from "jsonwebtoken";

// Mongoose (for ObjectId in aggregations)
import mongoose from "mongoose";

// ========================= TOKEN HELPERS =========================

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found while generating tokens");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ========================= CHANGE PASSWORD =========================

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Validate input
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  // Fetch user with password (password is select:false by default)
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify old password
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  // Set new password (will be hashed by pre-save hook)
  user.password = newPassword;

  // Optional but recommended: invalidate old refresh tokens
  user.refreshToken = undefined;

  await user.save();

  res.json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ========================= REGISTER =========================

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, bio } = req.body;

  // Validate fields
  if ([username, email, password].some((f) => !f?.trim())) {
    throw new ApiError(400, "All required fields must be filled");
  }

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  // Profile picture is mandatory
  const profilePicPath = req.file?.path;
  if (!profilePicPath) {
    throw new ApiError(400, "Profile picture is required");
  }

  // Upload profile picture
  const profilePic = await uploadOnCloudinary(profilePicPath);
  if (!profilePic) {
    throw new ApiError(500, "Failed to upload profile picture");
  }

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    bio: bio || "",
    profilePicture: profilePic.url,
  });

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(201)
    .json(new ApiResponse(201, safeUser, "User registered successfully"));
});

// ========================= LOGIN =========================

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!password || (!email && !username)) {
    throw new ApiError(400, "Email/Username and password required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  }).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { user: safeUser, accessToken }, "Login successful")
    );
});

// ========================= LOGOUT =========================

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  res
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ========================= REFRESH TOKEN =========================

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .json(
      new ApiResponse(200, { accessToken }, "Token refreshed successfully")
    );
});

// ========================= GET CURRENT USER =========================

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// ========================= UPDATE PROFILE =========================

const updateProfile = asyncHandler(async (req, res) => {
  const { bio, isPrivate } = req.body;

  const updates = {};

  if (bio !== undefined) updates.bio = bio;
  if (isPrivate !== undefined) updates.isPrivate = isPrivate;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  ).select("-password -refreshToken");

  res.json(new ApiResponse(200, user, "Profile updated successfully"));
});

// ========================= UPDATE PROFILE PICTURE =========================

const updateProfilePicture = asyncHandler(async (req, res) => {
  const picPath = req.file?.path;
  if (!picPath) {
    throw new ApiError(400, "Profile picture required");
  }

  const uploaded = await uploadOnCloudinary(picPath);
  if (!uploaded) {
    throw new ApiError(500, "Profile picture upload failed");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $set: { profilePicture: uploaded.url },
  });

  res.json(new ApiResponse(200, {}, "Profile picture updated"));
});

// ========================= FOLLOW USER =========================

const followUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;

  if (targetUserId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const status = targetUser.isPrivate ? "pending" : "accepted";

  await Follow.create({
    follower: req.user._id,
    following: targetUserId,
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

// ========================= ACCEPT FOLLOW REQUEST =========================

const acceptFollowRequest = asyncHandler(async (req, res) => {
  const followerId = req.params.userId;

  const follow = await Follow.findOneAndUpdate(
    {
      follower: followerId,
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
GET PUBLIC USER PROFILE BY USERNAME
========================================
*/
const getUserProfileByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const user = await User.findOne({
    username: username.toLowerCase(),
  }).select("-password -refreshToken -email");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
});

// ========================= UNFOLLOW =========================

const unfollowUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;

  await Follow.findOneAndDelete({
    follower: req.user._id,
    following: targetUserId,
  });

  res.json(new ApiResponse(200, {}, "Unfollowed successfully"));
});

// ========================= EXPORTS =========================

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  getUserProfileByUsername,
  updateProfilePicture,
  followUser,
  acceptFollowRequest,
  changeCurrentPassword,
  unfollowUser,
};
