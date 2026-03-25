// models/AIChat.js
import mongoose from "mongoose";

const aiChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    messages: [
      {
        role: { type: String, enum: ["user", "ai"] },
        content: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("AIChat", aiChatSchema);