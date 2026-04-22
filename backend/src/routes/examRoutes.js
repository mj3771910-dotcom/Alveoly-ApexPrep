import express from "express";
import {
  startExam,
  saveProgress,
  submitExam,
  getExamResults,
  deleteExamAttempt,
  allowResit,
  getExamDetails,
} from "../controllers/examController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// STUDENT ROUTES
router.post("/start", protect, startExam);
router.post("/save-progress", protect, saveProgress);
router.post("/submit", protect, submitExam);

// ADMIN ROUTES
router.get("/admin/exam-results", protect, getExamResults);
router.delete("/admin/exam-attempt/:attemptId", protect, deleteExamAttempt);
router.patch("/admin/exam-attempt/:attemptId/resit", protect, allowResit);
router.get("/admin/exam-attempt/:attemptId/details", protect, getExamDetails);
export default router;