import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import socket from "../api/socket";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const StudentExams = () => {
  const { user } = useAuth();
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, percentage: 0, questionResults: [] });

  const current = questions[currentIndex];

  // ================= FETCH & START EXAM =================
  const startExam = async () => {
    try {
      if (attemptId) return;

      const res = await axios.post("/exam/start", { courseId, subjectId });
      const { attemptId: newAttemptId, questions, duration } = res.data;

      if (!questions || questions.length === 0) {
        toast.error("No exam questions found for this subject.");
        return;
      }

      setAttemptId(newAttemptId);
      setQuestions(questions);
      setTimeLeft(duration);

      const storedAnswers = JSON.parse(localStorage.getItem("examAnswers")) || {};
      const initialAnswers = questions.reduce((acc, q) => {
        acc[q._id] = storedAnswers[q._id] || "";
        return acc;
      }, {});
      setAnswers(initialAnswers);
      localStorage.setItem("examAnswers", JSON.stringify(initialAnswers));
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        toast.error(err.response.data.message || "You cannot take this exam.");
        navigate("/student/dashboard");
      } else {
        toast.error(err.response?.data?.message || "Failed to start exam.");
      }
    }
  };

  useEffect(() => {
    if (!courseId || !subjectId) return;

    startExam();

    socket.on("question:created", startExam);
    socket.on("question:updated", startExam);
    socket.on("question:deleted", startExam);

    const visibilityHandler = () => {
      if (document.hidden) {
        document.body.style.filter = "blur(6px)";
        toast.error("Tab switched! Stay focused ⚠️");
      } else {
        document.body.style.filter = "";
      }
    };

    document.addEventListener("visibilitychange", visibilityHandler);

    return () => {
      socket.off("question:created", startExam);
      socket.off("question:updated", startExam);
      socket.off("question:deleted", startExam);
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
  }, [courseId, subjectId]);

  // ================= TIMER =================
  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && !submitted && questions.length > 0) handleSubmit();
  }, [timeLeft, submitted, questions]);

  // ================= ANSWER SELECTION =================
  const handleSelect = async (qId, option) => {
    if (submitted) return;

    const updated = { ...answers, [qId]: option };
    setAnswers(updated);
    localStorage.setItem("examAnswers", JSON.stringify(updated));

    if (attemptId) {
      try {
        await axios.post("/exam/save-progress", {
          attemptId,
          answers: updated,
        });
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }
  };

  // ================= NAVIGATION =================
  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  // ================= SUBMIT EXAM =================
  const handleSubmit = async () => {
    if (!attemptId) return;

    try {
      const res = await axios.post("/exam/submit", {
        attemptId,
        answers,
      });

      setSubmitted(true);
      setScoreData({
        score: res.data.score,
        percentage: res.data.percentage,
        questionResults: res.data.questionResults || []
      });
      setShowResult(true);

      localStorage.removeItem("examAnswers");
      toast.success("Exam submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit exam.");
    }
  };

  // ================= PROGRESS =================
  const progress = questions.length
    ? Math.round((Object.keys(answers).length / questions.length) * 100)
    : 0;

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📝 Exam Mode</h2>

          {timeLeft > 0 && !submitted && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold">
              ⏱ {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}
            </div>
          )}
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% completed</p>
        </div>

        {/* QUESTION CARD */}
        {current && !submitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-5">
              Question {currentIndex + 1} of {questions.length}
            </h3>

            <p className="mb-6 text-gray-700 font-medium">{current.question || "Question deleted"}</p>

            <div className="space-y-3">
              {current.options?.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const selected = answers[current._id] === letter;

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(current._id, letter)}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      selected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-bold mr-2">{letter}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* NAVIGATION */}
            <div className="flex justify-between mt-6">
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-lg bg-gray-500 text-white disabled:opacity-40"
              >
                Prev
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={next}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULT MODAL - FIXED VERSION */}
        {showResult && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-xl overflow-y-auto max-h-[80vh]">
              <h2 className="text-2xl font-bold text-center mb-4">🎉 Exam Completed!</h2>

              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-blue-600">
                  {scoreData.score} / {questions.length}
                </h1>
                <p className="text-lg text-gray-600">{scoreData.percentage}%</p>
              </div>

              <div className="space-y-4">
                {questions.map((q, i) => {
                  // Get the user's answer (letter like A, B, C, D)
                  const userAnswerLetter = answers[q._id];
                  
                  // Find the actual option text for the user's answer
                  const userAnswerText = userAnswerLetter && q.options 
                    ? q.options[userAnswerLetter.charCodeAt(0) - 65] 
                    : null;
                  
                  // Get the correct answer letter and text
                  const correctAnswerLetter = q.correctAnswer;
                  const correctAnswerText = correctAnswerLetter && q.options 
                    ? q.options[correctAnswerLetter.charCodeAt(0) - 65] 
                    : null;
                  
                  // Compare letters (not the text)
                  const isCorrect = userAnswerLetter === correctAnswerLetter;

                  return (
                    <div key={q._id} className="p-4 border rounded-lg">
                      <p className="font-semibold mb-2">
                        {i + 1}. {q.question}
                      </p>

                      <div className="space-y-1">
                        <p className={isCorrect ? "text-green-600" : "text-red-600"}>
                          <span className="font-medium">Your Answer:</span> {userAnswerLetter || "None"}
                          {userAnswerText && ` - ${userAnswerText}`}
                        </p>

                        {!isCorrect && (
                          <p className="text-green-600">
                            <span className="font-medium">Correct Answer:</span> {correctAnswerLetter}
                            {correctAnswerText && ` - ${correctAnswerText}`}
                          </p>
                        )}
                      </div>

                      {q.rationale && (
                        <p className="text-sm text-gray-600 mt-2">💡 {q.rationale}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => navigate("/student/dashboard")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExams;