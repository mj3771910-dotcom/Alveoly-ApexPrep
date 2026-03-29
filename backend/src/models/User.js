// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

    resetToken: String,
    resetTokenExpire: Date,

    // ✅ NEW (ANTI-SHARING)
    activeSession: String,
    deviceInfo: String,
    lastLoginIP: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);