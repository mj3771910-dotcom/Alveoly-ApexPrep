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
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/save", protect, admin, saveLessonQuestions);
router.get("/lesson/:lessonId", protect, admin, getLessonQuestions);
router.get("/lesson/:lessonId/performance", protect, admin, getLessonPerformance);

// Student routes
router.post("/start/:lessonId", protect, startLessonQuiz);
router.post("/submit", protect, submitLessonQuiz);
router.get("/student/:studentId/progress", protect, admin, getStudentProgress);
router.get("/student/:studentId/subject/:subjectId/progress", protect, admin, getStudentProgress);

export default router;