import mongoose from "mongoose";

/*
========================================
STORY SCHEMA
========================================
*/
const storySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mediaUrl: {
      type: String,
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

/*
  TTL INDEX
  MongoDB auto-deletes expired stories
*/
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Story = mongoose.model("Story", storySchema);
