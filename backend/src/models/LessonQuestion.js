// models/LessonQuestion.js
import mongoose from "mongoose";

const lessonQuestionSchema = new mongoose.Schema({
  // Lesson association
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
  
  // Question content
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: String, // Letter (A, B, C, D)
    required: true,
  },
  rationale: {
    type: String,
    default: "",
  },
  
  // Settings
  points: {
    type: Number,
    default: 1,
  },
  order: {
    type: Number,
    default: 0,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
lessonQuestionSchema.index({ lessonId: 1, order: 1 });

export default mongoose.model("LessonQuestion", lessonQuestionSchema);