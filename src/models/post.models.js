import mongoose from "mongoose";

/*
  Comment Schema
  Each comment belongs to:
  - a user
  - a post
*/
const commentSchema = new mongoose.Schema(
  {
    // User who wrote the comment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Comment text
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt for comments
  }
);

/*
  Post Schema
  Represents a single Instagram-like post
*/
const postSchema = new mongoose.Schema(
  {
    // Image or video URL (Cloudinary)
    mediaUrl: {
      type: String,
      required: true,
    },

    // Type of media
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    // Caption text (AI-assisted or manual)
    caption: {
      type: String,
      maxlength: 2200,
      default: "",
    },

    // Owner of the post
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Users who liked the post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Embedded comments
    comments: [commentSchema],

    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt for posts
  }
);

// Export Post model
export const Post = mongoose.model("Post", postSchema);
