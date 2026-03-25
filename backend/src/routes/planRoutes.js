import express from "express";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/planController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPlans);
router.post("/", protect, createPlan);
router.put("/:id", protect, updatePlan);
router.delete("/:id", protect, deletePlan);

export default router;