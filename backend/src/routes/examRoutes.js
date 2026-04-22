import express from "express";
import {
  startExam,
  saveProgress,
  submitExam,
} from "../controllers/examController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// STUDENT ROUTES ONLY
router.post("/start", protect, startExam);
router.post("/save-progress", protect, saveProgress);
router.post("/submit", protect, submitExam);

export default router;