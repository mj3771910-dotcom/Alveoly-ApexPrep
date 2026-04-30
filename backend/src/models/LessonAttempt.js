// models/LessonAttempt.js - Add retake control fields
import mongoose from "mongoose";

const lessonAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LessonQuestion",
      required: true,
    },
    questionText: String,
    selected: String,
    selectedText: String,
    correct: String,
    correctText: String,
    isCorrect: Boolean,
    points: Number,
    rationale: String,
  }],
  score: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["in-progress", "completed", "failed", "expired"],
    default: "in-progress",
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  attempts: {
    type: Number,
    default: 1,
  },
  maxAttempts: {
    type: Number,
    default: 1, // Changed to 1 - only one attempt unless admin allows retake
  },
  passMark: {
    type: Number,
    default: 70,
  },
  lessonCompleted: {
    type: Boolean,
    default: false,
  },
  // NEW: Track if admin has allowed retake
  adminAllowedRetake: {
    type: Boolean,
    default: false,
  },
  // NEW: Track if this attempt replaces a previous one
  replacesAttemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LessonAttempt",
    default: null,
  },
});

lessonAttemptSchema.virtual("isPassed").get(function() {
  return this.percentage >= this.passMark;
});

export default mongoose.model("LessonAttempt", lessonAttemptSchema);