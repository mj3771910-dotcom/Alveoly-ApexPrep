import TrialAttempt from "../models/TrialAttempt.js";
import Question from "../models/Question.js";

// ================= SUBMIT TRIAL =================
export const submitTrial = async (req, res) => {
  try {
    const { subjectId, courseId, answers, duration } = req.body;

    // ✅ VALIDATION
    if (!subjectId || !courseId) {
      return res.status(400).json({
        message: "Missing subject or course",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        message: "Answers are required",
      });
    }

    // ================= GET QUESTIONS =================
    const questions = await Question.find({
      subjectId,
      courseId,
      type: "trial",
    });

    if (!questions.length) {
      return res.status(404).json({
        message: "No trial questions found",
      });
    }

    let score = 0;

    questions.forEach((q) => {
      const studentAnswer = String(answers[q._id] || "").trim().toUpperCase();
      const correctAnswer = String(q.correctAnswer || "").trim().toUpperCase();

      if (studentAnswer === correctAnswer) {
        score++;
      }
    });

    const totalQuestions = questions.length;

    const percentage = totalQuestions
      ? Math.round((score / totalQuestions) * 100)
      : 0;

    // ================= PERFORMANCE LEVEL =================
    let performance = "poor";

    if (percentage >= 80) performance = "excellent";
    else if (percentage >= 60) performance = "good";
    else if (percentage >= 40) performance = "average";

    // ================= SAVE ATTEMPT =================
    const attempt = await TrialAttempt.create({
      userId: req.user._id,
      subjectId,
      courseId,
      answers,
      score,
      percentage,
      totalQuestions,
      duration: duration || 0,
      performance,
    });

    res.json({
      message: "Trial submitted successfully",
      attempt,
    });

  } catch (error) {
    console.error("❌ Trial Submit Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= GET PROGRESS =================
export const getTrialProgress = async (req, res) => {
  try {
    const attempts = await TrialAttempt.find({
      userId: req.user._id,
    })
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    // ================= TOTAL STUDY TIME =================
    const totalTime = attempts.reduce(
      (acc, a) => acc + (a.duration || 0),
      0
    );

    // ================= AVERAGE SCORE =================
    const averageScore = attempts.length
      ? Math.round(
          attempts.reduce((acc, a) => acc + a.percentage, 0) /
            attempts.length
        )
      : 0;

    // ================= BEST SCORE =================
    const bestScore = attempts.length
      ? Math.max(...attempts.map((a) => a.percentage))
      : 0;

    // ================= RESPONSE =================
    res.json({
      attempts,
      stats: {
        totalAttempts: attempts.length,
        averageScore,
        bestScore,
        totalTime,
      },
    });

  } catch (error) {
    console.error("❌ Progress Error:", error);
    res.status(500).json({
      message: "Failed to fetch progress",
    });
  }
};