import QA from "../models/QA.js";
import { askAI } from "../services/aiService.js";
import { io } from "../../server.js"; // Socket.io

// Admin adds QA
export const askQuestionAdmin = async (req, res) => {
  try {
    const { question, manualAnswer } = req.body;
    if (!question || !manualAnswer)
      return res.status(400).json({ message: "Question and answer required" });

    const qa = new QA({ question, answer: manualAnswer, fromAdmin: true });
    await qa.save();

    io.emit("newQA", { id: qa._id, question: qa.question, answer: qa.answer, fromAdmin: true });
    res.json({ message: "QA saved", qa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save QA" });
  }
};

// Admin updates QA
export const updateQA = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    const qa = await QA.findByIdAndUpdate(
      id,
      { question, answer, fromAdmin: true },
      { new: true }
    );

    io.emit("updateQA", { id: qa._id, question: qa.question, answer: qa.answer, fromAdmin: true });
    res.json(qa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update QA" });
  }
};

// Admin deletes QA
export const deleteQA = async (req, res) => {
  try {
    const { id } = req.params;
    await QA.findByIdAndDelete(id);

    io.emit("deleteQA", id);
    res.json({ message: "QA deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete QA" });
  }
};

// Admin fetch all QA
export const getAllAdminQA = async (req, res) => {
  const qas = await QA.find({ fromAdmin: true }).sort({ createdAt: -1 });
  res.json(qas.map(q => ({ id: q._id, question: q.question, answer: q.answer, fromAdmin: q.fromAdmin })));
};

// Student asks question → only fetch admin-approved answers
export const askQuestionStudent = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "Question required" });

    const existingQA = await QA.findOne({ 
      question: { $regex: new RegExp(`^${question}$`, "i") },
      fromAdmin: true
    });

    if (existingQA) {
      return res.json({ answer: existingQA.answer, fromDB: true });
    }

    const answer = await askAI(question);
    res.json({ answer, fromDB: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "Something went wrong" });
  }
};
