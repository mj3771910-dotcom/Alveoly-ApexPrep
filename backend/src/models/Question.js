import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    type: { type: String, enum: ["trial", "exam"] },
    examTime: Number,
    question: String,
    options: [String],
    correctAnswer: String,
    rationale: String,
    isLocked: Boolean,
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);