import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";
import TrialAttempt from "../models/TrialAttempt.js";

export const getStudentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ QUESTIONS (based on student's course)
    const totalQuestions = await Question.countDocuments({
      courseId: req.user.courseId,
    });

    // ✅ EXAMS TAKEN
    const examsTaken = await ExamAttempt.countDocuments({
      userId,
      status: "submitted",
    });

    // ✅ PERFORMANCE (average of exams + trials)
    const examResults = await ExamAttempt.find({
      userId,
      status: "submitted",
    });

    const trialResults = await TrialAttempt.find({ userId });

    const allScores = [
      ...examResults.map((e) => e.percentage || 0),
      ...trialResults.map((t) => t.percentage || 0),
    ];

    const averagePerformance = allScores.length
      ? Math.round(
          allScores.reduce((a, b) => a + b, 0) / allScores.length
        )
      : 0;

    res.json({
      totalQuestions,
      examsTaken,
      averagePerformance,
    });
  } catch (err) {
    console.error("Student Stats Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};