import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  followUser,
  acceptFollowRequest,
  rejectFollowRequest,
  unfollowUser,
  getFollowRequests,
  getFollowers,
  getFollowing,
} from "../controllers/follow.controller.js";

const router = Router();

// 🔥 NEW
router.get("/followers", verifyJWT, getFollowers);
router.get("/following", verifyJWT, getFollowing);
// Send follow request
router.post("/:userId", verifyJWT, followUser);

// Accept follow request
router.post("/:userId/accept", verifyJWT, acceptFollowRequest);

// Reject follow request
router.post("/:userId/reject", verifyJWT, rejectFollowRequest);

// Unfollow
router.delete("/:userId", verifyJWT, unfollowUser);

// Pending requests
router.get("/requests/pending", verifyJWT, getFollowRequests);



export default router;
