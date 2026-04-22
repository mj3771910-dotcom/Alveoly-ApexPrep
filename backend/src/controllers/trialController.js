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
    const detailedResults = [];

    // Calculate score by comparing answer letters
    questions.forEach((question) => {
      const studentAnswer = answers[question._id];
      const correctAnswer = question.correctAnswer;
      
      // Direct comparison of letters (A, B, C, D)
      const isCorrect = studentAnswer && correctAnswer && studentAnswer === correctAnswer;
      
      if (isCorrect) {
        score++;
      }

      detailedResults.push({
        questionId: question._id,
        question: question.question,
        userAnswer: studentAnswer || null,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        userAnswerText: studentAnswer ? question.options[studentAnswer.charCodeAt(0) - 65] : null,
        correctAnswerText: correctAnswer ? question.options[correctAnswer.charCodeAt(0) - 65] : null
      });
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

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
      detailedResults, // Save detailed results for future reference
    });

    res.json({
      message: "Trial submitted successfully",
      attempt: {
        _id: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
        performance: attempt.performance,
        totalQuestions: attempt.totalQuestions,
        duration: attempt.duration,
        createdAt: attempt.createdAt
      }
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
      .populate("courseId", "name")
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

    // ================= SUBJECT WISE PERFORMANCE =================
    const subjectWise = {};
    attempts.forEach(attempt => {
      const subjectName = attempt.subjectId?.name || "Unknown Subject";
      if (!subjectWise[subjectName]) {
        subjectWise[subjectName] = {
          totalScore: 0,
          count: 0,
          bestScore: 0
        };
      }
      subjectWise[subjectName].totalScore += attempt.percentage;
      subjectWise[subjectName].count++;
      subjectWise[subjectName].bestScore = Math.max(subjectWise[subjectName].bestScore, attempt.percentage);
    });

    // Calculate averages for each subject
    Object.keys(subjectWise).forEach(subject => {
      subjectWise[subject].averageScore = Math.round(subjectWise[subject].totalScore / subjectWise[subject].count);
    });

    // ================= RESPONSE =================
    res.json({
      attempts,
      stats: {
        totalAttempts: attempts.length,
        averageScore,
        bestScore,
        totalTime,
        subjectWise
      },
    });

  } catch (error) {
    console.error("❌ Progress Error:", error);
    res.status(500).json({
      message: "Failed to fetch progress",
    });
  }
};

// ================= GET SINGLE TRIAL DETAILS =================
export const getTrialDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await TrialAttempt.findById(attemptId)
      .populate("subjectId", "name")
      .populate("courseId", "name");
    
    if (!attempt) {
      return res.status(404).json({ message: "Trial attempt not found" });
    }
    
    // Check if the user owns this attempt
    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to view this attempt" });
    }
    
    res.json(attempt);
  } catch (error) {
    console.error("❌ Get Trial Details Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};