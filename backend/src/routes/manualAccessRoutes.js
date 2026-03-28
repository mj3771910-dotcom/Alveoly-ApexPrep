import express from "express";
import {
  grantManualAccess,
  getMyManualAccess,
} from "../controllers/manualAccessController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ADMIN
router.post("/grant", protect, adminOnly, grantManualAccess);

// STUDENT
router.get("/mine", protect, getMyManualAccess);

export default router;