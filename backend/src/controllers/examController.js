import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";

// ✅ START EXAM
export const startExam = async (req, res) => {
  try {
    const { courseId, subjectId } = req.body;

    if (!courseId || !subjectId) {
      return res.status(400).json({ message: "Course and Subject required" });
    }

    // Check for existing in-progress attempt
    let attempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
      status: "in-progress"
    });

    // Get questions
    const questions = await Question.find({
      courseId,
      subjectId,
      type: "exam",
    });

    if (!questions.length) {
      return res.status(404).json({ message: "No exam questions found" });
    }

    const duration = (questions[0].examTime || 30) * 60;

    // If there's an in-progress attempt, return it
    if (attempt) {
      return res.json({
        attemptId: attempt._id,
        questions,
        duration: attempt.duration || duration,
      });
    }

    // Check for completed exam without resit
    const completedAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
      status: "submitted",
      resitAllowed: false
    });

    if (completedAttempt) {
      return res.status(403).json({
        message: "You have already completed this exam. Resit not allowed.",
      });
    }

    // Get attempt number
    const lastAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
    }).sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Create questions array in the format expected by the model
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
      return res.status(403).json({ message: "Cannot save a submitted exam." });
    }

    // Update each question's selected answer
    attempt.questions.forEach(question => {
      const answer = answers[question.questionId.toString()];
      if (answer !== undefined) {
        question.selected = answer;
        // Check if answer is correct
        const isCorrect = answer && question.correct && 
          answer.toUpperCase().trim() === question.correct.toUpperCase().trim();
        question.isCorrect = isCorrect;
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

    // Update answers and calculate correctness
    attempt.questions.forEach(question => {
      const answer = answers[question.questionId.toString()];
      if (answer !== undefined) {
        question.selected = answer;
        const isCorrect = answer && question.correct && 
          answer.toUpperCase().trim() === question.correct.toUpperCase().trim();
        question.isCorrect = isCorrect;
      }
    });

    // The model's pre-save hook will automatically calculate:
    // - totalQuestions
    // - correctAnswers  
    // - score
    // - percentage
    // - result
    
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    
    await attempt.save();

    console.log(`✅ Exam submitted! Score: ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%) - ${attempt.result}`);

    // Get question details for response
    const questions = await Question.find({
      _id: { $in: attempt.questions.map(q => q.questionId) }
    });

    const questionResults = attempt.questions.map(q => {
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