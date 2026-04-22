import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";

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

    if (attempt) {
      return res.json({
        attemptId: attempt._id,
        questions,
        duration: attempt.duration || duration,
      });
    }

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

    const lastAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
    }).sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Store the correct answer TEXT, not letter
    const formattedQuestions = questions.map((q) => ({
      questionId: q._id,
      correct: q.correctAnswer, // This is TEXT
      selected: "",
      isCorrect: false,
    }));

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

// ✅ SUBMIT EXAM - FIXED with TEXT comparison
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