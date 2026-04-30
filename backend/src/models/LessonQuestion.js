// models/LessonQuestion.js - Add timer field
import mongoose from "mongoose";

const lessonQuestionSchema = new mongoose.Schema({
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
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: String,
    required: true,
  },
  rationale: {
    type: String,
    default: "",
  },
  points: {
    type: Number,
    default: 1,
  },
  order: {
    type: Number,
    default: 0,
  },
  // NEW: Timer in minutes for the entire quiz
  timerMinutes: {
    type: Number,
    default: 0, // 0 means no timer
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("LessonQuestion", lessonQuestionSchema);