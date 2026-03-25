// models/AISubscriptionPlan.js
import mongoose from "mongoose";

const AISubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true }, // in your currency
  durationValue: { type: Number, required: true }, // e.g., 7
  durationUnit: { type: String, enum: ["minutes","hours","days","weeks","months","years"], required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("AISubscriptionPlan", AISubscriptionPlanSchema);