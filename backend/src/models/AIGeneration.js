// models/AIGeneration.js
import mongoose from "mongoose";

const aiGenerationSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    count: { type: Number, default: 5 },
    result: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("AIGeneration", aiGenerationSchema);