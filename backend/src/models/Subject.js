// models/Subject.js
import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: String,

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },

    // ✅ ADD THIS
    studentsUnlocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);