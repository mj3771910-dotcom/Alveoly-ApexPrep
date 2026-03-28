import QA from "../models/QA.js";
import { io } from "../../server.js";
import fs from "fs";
import csvParser from "csv-parser";
import path from "path";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";

// Upload file and save QAs
export const uploadQAFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const qaArray = [];

    if (ext === ".json") {
      const data = fs.readFileSync(req.file.path, "utf-8");
      const json = JSON.parse(data);
      json.forEach((item) => {
        if (item.question && item.answer)
          qaArray.push({ question: item.question, answer: item.answer, fromAdmin: true });
      });
    } else if (ext === ".csv") {
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csvParser())
          .on("data", (row) => {
            if (row.question && row.answer)
              qaArray.push({ question: row.question, answer: row.answer, fromAdmin: true });
          })
          .on("end", resolve)
          .on("error", reject);
      });
    } else if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      // Split lines, assume format "Q: ... A: ..."
      const lines = pdfData.text.split("\n");
      for (let line of lines) {
        if (line.toLowerCase().startsWith("q:")) {
          const parts = line.split("A:");
          if (parts.length === 2) {
            qaArray.push({
              question: parts[0].replace(/^Q:/i, "").trim(),
              answer: parts[1].trim(),
              fromAdmin: true,
            });
          }
        }
      }
    } else if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      // OCR for images
      const { data: { text } } = await Tesseract.recognize(req.file.path, "eng");
      const lines = text.split("\n");
      for (let line of lines) {
        if (line.toLowerCase().startsWith("q:")) {
          const parts = line.split("A:");
          if (parts.length === 2) {
            qaArray.push({
              question: parts[0].replace(/^Q:/i, "").trim(),
              answer: parts[1].trim(),
              fromAdmin: true,
            });
          }
        }
      }
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    if (qaArray.length > 0) {
      const created = await QA.insertMany(qaArray);
      created.forEach((qa) => {
        io.emit("newQA", { id: qa._id, question: qa.question, answer: qa.answer, fromAdmin: true });
      });
    }

    fs.unlinkSync(req.file.path); // remove temp file
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
