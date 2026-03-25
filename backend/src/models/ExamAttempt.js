import mongoose from "mongoose";

const examAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    userName: String,
    courseName: String,
    subjectName: String,

    questions: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        correct: String,
        selected: { type: String, default: "" },
        isCorrect: { type: Boolean, default: false },
      },
    ],

    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

    result: {
      type: String,
      enum: ["pass", "fail"],
      default: "fail",
    },

    status: {
      type: String,
      enum: ["in-progress", "submitted"],
      default: "in-progress",
      index: true,
    },

    attemptNumber: { type: Number, default: 1 },

    resitAllowed: { type: Boolean, default: false },

    startedAt: Date,
    submittedAt: Date,
    duration: Number,
  },
  { timestamps: true }
);


// ✅ AUTO CALCULATE RESULT
examAttemptSchema.pre("save", function () {
  this.totalQuestions = this.questions.length;
  this.correctAnswers = this.questions.filter(q => q.isCorrect).length;
  this.score = this.correctAnswers;

  this.percentage = this.totalQuestions
    ? Math.round((this.correctAnswers / this.totalQuestions) * 100)
    : 0;

  this.result = this.percentage >= 50 ? "pass" : "fail";
});


// ✅ 🔥 CRITICAL: ONLY ONE ACTIVE EXAM
examAttemptSchema.index(
  { userId: 1, courseId: 1, subjectId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "in-progress" },
  }
);

export default mongoose.model("ExamAttempt", examAttemptSchema);