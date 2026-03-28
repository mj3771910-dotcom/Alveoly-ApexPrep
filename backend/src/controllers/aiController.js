import cloudinary from "../../config/cloudinary.js";
import pdfParse from "pdf-parse";
import csv from "csv-parser";
import streamifier from "streamifier";
import Tesseract from "tesseract.js";
import QA from "../models/QA.js";
import { io } from "../../server.js";

// ================= FILE UPLOAD =================
export const uploadAIFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 🔥 Upload to Cloudinary
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadStream();

    let extractedText = "";

    // ================= FILE TYPE HANDLING =================
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    }

    else if (req.file.mimetype.includes("csv")) {
      const results = [];

      await new Promise((resolve, reject) => {
        streamifier
          .createReadStream(req.file.buffer)
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", () => resolve());
      });

      // Expect CSV format: question, answer
      for (let row of results) {
        if (row.question && row.answer) {
          const qa = new QA({
            question: row.question,
            answer: row.answer,
            fromAdmin: true,
          });
          await qa.save();

          io.emit("newQA", {
            id: qa._id,
            question: qa.question,
            answer: qa.answer,
            fromAdmin: true,
          });
        }
      }

      return res.json({
        message: "CSV uploaded & QAs saved",
        fileUrl: result.secure_url,
      });
    }

    else if (
      req.file.mimetype.includes("image")
    ) {
      const {
        data: { text },
      } = await Tesseract.recognize(req.file.buffer, "eng");

      extractedText = text;
    }

    // ================= PROCESS TEXT =================
    if (extractedText) {
      const lines = extractedText.split("\n");

      let currentQ = "";
      let currentA = "";

      for (let line of lines) {
        if (line.toLowerCase().startsWith("q:")) {
          currentQ = line.replace("Q:", "").trim();
        } else if (line.toLowerCase().startsWith("a:")) {
          currentA = line.replace("A:", "").trim();

          if (currentQ && currentA) {
            const qa = new QA({
              question: currentQ,
              answer: currentA,
              fromAdmin: true,
            });

            await qa.save();

            io.emit("newQA", {
              id: qa._id,
              question: qa.question,
              answer: qa.answer,
              fromAdmin: true,
            });

            currentQ = "";
            currentA = "";
          }
        }
      }
    }

    res.json({
      message: "File uploaded & processed",
      fileUrl: result.secure_url,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "File processing failed" });
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
