// components/student/LessonQuiz.jsx - COMPLETE FIXED VERSION with working auto-submit
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes } from "react-icons/fa";

const LessonQuiz = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const autoSubmitTriggered = useRef(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timeLeft > 0 && timerActive && !submitted && !loading && !isSubmitting && !autoSubmitTriggered.current) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            if (!autoSubmitTriggered.current && !submitted) {
              handleAutoSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft, timerActive, submitted, loading, isSubmitting]);

  useEffect(() => {
    if (lessonId) {
      startQuiz();
    }
  }, [lessonId]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`/lesson-quiz/start/${lessonId}`);
      
      if (res.data.remainingSeconds) {
        setTimeLeft(res.data.remainingSeconds);
      } else if (res.data.timerMinutes) {
        setTimeLeft(res.data.timerMinutes * 60);
      }
      
      setAttemptId(res.data.attemptId);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error("Start quiz error:", err);
      const errorMsg = err.response?.data?.message || "Failed to start quiz";
      toast.error(errorMsg);
      if (err.response?.status === 403) {
        setTimeout(() => navigate(-1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
    // Prevent multiple auto-submit calls
    if (autoSubmitTriggered.current || isSubmitting || submitted) {
      return;
    }
    
    autoSubmitTriggered.current = true;
    setTimerActive(false);
    setIsSubmitting(true);
    
    toast.warning("Time's up! Submitting your quiz...", { duration: 3000 });
    
    try {
      // Submit with whatever answers the student has
      const res = await axios.post("/lesson-quiz/submit", {
        attemptId,
        answers: answers,
      });
      
      setSubmitted(true);
      setResult(res.data);
      toast.success(res.data.message);
    } catch (err) {
      console.error("Auto-submit error:", err);
      toast.error("Failed to submit quiz. Please contact support.");
      autoSubmitTriggered.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (questionId, answerLetter) => {
    if (submitted || isSubmitting) return;
    setAnswers(prev => ({ ...prev, [questionId]: answerLetter }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || submitted) return;
    
    if (Object.keys(answers).length < questions.length) {
      toast.error(`Please answer all ${questions.length} questions`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("/lesson-quiz/submit", {
        attemptId,
        answers,
      });
      setSubmitted(true);
      setResult(res.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit quiz");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleRetake = () => {
    setSubmitted(false);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    autoSubmitTriggered.current = false;
    startQuiz();
  };

  const currentQuestion = questions[currentIndex];

  if (loading && !submitted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className={`bg-white rounded-2xl shadow-xl p-8 ${
          result.passed ? 'border-l-8 border-green-500' : 'border-l-8 border-red-500'
        }`}>
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              result.passed ? "bg-green-100" : "bg-red-100"
            }`}>
              {result.passed ? (
                <FaCheck className="text-green-600 text-3xl" />
              ) : (
                <FaTimes className="text-red-600 text-3xl" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {result.passed ? "🎉 Lesson Completed!" : "😔 Keep Learning!"}
            </h2>
            <p className="text-gray-600">{result.message}</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg inline-block">
              <p className="text-lg font-semibold">
                Score: {result.score} / {result.totalPoints}
              </p>
              <p className="text-lg font-semibold text-blue-600">
                {Math.round(result.percentage)}%
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Question Review</h3>
            <div className="space-y-4">
              {result.questionResults?.map((q, idx) => (
                <div key={idx} className={`border rounded-lg p-4 ${
                  q.isCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className="font-semibold mb-2">
                    {idx + 1}. {q.questionText}
                  </p>
                  <p className="text-sm">
                    Your answer: <span className={q.isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {q.userAnswerLetter}. {q.userAnswerText || 'No answer'}
                    </span>
                  </p>
                  {!q.isCorrect && (
                    <p className="text-sm text-green-700 mt-1">
                      Correct answer: {q.correctAnswer}. {q.correctAnswerText || ''}
                    </p>
                  )}
                  {q.rationale && (
                    <p className="text-sm text-gray-600 mt-2">
                      💡 {q.rationale}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleClose}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Lessons
            </button>
            <button
              onClick={handleRetake}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">No questions available for this quiz.</p>
        <button onClick={handleClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Go Back
        </button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Lesson Quiz</h2>
              <p className="mt-1 opacity-90">Test your knowledge</p>
            </div>
            {timeLeft > 0 && !submitted && (
              <div className={`px-4 py-2 rounded-lg font-mono text-xl font-bold ${
                timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-white/20'
              }`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            )}
            {timeLeft === 0 && !submitted && (
              <div className="bg-red-500 px-4 py-2 rounded-lg font-mono text-xl font-bold animate-pulse">
                Time's Up!
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6">
              {currentQuestion.question}
              <span className="text-sm text-gray-500 ml-2">
                ({currentQuestion.points || 1} point{currentQuestion.points !== 1 ? 's' : ''})
              </span>
            </h3>
            
            <div className="space-y-3">
              {currentQuestion.options?.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = answers[currentQuestion._id] === letter;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion._id, letter)}
                    disabled={isSubmitting}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="font-bold mr-3">{letter}.</span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => setCurrentIndex(prev => prev - 1)}
              disabled={currentIndex === 0 || isSubmitting}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >
              ← Previous
            </button>
            
            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz ✓"}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default LessonQuiz;