import QA from "../models/QA.js";
import { askAI } from "../services/aiService.js";
import UserAISubscription from "../models/UserAISubscription.js";
// get history
import StudentChat from "../models/StudentChat.js";

// Student asks AI question
export const askStudentAI = async (req, res) => {
  try {
    const { question, chatId } = req.body;
    if (!question) return res.status(400).json({ message: "Question required" });

    // ✅ subscription guaranteed by middleware
    const subscription = req.subscription;

    // Check admin QA first
    const existingQA = await QA.findOne({
      question: { $regex: new RegExp(`^${question}$`, "i") },
      fromAdmin: true
    });

    const answer = existingQA ? existingQA.answer : await askAI(question);
    const fromDB = !!existingQA;

    // Save to chat history
    let chat;
    if (chatId) {
      chat = await StudentChat.findById(chatId);
      if (!chat) throw new Error("Chat not found");
      chat.messages.push({ role: "user", content: question });
      chat.messages.push({ role: "ai", content: answer });
      await chat.save();
    } else {
      chat = await StudentChat.create({
        userId: req.user._id,
        messages: [
          { role: "user", content: question },
          { role: "ai", content: answer }
        ]
      });
    }

    res.json({ answer, fromDB, chatId: chat._id });
  } catch (err) {
    console.error("ASK AI ERROR:", err);
    res.status(500).json({ message: "Failed to get AI response" });
  }
};

export const getStudentChats = async (req, res) => {
  try {
    const chats = await StudentChat.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error("GET CHATS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};

// delete chat
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    const chat = await StudentChat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Ensure the logged-in user owns this chat
    if (chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this chat" });
    }

    await chat.deleteOne();
    return res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("DELETE CHAT ERROR:", err);
    return res.status(500).json({ message: "Failed to delete chat" });
  }
};