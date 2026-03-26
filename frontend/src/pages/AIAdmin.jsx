import { useState, useEffect } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { FaEdit, FaTrash, FaRobot } from "react-icons/fa";

const AIAdmin = () => {
  const [socket, setSocket] = useState(null);

  const [question, setQuestion] = useState("");
  const [manualAnswer, setManualAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= SOCKET =================
  useEffect(() => {
    const newSocket = io("https://alveoly-apexprep-backend.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // ================= FETCH =================
  useEffect(() => {
    const fetchQA = async () => {
      try {
        const res = await axios.get("/ai/all-admin");
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQA();
  }, []);

  // ================= SOCKET EVENTS =================
  useEffect(() => {
    if (!socket) return;

    socket.on("newQA", (qa) => {
      setHistory((prev) => [qa, ...prev]);
    });

    socket.on("updateQA", (qa) => {
      setHistory((prev) =>
        prev.map((item) => (item.id === qa.id ? qa : item))
      );
    });

    socket.on("deleteQA", (id) => {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    });

    return () => {
      socket.off("newQA");
      socket.off("updateQA");
      socket.off("deleteQA");
    };
  }, [socket]);

  // ================= SAVE =================
  const handleSave = async () => {
    if (!question.trim() || !manualAnswer.trim()) return;
    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`/ai/update/${editingId}`, {
          question,
          answer: manualAnswer,
        });
        setEditingId(null);
      } else {
        await axios.post("/ai/admin-ask", {
          question,
          manualAnswer,
        });
      }

      setQuestion("");
      setManualAnswer("");
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleEdit = (qa) => {
    setQuestion(qa.question);
    setManualAnswer(qa.answer);
    setEditingId(qa.id);

    // Smooth scroll for mobile UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/ai/delete/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-6">
    
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ================= FORM ================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border 
                      lg:sticky lg:top-6 h-fit">

        <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-700">
          <FaRobot className="text-blue-600" /> AI Training Panel
        </h2>

        {/* QUESTION */}
        <div className="mb-5">
          <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
            Question
          </label>
          <textarea
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
            rows="3"
            placeholder="Enter question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        {/* ANSWER */}
        <div className="mb-5">
          <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
            Manual Answer
          </label>
          <textarea
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
            rows="4"
            placeholder="Enter manual answer..."
            value={manualAnswer}
            onChange={(e) => setManualAnswer(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium 
                     hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : editingId
            ? "Update QA"
            : "Add QA"}
        </button>
      </div>

      {/* ================= HISTORY ================= */}
      <div className="w-full">

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
            AI Knowledge Base
          </h3>
          <span className="text-xs text-gray-400">
            {history.length} entries
          </span>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
            <FaRobot className="mx-auto text-3xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              No training data yet 🤖
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border shadow-sm hover:shadow-md transition"
              >
                {/* QUESTION */}
                <p className="font-semibold text-gray-800 mb-2 text-sm leading-relaxed">
                  Q: {item.question}
                </p>

                {/* ANSWER */}
                <p className="text-gray-600 text-xs sm:text-sm mb-4 leading-relaxed">
                  A: {item.answer}
                </p>

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-xs hover:bg-yellow-200 transition"
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-200 transition"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default AIAdmin;