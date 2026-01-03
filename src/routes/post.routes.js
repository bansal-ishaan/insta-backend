import { Router } from "express";

// Auth middleware
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Multer middleware
import { upload } from "../middlewares/multer.middleware.js";

// Post controllers
import {
  createPost,
  getFeedPosts,
  getUserProfilePosts,
  likeOrUnlikePost,
  addComment,
  deletePost,
} from "../controllers/post.controller.js";

const router = Router();

/*
========================================
POST ROUTES
Base path: /api/v1/posts
========================================
*/

/*
CREATE POST
POST /api/v1/posts
(form-data: media, caption, mediaType)
*/
router.post(
  "/",
  verifyJWT,
  upload.single("media"),
  createPost
);

/*
GET FEED POSTS
GET /api/v1/posts?page=1
*/
router.get("/", verifyJWT, getFeedPosts);

/*
GET USER PROFILE POSTS (privacy-safe)
GET /api/v1/posts/user/:userId
*/
router.get("/user/:userId", verifyJWT, getUserProfilePosts);

/*
LIKE / UNLIKE POST
POST /api/v1/posts/:postId/like
*/
router.post("/:postId/like", verifyJWT, likeOrUnlikePost);

/*
ADD COMMENT
POST /api/v1/posts/:postId/comment
*/
router.post("/:postId/comment", verifyJWT, addComment);

/*
DELETE POST (soft delete)
DELETE /api/v1/posts/:postId
*/
router.delete("/:postId", verifyJWT, deletePost);

export default router;
