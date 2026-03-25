import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    subject: String,
    message: String,
    status: {
      type: String,
      enum: ["pending", "replied"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);