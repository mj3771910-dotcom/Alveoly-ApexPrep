// src/routes/adminRoutes.js
import express from "express";
import {
  getExamResults,
  deleteExamAttempt,
  allowResit,
  getExamDetails,  // Add this import
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/exam-results", protect, adminOnly, getExamResults);
router.delete("/exam-attempt/:attemptId", protect, adminOnly, deleteExamAttempt);
router.patch("/exam-attempt/:attemptId/resit", protect, adminOnly, allowResit);
router.get("/exam-attempt/:attemptId/details", protect, adminOnly, getExamDetails);  // Add this route

export default router;