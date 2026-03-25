import express from "express";
import {
  deletePayment,
  getAllPayments,
  getMyPayments,
  initiatePayment,
  initiatePlanPayment,
  verifyPayment,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireActivePlan } from "../middleware/planMiddleware.js"; // ✅ NEW

const router = express.Router();

/**
 * ================= PAYMENT ROUTES =================
 */

// Subject payment
router.post("/initiate", protect, initiatePayment);

// Plan payment
router.post("/initiate-plan", protect, initiatePlanPayment);

// Verify payment (public callback from Paystack)
router.get("/verify", verifyPayment);

// User payments history
router.get("/mine", protect, getMyPayments);

// Admin payments (you can later restrict with role middleware)
router.get("/", protect, getAllPayments);

router.delete("/:id", protect, deletePayment);

export default router;