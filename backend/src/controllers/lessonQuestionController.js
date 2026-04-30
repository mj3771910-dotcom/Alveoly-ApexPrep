// controllers/lessonQuestionController.js
import LessonQuestion from "../models/LessonQuestion.js";
import LessonAttempt from "../models/LessonAttempt.js";
import Content from "../models/Content.js";

// ================= CREATE/UPDATE LESSON QUESTIONS =================
// controllers/lessonQuestionController.js
export const saveLessonQuestions = async (req, res) => {
  try {
    console.log("Received save request:", req.body);
    
    const { lessonId, questions } = req.body;
    
    if (!lessonId) {
      return res.status(400).json({ message: "Lesson ID is required" });
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required" });
    }
    
    // Get lesson to get course/subject info
    const lesson = await Content.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    console.log(`Saving ${questions.length} questions for lesson: ${lesson.title}`);
    
    // Delete existing questions for this lesson
    const deleted = await LessonQuestion.deleteMany({ lessonId });
    console.log(`Deleted ${deleted.deletedCount} existing questions`);
    
    // Create new questions with order
    const questionsToSave = questions.map((q, idx) => ({
      lessonId,
      subjectId: lesson.subjectId,
      courseId: lesson.courseId,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      rationale: q.rationale || "",
      points: q.points || 1,
      order: idx,
    }));
    
    const savedQuestions = await LessonQuestion.insertMany(questionsToSave);
    
    res.json({
      success: true,
      message: `${savedQuestions.length} questions saved for lesson`,
      questions: savedQuestions,
    });
  } catch (err) {
    console.error("Save lesson questions error:", err);
    res.status(500).json({ 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// ================= GET LESSON QUESTIONS =================
export const getLessonQuestions = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const questions = await LessonQuestion.find({ lessonId })
      .sort({ order: 1 });
    
    res.json(questions);
  } catch (err) {
    console.error("Get lesson questions error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= START LESSON QUIZ =================
export const startLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    // Get lesson details
    const lesson = await Content.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    // Get questions for this lesson
    const questions = await LessonQuestion.find({ lessonId })
      .sort({ order: 1 });
    
    if (!questions.length) {
      return res.status(404).json({ message: "No questions found for this lesson" });
    }
    
    // Check for existing completed attempt
    const existingAttempt = await LessonAttempt.findOne({
      userId: req.user._id,
      lessonId,
      lessonCompleted: true,
    });
    
    if (existingAttempt && existingAttempt.isPassed) {
      return res.status(403).json({
        message: "You have already passed this lesson quiz",
        canRetake: existingAttempt.attempts < existingAttempt.maxAttempts,
      });
    }
    
    // Check for in-progress attempt
    let attempt = await LessonAttempt.findOne({
      userId: req.user._id,
      lessonId,
      status: "in-progress",
    });
    
    if (attempt) {
      // Return existing attempt
      return res.json({
        attemptId: attempt._id,
        questions,
        attempt: {
          score: attempt.score,
          percentage: attempt.percentage,
          totalQuestions: attempt.questions.length,
        },
      });
    }
    
    // Check attempts count
    const completedAttempts = await LessonAttempt.countDocuments({
      userId: req.user._id,
      lessonId,
      status: "completed",
    });
    
    const maxAttempts = 3; // Configurable
    if (completedAttempts >= maxAttempts) {
      return res.status(403).json({
        message: `Maximum attempts (${maxAttempts}) reached for this lesson`,
      });
    }
    
    // Create new attempt
    const formattedQuestions = questions.map((q) => ({
      questionId: q._id,
      questionText: q.question,
      selected: "",
      selectedText: "",
      correct: q.correctAnswer,
      correctText: q.options[q.correctAnswer.charCodeAt(0) - 65],
      isCorrect: false,
      points: q.points,
      rationale: q.rationale,
    }));
    
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    
    attempt = await LessonAttempt.create({
      userId: req.user._id,
      lessonId,
      subjectId: lesson.subjectId,
      courseId: lesson.courseId,
      userName: req.user.name,
      userEmail: req.user.email,
      questions: formattedQuestions,
      totalPoints,
      attempts: completedAttempts + 1,
      status: "in-progress",
      startedAt: new Date(),
    });
    
    res.json({
      attemptId: attempt._id,
      questions,
      attempt: {
        score: attempt.score,
        percentage: attempt.percentage,
        totalQuestions: questions.length,
      },
    });
  } catch (err) {
    console.error("Start lesson quiz error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= SUBMIT LESSON QUIZ =================
export const submitLessonQuiz = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    
    const attempt = await LessonAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    
    if (attempt.status !== "in-progress") {
      return res.status(403).json({ message: "Quiz already submitted" });
    }
    
    // Get all questions for this lesson
    const questions = await LessonQuestion.find({
      _id: { $in: attempt.questions.map(q => q.questionId) }
    });
    
    let totalScore = 0;
    
    // Grade each question
    attempt.questions.forEach(question => {
      const userAnswerLetter = answers[question.questionId.toString()];
      const fullQuestion = questions.find(q => q._id.toString() === question.questionId.toString());
      
      if (fullQuestion && userAnswerLetter) {
        const answerIndex = userAnswerLetter.charCodeAt(0) - 65;
        const answerText = fullQuestion.options[answerIndex];
        const isCorrect = answerText && 
          answerText.toLowerCase().trim() === fullQuestion.correctAnswer.toLowerCase().trim();
        
        question.selected = userAnswerLetter;
        question.selectedText = answerText;
        question.isCorrect = isCorrect;
        
        if (isCorrect) {
          totalScore += (question.points || 1);
        }
      }
    });
    
    // Calculate results
    const percentage = (totalScore / attempt.totalPoints) * 100;
    const isPassed = percentage >= attempt.passMark;
    
    attempt.score = totalScore;
    attempt.percentage = percentage;
    attempt.status = "completed";
    attempt.completedAt = new Date();
    attempt.lessonCompleted = isPassed;
    
    await attempt.save();
    
    // Prepare response
    const questionResults = attempt.questions.map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      userAnswerLetter: q.selected,
      userAnswerText: q.selectedText,
      correctAnswer: q.correctText,
      isCorrect: q.isCorrect,
      rationale: q.rationale,
    }));
    
    res.json({
      success: true,
      score: totalScore,
      totalPoints: attempt.totalPoints,
      percentage: percentage,
      passed: isPassed,
      message: isPassed ? "Congratulations! You passed the quiz!" : "You did not pass. You can retake the quiz.",
      questionResults,
    });
  } catch (err) {
    console.error("Submit lesson quiz error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET STUDENT PROGRESS =================
export const getStudentProgress = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    
    const filter = { userId: studentId };
    if (subjectId) filter.subjectId = subjectId;
    
    const attempts = await LessonAttempt.find(filter)
      .populate("lessonId", "title type")
      .populate("subjectId", "name")
      .sort({ completedAt: -1 });
    
    // Calculate overall stats
    const completedLessons = attempts.filter(a => a.lessonCompleted).length;
    const totalLessons = [...new Set(attempts.map(a => a.lessonId?._id?.toString()))].length;
    
    const averageScore = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length
      : 0;
    
    res.json({
      attempts,
      stats: {
        completedLessons,
        totalLessons,
        averageScore: Math.round(averageScore),
        totalAttempts: attempts.length,
      },
    });
  } catch (err) {
    console.error("Get student progress error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET LESSON PERFORMANCE (ADMIN) =================
export const getLessonPerformance = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const attempts = await LessonAttempt.find({ lessonId, status: "completed" })
      .populate("userId", "name email")
      .sort({ percentage: -1 });
    
    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0,
      passRate: attempts.length > 0
        ? Math.round((attempts.filter(a => a.isPassed).length / attempts.length) * 100)
        : 0,
      bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0,
      worstScore: attempts.length > 0 ? Math.min(...attempts.map(a => a.percentage)) : 0,
    };
    
    res.json({ attempts, stats });
  } catch (err) {
    console.error("Get lesson performance error:", err);
    res.status(500).json({ message: err.message });
  }
};