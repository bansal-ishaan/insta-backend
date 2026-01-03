import mongoose from "mongoose";

/*
========================================
COMMENT SUB-SCHEMA
========================================
*/
const commentSchema = new mongoose.Schema(
  {
    // User who commented
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Comment text
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt for comment
  }
);

/*
========================================
POST SCHEMA
========================================
*/
const postSchema = new mongoose.Schema(
  {
    // Image / video URL (Cloudinary)
    mediaUrl: {
      type: String,
      required: true,
    },

    // image | video
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    // Caption text
    caption: {
      type: String,
      trim: true,
      default: "",
    },

    // Owner of the post
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Likes (array of user IDs)
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Comments
    comments: [commentSchema],

    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

/*
========================================
INDEXES (PERFORMANCE)
========================================
*/
postSchema.index({ owner: 1, createdAt: -1 });

/*
========================================
EXPORT MODEL
========================================
*/
export const Post = mongoose.model("Post", postSchema);
