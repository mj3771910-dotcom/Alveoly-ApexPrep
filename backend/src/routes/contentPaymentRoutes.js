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

// routes/contentPaymentRoutes.js - Add this
router.get("/check-status/:reference", protect, async (req, res) => {
  try {
    const { reference } = req.params;
    const payment = await ContentPayment.findOne({ reference });
    
    if (!payment) {
      return res.json({ exists: false });
    }
    
    res.json({
      exists: true,
      status: payment.status,
      amount: payment.amount,
      contentId: payment.contentId,
      paidAt: payment.paidAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;