// routes/contentPaymentRoutes.js
import express from "express";
import {
  initiateContentPayment,
  verifyContentPayment,
  checkContentAccess,
  getUserPurchasedContent,
} from "../controllers/contentPaymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/initiate", protect, initiateContentPayment);
router.post("/verify", protect, verifyContentPayment);
router.get("/check/:contentId", protect, checkContentAccess);
router.get("/my-purchases", protect, getUserPurchasedContent);

export default router;