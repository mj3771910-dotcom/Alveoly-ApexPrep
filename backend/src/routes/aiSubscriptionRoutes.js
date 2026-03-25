import express from "express";
import {
  subscribeToPlan,
  verifyPayment,
  getSubscription,
} from "../controllers/aiSubscriptionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ VERIFY PAYMENT (called from frontend)
router.get("/verify", protect, verifyPayment);

// ✅ INIT PAYMENT
router.post("/", protect, subscribeToPlan);

// ✅ GET CURRENT SUB
router.get("/", protect, getSubscription);

export default router;