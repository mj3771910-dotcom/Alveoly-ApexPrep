import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";
import mongoose from "mongoose";

// ✅ START EXAM
export const startExam = async (req, res) => {
  try {
    const { courseId, subjectId } = req.body;

    if (!courseId || !subjectId) {
      return res.status(400).json({ message: "Course and Subject required" });
    }

    let attempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
      status: "in-progress"
    });

    const questions = await Question.find({
      courseId,
      subjectId,
      type: "exam",
    });

    if (!questions.length) {
      return res.status(404).json({ message: "No exam questions found" });
    }

    const duration = (questions[0].examTime || 30) * 60;

    if (attempt && attempt.status === "in-progress") {
      return res.json({
        attemptId: attempt._id,
        questions,
        duration: attempt.duration,
      });
    }

    const submittedAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
      status: "submitted",
      resitAllowed: false
    });

    if (submittedAttempt) {
      return res.status(403).json({
        message: "You have already completed this exam. Resit not allowed.",
      });
    }

    const lastAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
    }).sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    attempt = await ExamAttempt.create({
      userId: req.user._id,
      courseId,
      subjectId,
      userName: req.user.name,
      courseName: questions[0].courseName || "N/A",
      subjectName: questions[0].subjectName || "N/A",
      questions: questions.map((q) => ({
        questionId: q._id,
        questionText: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale
      })),
      attemptNumber,
      status: "in-progress",
      startedAt: new Date(),
      duration,
      resitAllowed: false,
    });

    res.json({
      attemptId: attempt._id,
      questions,
      duration,
    });

  } catch (err) {
    console.error("Start Exam Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ✅ SAVE PROGRESS
export const saveProgress = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }

    if (attempt.status === "submitted") {
      return res.status(403).json({
        message: "Cannot save a submitted exam.",
      });
    }

    attempt.answers = answers;
    await attempt.save();

    res.json({ message: "Progress saved" });

  } catch (err) {
    console.error("Save Progress Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ✅ SUBMIT EXAM - COMPLETE REWRITE WITH PROPER DEBUGGING
export const submitExam = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    console.log("\n========== EXAM SUBMISSION START ==========");
    console.log("Attempt ID:", attemptId);
    console.log("Answers received:", JSON.stringify(answers, null, 2));

    if (!attemptId) {
      return res.status(400).json({ message: "Attempt ID required" });
    }

    const attempt = await ExamAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }

    if (attempt.status === "submitted") {
      return res.status(403).json({ message: "Exam already submitted" });
    }

    // Get all questions for this exam
    const questionIds = attempt.questions.map(q => q.questionId);
    console.log("Question IDs:", questionIds);
    
    const questions = await Question.find({
      _id: { $in: questionIds }
    });
    
    console.log(`Found ${questions.length} questions`);

    let correctCount = 0;
    const questionResults = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionIdStr = question._id.toString();
      
      // Get student's answer (this is a letter like "A", "B", "C", "D")
      const studentAnswerLetter = answers[questionIdStr];
      
      console.log(`\n--- Question ${i + 1} ---`);
      console.log(`Question ID: ${questionIdStr}`);
      console.log(`Question Text: ${question.question}`);
      console.log(`Student Answer Letter: ${studentAnswerLetter}`);
      console.log(`Stored Correct Answer: "${question.correctAnswer}"`);
      
      // Find the index of the student's answer (0 for A, 1 for B, etc.)
      let studentAnswerText = null;
      let studentAnswerIndex = -1;
      
      if (studentAnswerLetter) {
        studentAnswerIndex = studentAnswerLetter.charCodeAt(0) - 65; // 'A' = 0, 'B' = 1, etc.
        if (studentAnswerIndex >= 0 && studentAnswerIndex < question.options.length) {
          studentAnswerText = question.options[studentAnswerIndex];
        }
      }
      
      console.log(`Student Answer Index: ${studentAnswerIndex}`);
      console.log(`Student Answer Text: "${studentAnswerText}"`);
      console.log(`Question Options:`, question.options);
      
      // Determine if answer is correct using multiple methods
      let isCorrect = false;
      let matchType = "";
      
      // Method 1: Compare letter with stored correct answer (if stored as letter)
      if (studentAnswerLetter && question.correctAnswer) {
        const normalizedStudentLetter = studentAnswerLetter.toUpperCase().trim();
        const normalizedCorrectLetter = question.correctAnswer.toUpperCase().trim();
        
        if (normalizedStudentLetter === normalizedCorrectLetter) {
          isCorrect = true;
          matchType = "letter-to-letter";
          console.log(`✓ Match found: Letter comparison (${normalizedStudentLetter} === ${normalizedCorrectLetter})`);
        }
      }
      
      // Method 2: Compare text with stored correct answer (if stored as text)
      if (!isCorrect && studentAnswerText && question.correctAnswer) {
        const normalizedStudentText = studentAnswerText.toLowerCase().trim();
        const normalizedCorrectText = question.correctAnswer.toLowerCase().trim();
        
        if (normalizedStudentText === normalizedCorrectText) {
          isCorrect = true;
          matchType = "text-to-text";
          console.log(`✓ Match found: Text comparison ("${normalizedStudentText}" === "${normalizedCorrectText}")`);
        }
      }
      
      // Method 3: If stored correct answer is text, try to find which option matches it
      if (!isCorrect && question.correctAnswer && question.options) {
        const correctTextNorm = question.correctAnswer.toLowerCase().trim();
        for (let optIdx = 0; optIdx < question.options.length; optIdx++) {
          const optionTextNorm = question.options[optIdx].toLowerCase().trim();
          if (optionTextNorm === correctTextNorm) {
            const correctLetter = String.fromCharCode(65 + optIdx);
            if (studentAnswerLetter === correctLetter) {
              isCorrect = true;
              matchType = "letter-derived-from-text";
              console.log(`✓ Match found: Student letter ${studentAnswerLetter} matches correct option ${correctLetter} derived from text`);
            }
            break;
          }
        }
      }
      
      if (isCorrect) {
        correctCount++;
        console.log(`✅ CORRECT! (${matchType})`);
      } else {
        console.log(`❌ WRONG!`);
        console.log(`  Expected: "${question.correctAnswer}"`);
        console.log(`  Got: ${studentAnswerLetter ? `"${studentAnswerLetter}" -> "${studentAnswerText}"` : "No answer"}`);
      }

      questionResults.push({
        questionId: question._id,
        questionText: question.question,
        userAnswerLetter: studentAnswerLetter || null,
        userAnswerText: studentAnswerText,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        matchType: matchType,
        rationale: question.rationale
      });
    }

    const totalQuestions = questions.length;
    const score = correctCount;
    const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
    const result = percentage >= 50 ? 'pass' : 'fail';

    console.log("\n========== SCORE SUMMARY ==========");
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`Correct Answers: ${correctCount}`);
    console.log(`Score: ${score}/${totalQuestions}`);
    console.log(`Percentage: ${percentage}%`);
    console.log(`Result: ${result}`);
    console.log("========== EXAM SUBMISSION END ==========\n");

    // Update attempt
    attempt.answers = answers;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.result = result;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';
    attempt.questionResults = questionResults;
    
    await attempt.save();

    res.json({
      success: true,
      score,
      percentage,
      result,
      totalQuestions,
      questionResults
    });

  } catch (error) {
    console.error("Submit Exam Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// ✅ ADMIN GET RESULTS
export const getExamResults = async (req, res) => {
  try {
    const { courseId, subjectId, userId } = req.query;

    const filter = { status: "submitted" };

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      filter.courseId = new mongoose.Types.ObjectId(courseId);
    }
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      filter.subjectId = new mongoose.Types.ObjectId(subjectId);
    }
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    const results = await ExamAttempt.find(filter)
      .populate('userId', 'name email')
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .sort({ submittedAt: -1 });

    // Get only the latest attempt per student per subject
    const latestResults = {};
    results.forEach(result => {
      const key = `${result.userId?._id || result.userId}-${result.subjectId?._id || result.subjectId}`;
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

// ✅ GET SINGLE EXAM DETAILS (for admin)
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