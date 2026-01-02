import { Router } from "express";

// Auth middleware
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Multer middleware for media upload
import { upload } from "../middlewares/multer.middleware.js";

// Post controllers
import {
  createPost,
  getFeedPosts,
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
- Only logged-in users
- Upload single media file
*/
router.post(
  "/",
  verifyJWT,
  upload.single("media"), // "media" is form-data key
  createPost
);

/*
GET FEED POSTS
- Latest posts first
- Logged-in users only
*/
router.get("/", verifyJWT, getFeedPosts);

/*
LIKE / UNLIKE POST
- Toggle like
*/
router.post("/:postId/like", verifyJWT, likeOrUnlikePost);

/*
ADD COMMENT TO POST
*/
router.post("/:postId/comment", verifyJWT, addComment);

/*
DELETE POST (SOFT DELETE)
- Only owner can delete
*/
router.delete("/:postId", verifyJWT, deletePost);

export default router;
