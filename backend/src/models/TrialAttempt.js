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

    // 🔥 DETAILED RESULTS FOR EACH QUESTION
    detailedResults: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        question: {
          type: String,
        },
        userAnswer: {
          type: String,
          default: null,
        },
        correctAnswer: {
          type: String,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        userAnswerText: {
          type: String,
          default: null,
        },
        correctAnswerText: {
          type: String,
          default: null,
        },
      },
    ],

    // 🔥 OPTIONAL (future AI insights)
    weakAreas: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Add an index for faster queries
trialSchema.index({ userId: 1, createdAt: -1 });
trialSchema.index({ subjectId: 1, courseId: 1 });

export default mongoose.model("TrialAttempt", trialSchema);