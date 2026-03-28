import express from "express";
import { initiateContentPayment } from "../controllers/contentPaymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/pay", protect, initiateContentPayment);

export default router;