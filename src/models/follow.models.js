import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    // User who sent the follow request
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User who receives the request
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // pending = follow request
    // accepted = following
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate follow entries
followSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow = mongoose.model("Follow", followSchema);
