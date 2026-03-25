import express from "express";
import {
  getAdminDashboard,
  getStudentDashboard,
} from "../controllers/dashboardController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ADMIN
router.get("/admin", protect, adminOnly, getAdminDashboard);

// STUDENT
router.get("/student", protect, getStudentDashboard);

export default router;