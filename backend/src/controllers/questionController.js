import Question from "../models/Question.js";
import { io } from "../../server.js";

// GET QUESTIONS
export const getQuestions = async (req, res) => {
  try {
    const { courseId, subjectId } = req.query;

    const filter = {};

    // ✅ Only apply valid ObjectIds
   if (courseId && courseId !== "undefined" && courseId !== "null") {
  filter.courseId = courseId;
}

if (subjectId && subjectId !== "undefined" && subjectId !== "null") {
  filter.subjectId = subjectId;
}
    const questions = await Question.find(filter);
    res.json(questions);
  } catch (error) {
    console.error("Get Questions Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// CREATE SINGLE QUESTION
export const createQuestion = async (req, res) => {
  try {
    const data = req.body;

    const cleanOptions = data.options.filter(opt => opt.trim() !== "");

    const answerIndex = data.correctAnswer?.charCodeAt(0) - 65;

    const correctAnswerValue = cleanOptions[answerIndex];

    const isLocked =
      data.type === "exam"
        ? data.isExamLocked || false
        : false;

    const question = await Question.create({
      ...data,
      options: cleanOptions,
      correctAnswer: correctAnswerValue,
      isLocked,
    });

    io.emit("question:created", question);
    res.status(201).json(question);

  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// CREATE MULTIPLE QUESTIONS
export const createMultipleQuestions = async (req, res) => {
  try {
    const questionsData = req.body.questions;

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return res.status(400).json({ message: "No questions provided" });
    }

    const createdQuestions = [];

    for (const data of questionsData) {

      // ✅ VALIDATION
      if (!data.courseId || !data.subjectId || !data.question) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!Array.isArray(data.options) || data.options.length < 2) {
        return res.status(400).json({ message: "At least 2 options required" });
      }

      // ✅ CLEAN OPTIONS (REMOVE EMPTY)
      const cleanOptions = data.options.filter(opt => opt.trim() !== "");

      if (cleanOptions.length < 2) {
        return res.status(400).json({ message: "Options cannot be empty" });
      }

      // ✅ FIX CORRECT ANSWER (convert A → actual value)
      const answerIndex = data.correctAnswer?.charCodeAt(0) - 65;

      if (answerIndex < 0 || answerIndex >= cleanOptions.length) {
        return res.status(400).json({ message: "Invalid correct answer" });
      }

      const correctAnswerValue = cleanOptions[answerIndex];

      // ✅ FIX LOCK LOGIC
      const isLocked =
        data.type === "exam"
          ? data.isExamLocked || false
          : false;

      const question = await Question.create({
        ...data,
        options: cleanOptions,
        correctAnswer: correctAnswerValue,
        isLocked,
      });

      createdQuestions.push(question);
      io.emit("question:created", question);
    }

    res.status(201).json(createdQuestions);

  } catch (error) {
    console.error("🔥 Create Multiple Questions Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE QUESTION
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    // Use deleteOne instead of remove (remove is deprecated)
    await Question.deleteOne({ _id: req.params.id });

    // Emit socket event
    io.emit("question:deleted", req.params.id);

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Delete Question Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE QUESTION
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    Object.assign(question, req.body);
    const updated = await question.save();

    io.emit("question:updated", updated);
    res.json(updated);
  } catch (error) {
    console.error("Update Question Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const submitTrial = async (req, res) => {
  try {
    const { subjectId, courseId, answers } = req.body;

    if (!subjectId || !courseId) {
      return res.status(400).json({ message: "Missing subject or course" });
    }

    // OPTIONAL: you can calculate score here if you want
    // or just save attempts

    console.log("📤 Trial Submission:", {
      subjectId,
      courseId,
      answers,
      user: req.user?._id,
    });

    res.json({
      message: "Trial submitted successfully",
    });

  } catch (error) {
    console.error("Trial Submit Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};