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