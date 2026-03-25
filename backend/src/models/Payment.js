import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },

    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },

    amount: Number,
    reference: { type: String, index: true },

    status: { type: String, default: "pending", index: true },

    expiresAt: { type: Date },

    accessType: {
      type: String,
      enum: ["plan", "subject"],
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);