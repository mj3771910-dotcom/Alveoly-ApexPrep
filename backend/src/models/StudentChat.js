import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "ai"], required: true },
  content: { type: String, required: true },
});

const StudentChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [MessageSchema],
}, { timestamps: true });

export default mongoose.model("StudentChat", StudentChatSchema);