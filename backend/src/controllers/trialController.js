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

    // Calculate score by comparing answer text
    questions.forEach((question) => {
      const studentAnswerLetter = answers[question._id.toString()];
      
      // Get the actual text of the student's answer
      let studentAnswerText = null;
      if (studentAnswerLetter && question.options) {
        const optionIndex = studentAnswerLetter.charCodeAt(0) - 65;
        studentAnswerText = question.options[optionIndex];
      }
      
      // The correct answer is stored as TEXT in the database
      const correctAnswerText = question.correctAnswer;
      
      // Compare the TEXT of the answers
      const isCorrect = studentAnswerText && correctAnswerText && 
        studentAnswerText.toLowerCase().trim() === correctAnswerText.toLowerCase().trim();
      
      if (isCorrect) {
        score++;
      }

      detailedResults.push({
        questionId: question._id,
        question: question.question,
        userAnswer: studentAnswerLetter || null,
        userAnswerText: studentAnswerText,
        correctAnswer: correctAnswerText,
        isCorrect: isCorrect,
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
      detailedResults,
    });

    res.status(200).json({
      success: true,
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
      success: false,
      message: "Server error: " + error.message,
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

    const totalTime = attempts.reduce((acc, a) => acc + (a.duration || 0), 0);
    
    const averageScore = attempts.length
      ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
      : 0;

    const bestScore = attempts.length
      ? Math.max(...attempts.map((a) => a.percentage))
      : 0;

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

    Object.keys(subjectWise).forEach(subject => {
      subjectWise[subject].averageScore = Math.round(subjectWise[subject].totalScore / subjectWise[subject].count);
    });

    res.json({
      success: true,
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
      success: false,
      message: "Failed to fetch progress: " + error.message,
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
    
    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to view this attempt" });
    }
    
    res.json({
      success: true,
      attempt
    });
  } catch (error) {
    console.error("❌ Get Trial Details Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};