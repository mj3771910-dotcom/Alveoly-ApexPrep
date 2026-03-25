// models/QA.js
import mongoose from "mongoose";

const QASchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  fromAdmin: { type: Boolean, default: false }, // ✅ only admin-approved
}, { timestamps: true });

export default mongoose.model("QA", QASchema);