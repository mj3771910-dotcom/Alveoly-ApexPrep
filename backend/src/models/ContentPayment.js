// models/ContentPayment.js
import mongoose from "mongoose";

const contentPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content", required: true, index: true },
  amount: { type: Number, required: true },
  reference: { type: String, unique: true, index: true },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate purchases
contentPaymentSchema.index({ userId: 1, contentId: 1, status: 1 });

export default mongoose.model("ContentPayment", contentPaymentSchema);