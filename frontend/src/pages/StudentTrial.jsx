import { useState, useEffect } from "react";
import axios from "../api/axios";
import socket from "../api/socket";
import {
  FaRobot,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const StudentTrial = () => {
  const { user } = useAuth();
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [time, setTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [backendResult, setBackendResult] = useState(null);

  const current = questions[currentIndex];

  // ================= FETCH =================
  const fetchQuestions = async () => {
    try {
      if (!subjectId || !courseId) return;

      const res = await axios.get(
        `/questions?subjectId=${subjectId}&courseId=${courseId}`
      );

      const trials = res.data.filter((q) => q.type === "trial");
      setQuestions(trials);
      
      // Clear previous answers when new questions load
      setAnswers({});
      setSubmitted(false);
      setShowResult(false);
      setTime(0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questions");
    }
  };

  useEffect(() => {
    fetchQuestions();

    socket.on("question:created", fetchQuestions);
    socket.on("question:updated", fetchQuestions);
    socket.on("question:deleted", fetchQuestions);

    return () => {
      socket.off("question:created", fetchQuestions);
      socket.off("question:updated", fetchQuestions);
      socket.off("question:deleted", fetchQuestions);
    };
  }, [subjectId, courseId]);

  // ================= TIMER =================
  useEffect(() => {
    if (submitted) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted]);

  // ================= SELECT =================
  const handleSelect = (qId, option) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  // ================= AI =================
  const askAI = async () => {
    if (!current) return;

    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await axios.post("/ai/ask", {
        question: `
Question: ${current.question}
Options:
${current.options
  .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
  .join("\n")}

Explain the correct answer like a nursing tutor.
        `,
      });

      setAiResponse(res.data.answer);
    } catch (err) {
      setAiResponse("Please Subscribe to a plan.");
    }

    setAiLoading(false);
  };

  // ================= NAV =================
  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAiResponse("");
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setAiResponse("");
    }
  };

  // ================= SUBMIT =================
  const submitTrial = async () => {
    if (Object.keys(answers).length === 0) {
      toast.error("Please answer at least one question.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axios.post("/trial/submit", {
        subjectId,
        courseId,
        answers,
        duration: time,
      });

      setBackendResult(res.data.attempt);
      setSubmitted(true);
      setShowResult(true);
      toast.success("Trial submitted successfully!");
    } catch (err) {
      console.error("❌ Submit Error:", err);
      toast.error(err.response?.data?.message || "Failed to submit trial.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= CALCULATE SCORE CORRECTLY =================
  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q._id];
      const correctAnswer = q.correctAnswer;
      
      // Compare the letters (A, B, C, D)
      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const score = calculateScore();
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

  const getColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + "h " : ""}${mins > 0 ? mins + "m " : ""}${secs}s`;
  };

  // ================= UI =================
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Toaster position="top-right" />
      
      <h2 className="text-3xl font-bold mb-6 text-gray-800">🧠 Trial Practice</h2>

      {/* TIMER DISPLAY */}
      <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
        <span>⏱️ Time Spent</span>
        <span className="font-semibold text-blue-600">{formatTime(time)}</span>
      </div>

      {/* PROGRESS BAR */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>
            {Object.keys(answers).length}/{questions.length} answered
          </span>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{
              width: `${
                questions.length
                  ? (Object.keys(answers).length / questions.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* QUESTION TRACKER */}
      <div className="flex flex-wrap gap-2 mb-4">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-8 h-8 rounded-full text-sm ${
              answers[q._id]
                ? "bg-green-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {!current && <p>No questions available.</p>}

      {current && !submitted && (
        <div className="bg-white shadow-xl rounded-2xl p-6">
          {/* QUESTION */}
          <h3 className="text-lg font-semibold mb-5">
            {currentIndex + 1}. {current.question}
          </h3>

          {/* OPTIONS */}
          <div className="space-y-3">
            {current.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const selected = answers[current._id] === letter;

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(current._id, letter)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <b>{letter}.</b> {opt}
                </button>
              );
            })}
          </div>

          {/* AI BUTTON */}
          <button
            onClick={askAI}
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <FaRobot /> Ask AI
          </button>

          {aiLoading && <p className="mt-3 text-gray-500">Thinking...</p>}

          {aiResponse && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm leading-relaxed">
              {aiResponse}
            </div>
          )}

          {/* NAV */}
          <div className="flex justify-between mt-6 items-center">
            <button onClick={prev} className="flex items-center gap-2">
              <FaArrowLeft /> Prev
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={submitTrial}
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                {submitting ? "Submitting..." : "Submit"}
                <FaCheck />
              </button>
            ) : (
              <button onClick={next} className="flex items-center gap-2">
                Next <FaArrowRight />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= RESULT POPUP - FIXED VERSION ================= */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-center mb-4">🎉 Trial Result</h2>

            <div className="text-center mb-6">
              <h1 className={`text-4xl font-bold ${getColor()}`}>
                {backendResult?.score ?? score}/{questions.length}
              </h1>
              <p className={`text-lg font-semibold ${getColor()}`}>
                {backendResult?.percentage ?? percentage}%
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Performance:{" "}
                <span className="font-semibold text-blue-600">
                  {backendResult?.performance || 
                    (percentage >= 80 ? "Excellent" : percentage >= 60 ? "Good" : percentage >= 40 ? "Average" : "Poor")}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => {
                const userAnswerLetter = answers[q._id];
                // Get the option text for user's answer
                const userAnswerText = userAnswerLetter && q.options 
                  ? q.options[userAnswerLetter.charCodeAt(0) - 65] 
                  : null;
                
                const correctAnswerLetter = q.correctAnswer;
                const correctAnswerText = correctAnswerLetter && q.options 
                  ? q.options[correctAnswerLetter.charCodeAt(0) - 65] 
                  : null;
                
                const isCorrect = userAnswerLetter === correctAnswerLetter;

                return (
                  <div key={q._id} className="p-4 border rounded-lg">
                    <p className="font-semibold mb-2">
                      {index + 1}. {q.question}
                    </p>

                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Your Answer:</span>{" "}
                        <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                          {userAnswerLetter || "None"}
                          {userAnswerText && ` - ${userAnswerText}`}
                        </span>
                      </p>

                      {!isCorrect && (
                        <p>
                          <span className="font-medium">Correct Answer:</span>{" "}
                          <span className="text-green-600">
                            {correctAnswerLetter}
                            {correctAnswerText && ` - ${correctAnswerText}`}
                          </span>
                        </p>
                      )}
                    </div>

                    {q.rationale && (
                      <p className="mt-2 text-sm text-gray-600">📘 {q.rationale}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate("/student/progress")}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Close & View Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTrial;