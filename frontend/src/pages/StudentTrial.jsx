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
import { useParams } from "react-router-dom";

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
  // ⏱️ TIMER
const [time, setTime] = useState(0); // seconds

  // 🔥 NEW STATES
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
    } catch (err) {
      console.error(err);
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
    // 🔥 Prevent empty submission
    if (Object.keys(answers).length === 0) {
      alert("Please answer at least one question.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axios.post("/trial/submit", {
  subjectId,
  courseId,
  answers,
  duration: time, // 🔥 NEW
});

      // 🔥 Save backend result
      setBackendResult(res.data.attempt);

      setSubmitted(true);
      setShowResult(true);
    } catch (err) {
      console.error("❌ Submit Error:", err);
      alert("Failed to submit trial.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= SCORE =================
  const score = questions.reduce((acc, q) => {
    if (answers[q._id] === q.correctAnswer) acc++;
    return acc;
  }, 0);

  const percentage = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  const getColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hrs > 0 ? hrs + "h " : ""}${
    mins > 0 ? mins + "m " : ""
  }${secs}s`;
};

  // ================= UI =================
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        🧠 Trial Practice
      </h2>

      {/* ⏱️ TIMER DISPLAY */}
<div className="mb-4 flex justify-between items-center text-sm text-gray-600">
  <span>⏱️ Time Spent</span>
  <span className="font-semibold text-blue-600">
    {formatTime(time)}
  </span>
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

      {/* 🔥 QUESTION TRACKER */}
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

          {aiLoading && (
            <p className="mt-3 text-gray-500">Thinking...</p>
          )}

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
              <button
                onClick={next}
                className="flex items-center gap-2"
              >
                Next <FaArrowRight />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= RESULT POPUP ================= */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-center mb-4">
              🎉 Trial Result
            </h2>

            <h1 className={`text-4xl text-center ${getColor()}`}>
              {backendResult?.score ?? score}/{questions.length}
            </h1>

            <p className={`text-center font-bold ${getColor()}`}>
              {backendResult?.percentage ?? percentage}%
            </p>

            <p className="text-center mt-2 text-sm font-semibold capitalize text-gray-700">
  Performance:{" "}
  <span className="text-blue-600">
    {backendResult?.performance || "—"}
  </span>
</p>

            {/* RATIONALE */}
            <div className="mt-6 space-y-4">
              {questions.map((q, index) => {
                const userAns = answers[q._id] ? "bg-green-500 text-white" : "bg-gray-200";
                const correct = q.correctAnswer;

                return (
                  <div
                    key={q._id}
                    className="p-4 border rounded-lg"
                  >
                    <p className="font-semibold">
                      {index + 1}. {q.question}
                    </p>

                    <p>
                      Your Answer:{" "}
                      <span className="text-blue-600">
                        {userAns || "None"}
                      </span>
                    </p>

                    <p>
                      Correct Answer:{" "}
                      <span className="text-green-600">
                        {correct}
                      </span>
                    </p>

                    {q.rationale && (
                      <p className="mt-2 text-sm text-gray-600">
                        📘 {q.rationale}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

             {/* ✅ CLOSE BUTTON NAVIGATES TO PROGRESS */}
        <button
          onClick={() => navigate("/student/progress")}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded"
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