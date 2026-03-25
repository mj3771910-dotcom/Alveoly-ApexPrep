import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getDashboardStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);

export default router;