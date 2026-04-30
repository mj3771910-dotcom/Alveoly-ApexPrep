// QuizPage.jsx - Complete quiz taking page
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";

const QuizPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState(null);

  useEffect(() => {
    startQuiz();
  }, [lessonId]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      console.log("Starting quiz for lesson:", lessonId);
      
      const res = await axios.post(`/lesson-quiz/start/${lessonId}`);
      console.log("Quiz data:", res.data);
      
      setAttemptId(res.data.attemptId);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error("Start quiz error:", err);
      const errorMsg = err.response?.data?.message || "Failed to start quiz";
      toast.error(errorMsg);
      
      // Go back after 2 seconds if error
      setTimeout(() => navigate(-1), 2000);
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

    setSubmitting(true);
    try {
      const res = await axios.post("/lesson-quiz/submit", {
        attemptId,
        answers,
      });
      
      setResults(res.data);
      toast.success("Quiz submitted successfully!");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className={`bg-white rounded-2xl shadow-xl p-8 ${
          results.passed ? 'border-l-8 border-green-500' : 'border-l-8 border-red-500'
        }`}>
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              results.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {results.passed ? '🎉' : '📚'}
            </div>
            
            <h2 className="text-3xl font-bold mb-2">
              {results.passed ? 'Congratulations!' : 'Quiz Completed'}
            </h2>
            
            <div className="mt-4 p-6 bg-gray-50 rounded-lg inline-block">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {Math.round(results.percentage)}%
              </div>
              <p className="text-gray-600">
                Score: {results.score} / {results.totalPoints} points
              </p>
            </div>
            
            <p className={`mt-4 font-semibold ${
              results.passed ? 'text-green-600' : 'text-red-600'
            }`}>
              {results.message}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Question Review</h3>
            <div className="space-y-4">
              {results.questionResults.map((q, idx) => (
                <div key={idx} className={`border rounded-lg p-4 ${
                  q.isCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className="font-semibold mb-2">
                    {idx + 1}. {q.questionText}
                  </p>
                  <p className="text-sm">
                    Your answer: <span className={q.isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {q.userAnswerLetter}. {q.userAnswerText}
                    </span>
                  </p>
                  {!q.isCorrect && (
                    <p className="text-sm text-green-700 mt-1">
                      Correct answer: {q.correctAnswer}
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
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Lessons
            </button>
            <button
              onClick={() => {
                setResults(null);
                setAnswers({});
                startQuiz();
              }}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold">Lesson Quiz</h2>
          <p className="mt-1 opacity-90">Test your knowledge</p>
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
              {currentQuestion.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = answers[currentQuestion._id] === letter;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion._id, letter)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
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
              disabled={currentIndex === 0}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >
              ← Previous
            </button>
            
            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Quiz ✓"}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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

export default QuizPage;