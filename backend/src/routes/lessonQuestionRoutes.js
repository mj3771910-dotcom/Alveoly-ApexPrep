// routes/lessonQuestionRoutes.js
import express from "express";
import {
  saveLessonQuestions,
  getLessonQuestions,
  startLessonQuiz,
  submitLessonQuiz,
  getStudentProgress,
  getLessonPerformance,
} from "../controllers/lessonQuestionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/save", protect, adminOnly, saveLessonQuestions);
router.get("/lesson/:lessonId", protect, adminOnly, getLessonQuestions);
router.get("/lesson/:lessonId/performance", protect, adminOnly, getLessonPerformance);

// Student routes
router.post("/start/:lessonId", protect, startLessonQuiz);
router.post("/submit", protect, submitLessonQuiz);
router.get("/student/:studentId/progress", protect, adminOnly, getStudentProgress);
router.get("/student/:studentId/subject/:subjectId/progress", protect, adminOnly, getStudentProgress);

export default router;