// routes/aiPlanRoutes.js
import express from "express";
import { createPlan, updatePlan, deletePlan, getPlans } from "../controllers/aiPlanController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/", protect, adminOnly, createPlan);
router.put("/:id", protect, adminOnly, updatePlan);
router.delete("/:id", protect, adminOnly, deletePlan);

// Public/Student
router.get("/", protect, getPlans);

export default router;