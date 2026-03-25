import express from "express";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectById,
} from "../controllers/subjectController.js";

import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { requireSubjectAccess } from "../middleware/accessMiddleware.js";


const router = express.Router();

/**
 * ================= STUDENT ACCESS =================
 * Must have:
 * - Logged in
 * - Active (non-expired) plan
 */
router.get("/", getSubjects);

router.get("/:subjectId", protect, requireSubjectAccess, getSubjectById);

/**
 * ================= ADMIN ACCESS =================
 * Admin can manage subjects without plan restriction
 */
router.post("/", protect, adminOnly, createSubject);

router.put("/:id", protect, adminOnly, updateSubject);

router.delete("/:id", protect, adminOnly, deleteSubject);

export default router;