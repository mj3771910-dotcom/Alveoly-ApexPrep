import express from "express";
import {
  grantManualAccess,
  getMyManualAccess,
  getAllManualAccess,
  toggleManualAccess,
  updateManualAccess,
  deleteManualAccess,
} from "../controllers/manualAccessController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ADMIN
router.post("/grant", protect, adminOnly, grantManualAccess);

// STUDENT
router.get("/mine", protect, getMyManualAccess);

router.get("/all", protect, adminOnly, getAllManualAccess);

router.delete("/:id", protect, adminOnly, deleteManualAccess);
router.put("/:id", protect, adminOnly, updateManualAccess);
router.patch("/:id/toggle", protect, adminOnly, toggleManualAccess);
export default router;