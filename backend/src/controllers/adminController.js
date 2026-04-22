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

import mongoose from "mongoose";
import ExamAttempt from "../models/ExamAttempt.js";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";

// ✅ GET RESULTS - Return ALL attempts for debugging
export const getExamResults = async (req, res) => {
  try {
    const { courseId, subjectId, userId } = req.query;

    const filter = { status: "submitted" };

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      filter.courseId = new mongoose.Types.ObjectId(courseId);
    } else if (courseId) {
      const course = await Course.findOne({
        name: { $regex: courseId, $options: "i" },
      });
      if (course) filter.courseId = course._id;
    }

    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      filter.subjectId = new mongoose.Types.ObjectId(subjectId);
    } else if (subjectId) {
      const subject = await Subject.findOne({
        name: { $regex: subjectId, $options: "i" },
      });
      if (subject) filter.subjectId = subject._id;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    } else if (userId) {
      const user = await User.findOne({
        name: { $regex: userId, $options: "i" },
      });
      if (user) filter.userId = user._id;
    }

    console.log("Admin Results Filter:", JSON.stringify(filter, null, 2));

    // Get ALL attempts (not just latest)
    const results = await ExamAttempt.find(filter)
      .populate('userId', 'name email')
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .sort({ submittedAt: -1 });

    console.log(`Found ${results.length} total submitted attempts`);
    
    // Log each attempt for debugging
    results.forEach((result, index) => {
      console.log(`\nAttempt ${index + 1}:`);
      console.log(`  ID: ${result._id}`);
      console.log(`  Student: ${result.userId?.name || result.userName}`);
      console.log(`  Score: ${result.score}/${result.totalQuestions || '?'}`);
      console.log(`  Percentage: ${result.percentage}%`);
      console.log(`  Result: ${result.result}`);
      console.log(`  Submitted: ${result.submittedAt}`);
      console.log(`  Status: ${result.status}`);
    });

    // Return ALL attempts so admin can see both old and new
    res.json(results);

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

// ✅ GET SINGLE EXAM DETAILS
export const getExamDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await ExamAttempt.findById(attemptId)
      .populate('userId', 'name email')
      .populate('courseId', 'name')
      .populate('subjectId', 'name');
    
    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }
    
    res.json(attempt);
  } catch (error) {
    console.error("Get Exam Details Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};