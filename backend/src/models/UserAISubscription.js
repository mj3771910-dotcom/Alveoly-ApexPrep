// models/UserAISubscription.js
import mongoose from "mongoose";

const UserAISubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "AISubscriptionPlan", required: true },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  paymentStatus: { type: String, enum: ["pending","completed","failed"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("UserAISubscription", UserAISubscriptionSchema);