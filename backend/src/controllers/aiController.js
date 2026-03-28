import QA from "../models/QA.js";
import { askAI } from "../services/aiService.js";
import { io } from "../../server.js"; // Socket.io
import fs from "fs";
import csvParser from "csv-parser"; // for CSV files
import path from "path";

// Upload file and save QAs
export const uploadQAFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const ext = path.extname(req.file.originalname).toLowerCase();

    const qaArray = [];

    if (ext === ".json") {
      // JSON format: [{ question: "", answer: "" }, ...]
      const data = fs.readFileSync(req.file.path, "utf-8");
      const json = JSON.parse(data);
      json.forEach((item) => {
        if (item.question && item.answer) {
          qaArray.push({ question: item.question, answer: item.answer, fromAdmin: true });
        }
      });
    } else if (ext === ".csv") {
      // CSV format: question,answer
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csvParser())
          .on("data", (row) => {
            if (row.question && row.answer) {
              qaArray.push({ question: row.question, answer: row.answer, fromAdmin: true });
            }
          })
          .on("end", resolve)
          .on("error", reject);
      });
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    // Bulk insert
    if (qaArray.length > 0) {
      const created = await QA.insertMany(qaArray);

      // Emit socket events for each new QA
      created.forEach((qa) => {
        io.emit("newQA", { id: qa._id, question: qa.question, answer: qa.answer, fromAdmin: true });
      });
    }

    // Delete the temp uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ message: `${qaArray.length} QAs uploaded successfully` });
  } catch (err) {
    console.error("File Upload Error:", err);
    res.status(500).json({ message: "Failed to upload file" });
  }
};

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
