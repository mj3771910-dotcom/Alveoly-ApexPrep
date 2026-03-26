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
  const [menuOpen, setMenuOpen] = useState(false);
const [activeTab, setActiveTab] = useState("form"); // "form" | "history"

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
  <div className="bg-gray-50 min-h-screen">

    {/* HEADER */}
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* HAMBURGER (MOBILE) */}
        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden text-xl"
        >
          ☰
        </button>

        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <FaRobot className="text-blue-600" /> AI Training Panel
        </h2>
      </div>
    </div>

    {/* MOBILE DRAWER */}
    {menuOpen && (
      <div className="fixed inset-0 z-40 flex">
        <div className="w-64 bg-white h-full shadow-lg p-4">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Menu</h3>
            <button onClick={() => setMenuOpen(false)}>✕</button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setActiveTab("form");
                setMenuOpen(false);
              }}
              className={`block w-full text-left p-2 rounded ${
                activeTab === "form"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              ✍️ Training Form
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                setMenuOpen(false);
              }}
              className={`block w-full text-left p-2 rounded ${
                activeTab === "history"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              📚 Knowledge Base
            </button>
          </div>
        </div>

        <div
          className="flex-1 bg-black/30"
          onClick={() => setMenuOpen(false)}
        />
      </div>
    )}

    {/* MAIN */}
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ================= FORM ================= */}
      {(activeTab === "form" || window.innerWidth >= 1024) && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border 
                        lg:sticky lg:top-6 h-fit">

          <h3 className="font-semibold mb-5 text-gray-700">
            {editingId ? "Edit Response" : "Add Training Data"}
          </h3>

          <div className="mb-5">
            <label className="text-xs text-gray-500 mb-1 block">
              Question
            </label>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              rows="3"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="text-xs text-gray-500 mb-1 block">
              Manual Answer
            </label>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              rows="4"
              value={manualAnswer}
              onChange={(e) => setManualAnswer(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : editingId
              ? "Update QA"
              : "Add QA"}
          </button>
        </div>
      )}

      {/* ================= HISTORY ================= */}
      {(activeTab === "history" || window.innerWidth >= 1024) && (
        <div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
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
                  className="bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md transition"
                >
                  <p className="font-semibold text-gray-800 mb-2 text-sm">
                    Q: {item.question}
                  </p>

                  <p className="text-gray-600 text-sm mb-4">
                    A: {item.answer}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs"
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
};

export default AIAdmin;