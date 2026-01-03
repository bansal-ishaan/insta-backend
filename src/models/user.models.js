// Import mongoose to define schema and model
import mongoose from "mongoose";

// Import JWT for token generation
import jwt from "jsonwebtoken";

// Import bcrypt for password hashing & comparison
import bcrypt from "bcrypt";

/*
========================================
USER SCHEMA (INSTAGRAM-LIKE)
========================================
*/
const userSchema = new mongoose.Schema(
  {
    // Unique username (public identity)
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Email (used for login)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Optional full name
    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    // Instagram-style profile picture
    profilePicture: {
      type: String,
      default: "",
    },

    // Short bio
    bio: {
      type: String,
      maxlength: 150,
      default: "",
    },

    // Hashed password
    password: {
      type: String,
      required: true,
      select: false, // never return password by default
    },

    // Refresh token storage
    refreshToken: {
      type: String,
    },

    // Private account toggle
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

/* ================= PASSWORD HASH ================= */

// Hash password before saving
userSchema.pre("save", async function () {
  // If password is not modified, do nothing
  if (!this.isModified("password")) return;

  // Hash password
  this.password = await bcrypt.hash(this.password, 10);
});


/* ================= METHODS ================= */

// Compare input password with hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// Export User model
export const User = mongoose.model("User", userSchema);
