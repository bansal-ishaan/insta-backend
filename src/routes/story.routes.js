import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createStory,
  getActiveStories,
} from "../controllers/story.controller.js";

const router = Router();

/*
========================================
STORY ROUTES
Base path: /api/v1/stories
========================================
*/

// Create story
router.post(
  "/",
  verifyJWT,
  upload.single("media"),
  createStory
);

// Get active stories (privacy aware)
router.get("/", verifyJWT, getActiveStories);

export default router;
