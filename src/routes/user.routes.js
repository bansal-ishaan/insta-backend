// Import Router from express
import { Router } from "express";

// User controllers
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  updateProfile,
  getCurrentUser,
  updateProfilePicture,
  getUserProfileByUsername,
} from "../controllers/user.controller.js";

// Multer middleware
import { upload } from "../middlewares/multer.middleware.js";

// Auth middleware
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/* ========================================
   AUTH & PUBLIC ROUTES
======================================== */

// Register new user (with profile picture)
router.post(
  "/register",
  upload.single("profilePicture"), // Instagram-style
  registerUser
);

// Login user
router.post("/login", loginUser);

// Refresh access token
router.post("/refresh-token", refreshAccessToken);

/* ========================================
   PROTECTED ROUTES (AUTH REQUIRED)
======================================== */

// Logout user
router.post("/logout", verifyJWT, logoutUser);

// Change password
router.post("/change-password", verifyJWT, changeCurrentPassword);

// Get current logged-in user
router.get("/current-user", verifyJWT, getCurrentUser);

// Update profile (name, bio)
router.patch("/update-profile", verifyJWT, updateProfile);

// Update profile picture
router.patch(
  "/profile-picture",
  verifyJWT,
  upload.single("profilePicture"),
  updateProfilePicture
);

/* ========================================
   PUBLIC USER PROFILE
======================================== */

// Get public user profile by username
router.get("/user/:username", getUserProfileByUsername);

export default router;
