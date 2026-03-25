import mongoose from "mongoose";
import ExamAttempt from "../models/ExamAttempt.js";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";

// ✅ CLEAN FILTER BUILDER (REAL FIX)
const buildFilter = async (query) => {
  const filter = {};

  // COURSE
  if (query.courseId) {
    const course = await Course.findOne({
      name: { $regex: query.courseId, $options: "i" },
    });

    if (course) filter.courseId = course._id;
    else return null; // no match
  }

  // SUBJECT
  if (query.subjectId) {
    const subject = await Subject.findOne({
      name: { $regex: query.subjectId, $options: "i" },
    });

    if (subject) filter.subjectId = subject._id;
    else return null;
  }

  // USER
  if (query.userId) {
    const user = await User.findOne({
      name: { $regex: query.userId, $options: "i" },
    });

    if (user) filter.userId = user._id;
    else return null;
  }

  return filter;
};

// ✅ GET RESULTS
export const getExamResults = async (req, res) => {
  try {
    const filter = await buildFilter(req.query);

    if (filter === null) return res.json([]);

    const results = await ExamAttempt.find(filter)
      .populate("userId", "name email")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ submittedAt: -1 });

    console.log("RESULTS:", results.length);

    res.json(results);
  } catch (err) {
    console.error("Fetch Exam Results Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE
export const deleteExamAttempt = async (req, res) => {
  try {
    const deleted = await ExamAttempt.findByIdAndDelete(req.params.attemptId);

    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// RESIT
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