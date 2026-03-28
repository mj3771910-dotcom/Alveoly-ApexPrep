import express from "express";
import {
  grantManualAccess,
  getMyManualAccess,
  getAllManualAccess,
} from "../controllers/manualAccessController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ADMIN
router.post("/grant", protect, adminOnly, grantManualAccess);

// STUDENT
router.get("/mine", protect, getMyManualAccess);

router.get("/all", protect, adminOnly, getAllManualAccess);

export default router;