import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";
import mongoose from "mongoose";   // ← Added this (was missing)
import { io } from "../../server.js";

// ✅ START EXAM - Only one attempt unless resit allowed
export const startExam = async (req, res) => {
  try {
    const { courseId, subjectId } = req.body;

    if (!courseId || !subjectId) {
      return res.status(400).json({ message: "Course and Subject required" });
    }

    let attempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
    }).sort({ createdAt: -1 });

    const questions = await Question.find({
      courseId,
      subjectId,
      type: "exam",
    });

    if (!questions.length) {
      return res.status(404).json({ message: "No exam questions found" });
    }

    const duration = (questions[0].examTime || 30) * 60;

    if (attempt) {
      if (attempt.status === "submitted" && !attempt.resitAllowed) {
        return res.status(403).json({
          message: "You have already completed this exam.",
        });
      }

      if (attempt.status === "in-progress") {
        return res.json({
          attemptId: attempt._id,
          questions,
          duration: attempt.duration,
        });
      }
    }

    const lastAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
    }).sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    attempt = await ExamAttempt.create({
      userId: req.user._id,
      courseId,
      subjectId,
      userName: req.user.name,
      courseName: questions[0].courseName || "N/A",
      subjectName: questions[0].subjectName || "N/A",

      questions: questions.map((q) => ({
        questionId: q._id,
        correct: q.correctAnswer,
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
    res.status(500).json({ message: "Server Error" });
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

    attempt.questions = attempt.questions.map((q) => {
      const selected = answers[q.questionId] || q.selected;

      const studentAns = String(selected || "").trim().toUpperCase();
      const correctAns = String(q.correct || "").trim().toUpperCase();

      return {
        ...q.toObject(),
        selected,
        isCorrect: studentAns === correctAns,
      };
    });

    await attempt.save();

    res.json({ message: "Progress saved" });

  } catch (err) {
    console.error("Save Progress Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ SUBMIT EXAM
export const submitExam = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }

    if (attempt.status === "submitted") {
      return res.status(200).json({
        message: "Already submitted",
        score: attempt.score,
        percentage: attempt.percentage,
      });
    }

    attempt.questions = attempt.questions.map((q) => {
      const selected = answers[q.questionId] || q.selected;

      const studentAns = String(selected || "").trim().toUpperCase();
      const correctAns = String(q.correct || "").trim().toUpperCase();

      return {
        ...q.toObject(),
        selected,
        isCorrect: studentAns === correctAns,
      };
    });

    // ✅ Calculate score and percentage (this was missing before!)
    let calculatedScore = 0;
    attempt.questions.forEach((q) => {
      if (q.isCorrect) calculatedScore++;
    });

    attempt.score = calculatedScore;
    attempt.percentage = attempt.questions.length
      ? Math.round((calculatedScore / attempt.questions.length) * 100)
      : 0;

    attempt.status = "submitted";
    attempt.submittedAt = new Date();

    await attempt.save();

    io.emit("exam:submitted", {
      attemptId: attempt._id,
      user: attempt.userId,
    });

    res.json({
      message: "Exam submitted",
      score: attempt.score,
      percentage: attempt.percentage,
    });

  } catch (err) {
    console.error("Submit Exam Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ ADMIN GET RESULTS - only latest attempt per student to avoid duplicates
export const getExamResults = async (req, res) => {
  try {
    const { courseId, subjectId, userId } = req.query;

    const filter = { status: "submitted" };

    if (courseId) filter.courseId = new mongoose.Types.ObjectId(courseId);
    if (subjectId) filter.subjectId = new mongoose.Types.ObjectId(subjectId);
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);

    const results = await ExamAttempt.aggregate([
      { $match: filter },

      // 🔥 Strong sorting
      { $sort: { submittedAt: -1, _id: -1 } },

      {
        $group: {
          _id: {
            userId: "$userId",
            courseId: "$courseId",
            subjectId: "$subjectId",
          },
          attemptId: { $first: "$_id" },
          userId: { $first: "$userId" },
          courseId: { $first: "$courseId" },
          subjectId: { $first: "$subjectId" },
          userName: { $first: "$userName" },
          courseName: { $first: "$courseName" },
          subjectName: { $first: "$subjectName" },
          score: { $first: "$score" },
          percentage: { $first: "$percentage" },
          result: { $first: "$result" },
          resitAllowed: { $first: "$resitAllowed" },
          submittedAt: { $first: "$submittedAt" },
        },
      },

      { $sort: { submittedAt: -1 } },
    ]);

    const cleanResults = results.map((r) => ({
      ...r,
      _id: r.attemptId,
    }));

    res.json(cleanResults);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ ADMIN DELETE
export const deleteExamAttempt = async (req, res) => {
  try {
    const deleted = await ExamAttempt.findByIdAndDelete(req.params.attemptId);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ ADMIN RESIT
export const allowResit = async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: "Not found" });

    attempt.resitAllowed = true;
    await attempt.save();
    res.json({ message: "Resit allowed" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};