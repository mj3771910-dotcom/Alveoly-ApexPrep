import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";
import mongoose from "mongoose";

// ✅ START EXAM
export const startExam = async (req, res) => {
  try {
    const { courseId, subjectId } = req.body;

    if (!courseId || !subjectId) {
      return res.status(400).json({ message: "Course and Subject required" });
    }

    // Check for existing in-progress attempt
    let attempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
      status: "in-progress"
    });

    // Get questions
    const questions = await Question.find({
      courseId,
      subjectId,
      type: "exam",
    });

    if (!questions.length) {
      return res.status(404).json({ message: "No exam questions found" });
    }

    const duration = (questions[0].examTime || 30) * 60;

    // If there's an in-progress attempt, return it
    if (attempt && attempt.status === "in-progress") {
      return res.json({
        attemptId: attempt._id,
        questions,
        duration: attempt.duration,
      });
    }

    // Check for submitted attempt without resit
    const submittedAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
      status: "submitted",
      resitAllowed: false
    });

    if (submittedAttempt) {
      return res.status(403).json({
        message: "You have already completed this exam. Resit not allowed.",
      });
    }

    // Get attempt number
    const lastAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
    }).sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Create new attempt
    attempt = await ExamAttempt.create({
      userId: req.user._id,
      courseId,
      subjectId,
      userName: req.user.name,
      courseName: questions[0].courseName || "N/A",
      subjectName: questions[0].subjectName || "N/A",
      questions: questions.map((q) => ({
        questionId: q._id,
        questionText: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale
      })),
      attemptNumber,
      status: "in-progress",
      startedAt: new Date(),
      duration,
      resitAllowed: false,
    });

    res.json({
      attemptId: attempt._id,
      questions,
      duration,
    });

  } catch (err) {
    console.error("Start Exam Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ✅ SAVE PROGRESS
export const saveProgress = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }

    if (attempt.status === "submitted") {
      return res.status(403).json({
        message: "Cannot save a submitted exam.",
      });
    }

    // Save answers
    attempt.answers = answers;
    await attempt.save();

    res.json({ message: "Progress saved" });

  } catch (err) {
    console.error("Save Progress Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ✅ SUBMIT EXAM - FIXED VERSION
export const submitExam = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId) {
      return res.status(400).json({ message: "Attempt ID required" });
    }

    // Find the exam attempt and populate questions
    const attempt = await ExamAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }

    if (attempt.status === "submitted") {
      return res.status(403).json({ message: "Exam already submitted" });
    }

    // Get all questions for this exam
    const questions = await Question.find({
      _id: { $in: attempt.questions.map(q => q.questionId) }
    });

    // Calculate score
    let correctCount = 0;
    const questionResults = [];

    for (const question of questions) {
      const userAnswer = answers[question._id.toString()];
      const isCorrect = userAnswer && userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }

      questionResults.push({
        questionId: question._id,
        questionText: question.question,
        userAnswer: userAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        rationale: question.rationale
      });
    }

    const totalQuestions = questions.length;
    const score = correctCount;
    const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
    const result = percentage >= 50 ? 'pass' : 'fail';

    // Update attempt
    attempt.answers = answers;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.result = result;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';
    attempt.questionResults = questionResults;
    
    await attempt.save();

    res.json({
      success: true,
      score,
      percentage,
      result,
      totalQuestions,
      questionResults
    });

  } catch (error) {
    console.error("Submit Exam Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// ✅ ADMIN GET RESULTS
export const getExamResults = async (req, res) => {
  try {
    const { courseId, subjectId, userId } = req.query;

    const filter = { status: "submitted" };

    if (courseId) filter.courseId = new mongoose.Types.ObjectId(courseId);
    if (subjectId) filter.subjectId = new mongoose.Types.ObjectId(subjectId);
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);

    const results = await ExamAttempt.find(filter)
      .populate('userId', 'name email')
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .sort({ submittedAt: -1 });

    // Get only the latest attempt per student per subject
    const latestResults = {};
    results.forEach(result => {
      const key = `${result.userId?._id}-${result.subjectId?._id}`;
      if (!latestResults[key] || result.submittedAt > latestResults[key].submittedAt) {
        latestResults[key] = result;
      }
    });

    res.json(Object.values(latestResults));

  } catch (err) {
    console.error("Get Results Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ✅ ADMIN DELETE
export const deleteExamAttempt = async (req, res) => {
  try {
    const deleted = await ExamAttempt.findByIdAndDelete(req.params.attemptId);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ✅ ADMIN RESIT
export const allowResit = async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: "Not found" });

    attempt.resitAllowed = true;
    await attempt.save();
    res.json({ message: "Resit allowed successfully" });
  } catch (err) {
    console.error("Resit Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};