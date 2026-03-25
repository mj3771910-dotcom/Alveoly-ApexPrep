// controllers/aiGeneratorController.js
import AIGeneration from "../models/AIGeneration.js";
import { askAI } from "../services/aiService.js";

export const generateQuestions = async (req, res) => {
  try {
    const { subject, count = 5 } = req.body;

    if (!subject) {
      return res.status(400).json({ message: "Subject is required" });
    }

    const prompt = `
Generate ${count} multiple choice nursing questions on "${subject}".

Format strictly like this:

1. Question text
A. Option
B. Option
C. Option
D. Option
Answer: X
Rationale: Explanation
`;

    const aiResult = await askAI(prompt);

    // ✅ SAVE TO DATABASE
    const saved = await AIGeneration.create({
      subject,
      count,
      result: aiResult,
      createdBy: req.user?.id, // if using auth
    });

    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate questions" });
  }
};

// Get all history
export const getHistory = async (req, res) => {
  try {
    const data = await AIGeneration.find({ createdBy: req.user?.id })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

// Delete one
export const deleteHistory = async (req, res) => {
  try {
    await AIGeneration.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

