// components/student/LessonQuiz.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes } from "react-icons/fa";

const LessonQuiz = ({ lessonId, onClose, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startQuiz();
  }, [lessonId]);

 // components/student/LessonQuiz.jsx - Update startQuiz
const startQuiz = async () => {
  try {
    setLoading(true);
    console.log("Starting quiz for lesson:", lessonId);
    
    const res = await axios.post(`/lesson-quiz/start/${lessonId}`);
    console.log("Quiz start response:", res.data);
    
    setAttemptId(res.data.attemptId);
    setQuestions(res.data.questions);
  } catch (err) {
    console.error("Start quiz error:", err);
    console.error("Error response:", err.response);
    
    const errorMsg = err.response?.data?.message || "Failed to start quiz";
    toast.error(errorMsg);
    
    if (err.response?.status === 403) {
      // Can't retake or already passed
      setTimeout(() => onClose?.(), 2000);
    }
  } finally {
    setLoading(false);
  }
};

  const handleAnswer = (questionId, answerLetter) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerLetter }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error(`Please answer all ${questions.length} questions`);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/lesson-quiz/submit", {
        attemptId,
        answers,
      });
      setSubmitted(true);
      setResult(res.data);
      toast.success(res.data.message);
      onComplete?.(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setLoading(false);
    }
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
      <div className="bg-white rounded-2xl p-8 max-w-3xl mx-auto">
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

        <div className="space-y-4 mt-6">
          <h3 className="font-bold text-lg">Review Answers:</h3>
          {result.questionResults.map((q, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <p className="font-semibold">{idx + 1}. {q.questionText}</p>
              <p className={`mt-2 ${q.isCorrect ? "text-green-600" : "text-red-600"}`}>
                Your answer: {q.userAnswerLetter}. {q.userAnswerText}
              </p>
              {!q.isCorrect && (
                <p className="text-green-600 mt-1">
                  Correct: {q.correctAnswer}
                </p>
              )}
              {q.rationale && (
                <p className="text-gray-600 text-sm mt-2">💡 {q.rationale}</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lesson Quiz</h2>
          <span className="text-gray-600">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg font-medium mb-4">{currentQuestion?.question}</p>
        <div className="space-y-3">
          {currentQuestion?.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = answers[currentQuestion._id] === letter;
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion._id, letter)}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
              >
                <span className="font-bold mr-3">{letter}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          className="px-6 py-2 bg-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-400"
        >
          <FaArrowLeft className="inline mr-2" /> Previous
        </button>
        
        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next <FaArrowRight className="inline ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonQuiz;