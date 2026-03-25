import mongoose from "mongoose";

const trialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    answers: {
      type: Object,
      default: {},
    },

    score: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    // 🔥 NEW (VERY IMPORTANT)
    totalQuestions: {
      type: Number,
      default: 0,
    },

    // 🔥 REAL TIME TRACKING (seconds)
    duration: {
      type: Number,
      default: 0, // in seconds
    },

    // 🔥 PERFORMANCE LEVEL (for analytics later)
    performance: {
      type: String,
      enum: ["excellent", "good", "average", "poor"],
      default: "average",
    },

    // 🔥 OPTIONAL (future AI insights)
    weakAreas: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("TrialAttempt", trialSchema);