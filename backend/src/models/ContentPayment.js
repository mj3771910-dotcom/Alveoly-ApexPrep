// models/ContentPayment.js
import mongoose from "mongoose";

const contentPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
    },

    amount: Number,

    reference: String, // Paystack ref

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ContentPayment",
  contentPaymentSchema
);