import express from "express";
import { getTrialProgress, submitTrial } from "../controllers/trialController.js";
import { protect } from "../middleware/authMiddleware.js"; // if you use auth

const router = express.Router();

router.post("/submit", protect, submitTrial);
router.get("/progress", protect, getTrialProgress);

export default router;