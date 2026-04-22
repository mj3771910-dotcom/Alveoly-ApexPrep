import mongoose from "mongoose";
import ExamAttempt from "../models/ExamAttempt.js";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import Question from "../models/Question.js";

// ✅ GET RESULTS - Admin only
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
      else {
        return res.json([]);
      }
    }

    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      filter.subjectId = new mongoose.Types.ObjectId(subjectId);
    } else if (subjectId) {
      const subject = await Subject.findOne({
        name: { $regex: subjectId, $options: "i" },
      });
      if (subject) filter.subjectId = subject._id;
      else {
        return res.json([]);
      }
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    } else if (userId) {
      const user = await User.findOne({
        name: { $regex: userId, $options: "i" },
      });
      if (user) filter.userId = user._id;
      else {
        return res.json([]);
      }
    }

    console.log("Admin Filter:", JSON.stringify(filter, null, 2));

    const results = await ExamAttempt.find(filter)
      .populate('userId', 'name email')
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .sort({ submittedAt: -1 });

    console.log(`Found ${results.length} submitted attempts`);

    // Format results for display
    const formattedResults = results.map(result => ({
      _id: result._id,
      userId: result.userId,
      courseId: result.courseId,
      subjectId: result.subjectId,
      userName: result.userId?.name || result.userName,
      courseName: result.courseId?.name || result.courseName,
      subjectName: result.subjectId?.name || result.subjectName,
      score: result.score,
      percentage: result.percentage,
      result: result.result,
      resitAllowed: result.resitAllowed,
      submittedAt: result.submittedAt,
      totalQuestions: result.totalQuestions
    }));

    res.json(formattedResults);

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
    
    // Get full question details
    const questions = await Question.find({
      _id: { $in: attempt.questions.map(q => q.questionId) }
    });
    
    const detailedResults = attempt.questions.map(q => {
      const fullQuestion = questions.find(qu => qu._id.toString() === q.questionId.toString());
      return {
        questionId: q.questionId,
        questionText: fullQuestion?.question || "",
        userAnswer: q.selected,
        correctAnswer: q.correct,
        isCorrect: q.isCorrect,
        rationale: fullQuestion?.rationale || ""
      };
    });
    
    const result = {
      _id: attempt._id,
      userId: attempt.userId,
      courseId: attempt.courseId,
      subjectId: attempt.subjectId,
      userName: attempt.userId?.name || attempt.userName,
      courseName: attempt.courseId?.name || attempt.courseName,
      subjectName: attempt.subjectId?.name || attempt.subjectName,
      score: attempt.score,
      percentage: attempt.percentage,
      result: attempt.result,
      totalQuestions: attempt.totalQuestions,
      submittedAt: attempt.submittedAt,
      questionResults: detailedResults
    };
    
    res.json(result);
  } catch (error) {
    console.error("Get Exam Details Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};