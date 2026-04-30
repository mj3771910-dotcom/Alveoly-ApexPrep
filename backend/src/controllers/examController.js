import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";

// ✅ START EXAM - FIXED VERSION
export const startExam = async (req, res) => {
  try {
    const { courseId, subjectId } = req.body;

    if (!courseId || !subjectId) {
      return res.status(400).json({ message: "Course and Subject required" });
    }

    // Get the exam questions
    const questions = await Question.find({
      courseId,
      subjectId,
      type: "exam",
    });

    if (!questions.length) {
      return res.status(404).json({ message: "No exam questions found" });
    }

    // Check if the exam is locked (no retakes allowed)
    const isExamLocked = questions[0].isExamLocked || false;
    
    // If exam is locked, check if student has already submitted this exam before
    if (isExamLocked) {
      const existingCompletedAttempt = await ExamAttempt.findOne({
        userId: req.user._id,
        courseId,
        subjectId,
        status: "submitted"
      });
      
      if (existingCompletedAttempt) {
        return res.status(403).json({
          message: "You have already completed this exam. Retakes are not allowed for this exam.",
        });
      }
    }

    // Check for existing in-progress attempt
    let attempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
      status: "in-progress"
    });

    // Get exam duration (in minutes) from the question settings
    const examDurationMinutes = questions[0].examTime || 30;
    const durationInSeconds = examDurationMinutes * 60;

    // If there's an in-progress attempt, return it
    if (attempt) {
      // Calculate remaining time
      const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      const remainingSeconds = Math.max(0, attempt.duration - elapsedSeconds);
      
      return res.json({
        attemptId: attempt._id,
        questions,
        duration: remainingSeconds,
      });
    }

    // Get attempt number for tracking
    const lastAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
    }).sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Format questions for the attempt
    const formattedQuestions = questions.map((q) => ({
      questionId: q._id,
      correct: q.correctAnswer,
      selected: "",
      isCorrect: false,
    }));

    // Create new attempt
    attempt = await ExamAttempt.create({
      userId: req.user._id,
      courseId,
      subjectId,
      userName: req.user.name,
      courseName: questions[0].courseName || "N/A",
      subjectName: questions[0].subjectName || "N/A",
      questions: formattedQuestions,
      attemptNumber,
      status: "in-progress",
      startedAt: new Date(),
      duration: durationInSeconds,
      resitAllowed: !isExamLocked, // Allow resit only if exam is not locked
    });

    res.json({
      attemptId: attempt._id,
      questions,
      duration: durationInSeconds,
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
      return res.status(403).json({ message: "Cannot save a submitted exam." });
    }

    // Get questions to convert letter to text
    const questions = await Question.find({
      _id: { $in: attempt.questions.map(q => q.questionId) }
    });

    // Update each question's selected answer
    attempt.questions.forEach(question => {
      const answerLetter = answers[question.questionId.toString()];
      if (answerLetter !== undefined) {
        question.selected = answerLetter;
        
        // Find the full question to get the text
        const fullQuestion = questions.find(q => q._id.toString() === question.questionId.toString());
        
        if (fullQuestion && answerLetter) {
          // Convert letter to text
          const answerIndex = answerLetter.charCodeAt(0) - 65;
          const answerText = fullQuestion.options[answerIndex];
          const correctText = question.correct;
          
          // Compare TEXT
          const isCorrect = answerText && correctText && 
            answerText.toLowerCase().trim() === correctText.toLowerCase().trim();
          question.isCorrect = isCorrect;
        }
      }
    });

    await attempt.save();
    res.json({ message: "Progress saved" });

  } catch (err) {
    console.error("Save Progress Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ✅ SUBMIT EXAM
export const submitExam = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    console.log("\n========== EXAM SUBMISSION START ==========");
    console.log("Attempt ID:", attemptId);

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

    // Get all questions to convert letters to text
    const questions = await Question.find({
      _id: { $in: attempt.questions.map(q => q.questionId) }
    });

    let correctCount = 0;

    // Update answers and calculate correctness using TEXT comparison
    attempt.questions.forEach(question => {
      const answerLetter = answers[question.questionId.toString()];
      if (answerLetter !== undefined) {
        question.selected = answerLetter;
        
        // Find the full question
        const fullQuestion = questions.find(q => q._id.toString() === question.questionId.toString());
        
        if (fullQuestion && answerLetter) {
          // Convert letter to text
          const answerIndex = answerLetter.charCodeAt(0) - 65;
          const answerText = fullQuestion.options[answerIndex];
          const correctText = question.correct;
          
          // Compare TEXT (case-insensitive)
          const isCorrect = answerText && correctText && 
            answerText.toLowerCase().trim() === correctText.toLowerCase().trim();
          
          question.isCorrect = isCorrect;
          if (isCorrect) correctCount++;
          
          console.log(`Question: ${fullQuestion.question.substring(0, 50)}...`);
          console.log(`  Answer Letter: ${answerLetter}`);
          console.log(`  Answer Text: "${answerText}"`);
          console.log(`  Correct Text: "${correctText}"`);
          console.log(`  Is Correct: ${isCorrect}`);
        }
      }
    });

    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    
    await attempt.save();

    console.log(`\n✅ Exam submitted! Score: ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%) - ${attempt.result}`);

    // Prepare question results for frontend
    const questionResults = attempt.questions.map(q => {
      const fullQuestion = questions.find(qu => qu._id.toString() === q.questionId.toString());
      // Get the text for the student's answer
      let answerText = null;
      if (q.selected) {
        const answerIndex = q.selected.charCodeAt(0) - 65;
        if (fullQuestion && answerIndex >= 0 && answerIndex < fullQuestion.options.length) {
          answerText = fullQuestion.options[answerIndex];
        }
      }
      
      return {
        questionId: q.questionId,
        questionText: fullQuestion?.question || "",
        userAnswerLetter: q.selected,
        userAnswerText: answerText,
        correctAnswer: q.correct,
        isCorrect: q.isCorrect,
        rationale: fullQuestion?.rationale || ""
      };
    });

    res.json({
      success: true,
      score: attempt.score,
      percentage: attempt.percentage,
      result: attempt.result,
      totalQuestions: attempt.totalQuestions,
      questionResults
    });

  } catch (error) {
    console.error("Submit Exam Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// ✅ ADMIN: Allow resit for a student
export const allowResit = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await ExamAttempt.findById(attemptId);
    
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    
    if (attempt.status !== "submitted") {
      return res.status(400).json({ message: "Can only allow resit for submitted exams" });
    }
    
    attempt.resitAllowed = true;
    await attempt.save();
    
    res.json({ message: "Resit allowed for student", attempt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ADMIN: Get all attempts for a subject
export const getAttemptsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const attempts = await ExamAttempt.find({ subjectId })
      .sort({ createdAt: -1 });
    
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};