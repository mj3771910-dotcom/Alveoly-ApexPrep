// routes/lessonQuestionRoutes.js
import express from "express";
import {
  saveLessonQuestions,
  getLessonQuestions,
  startLessonQuiz,
  submitLessonQuiz,
  getStudentProgress,
  getLessonPerformance,
  allowRetake,
} from "../controllers/lessonQuestionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin only routes
router.post("/save", protect, adminOnly, saveLessonQuestions);
router.get("/lesson/:lessonId/performance", protect, adminOnly, getLessonPerformance);

// Routes accessible by both admin AND students (for checking if quiz exists)
router.get("/lesson/:lessonId", protect, getLessonQuestions); // ← REMOVED adminOnly

// Student routes
router.post("/start/:lessonId", protect, startLessonQuiz);
router.post("/submit", protect, submitLessonQuiz);
router.get("/student/:studentId/progress", protect, adminOnly, getStudentProgress);
router.get("/student/:studentId/subject/:subjectId/progress", protect, adminOnly, getStudentProgress);
// routes/lessonQuestionRoutes.js - Add this route
router.post("/allow-retake/:attemptId", protect, adminOnly, allowRetake);

export default router;