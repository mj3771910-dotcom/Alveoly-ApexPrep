// models/Content.js - UPDATED with quiz type
import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "image", "pdf", "quiz"], // Added "quiz" type
      required: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    publicId: {
      type: String,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    thumbnailPublicId: {
      type: String,
      default: null,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    isPaid: { 
      type: Boolean, 
      default: false 
    },
    price: { 
      type: Number, 
      default: 0 
    },
    // Quiz-specific fields
    quizTimerMinutes: {
      type: Number,
      default: 0,
    },
    quizPassMark: {
      type: Number,
      default: 70,
    },
    unlockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);