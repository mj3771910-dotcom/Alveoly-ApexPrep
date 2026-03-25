import { useState, useEffect } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { FaEdit, FaTrash, FaRobot } from "react-icons/fa";

const AIAdmin = () => {
  // ✅ ADD SOCKET STATE
  const [socket, setSocket] = useState(null);

  const [question, setQuestion] = useState("");
  const [manualAnswer, setManualAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ INIT SOCKET (SAFE)
  useEffect(() => {
    const newSocket = io("https://alveoly-apexprep-backend.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    console.log("🟢 Admin Connected:", newSocket.id);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);


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

  useEffect(() => {
    socket.on("newQA", (qa) => setHistory((prev) => [qa, ...prev]));
    socket.on("updateQA", (qa) =>
      setHistory((prev) =>
        prev.map((item) => (item.id === qa.id ? qa : item))
      )
    );
    socket.on("deleteQA", (id) =>
      setHistory((prev) => prev.filter((item) => item.id !== id))
    );

    return () => {
      socket.off("newQA");
      socket.off("updateQA");
      socket.off("deleteQA");
    };
  }, []);

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
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/ai/delete/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        
        {/* LEFT: FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit sticky top-6">
          
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaRobot /> AI Training Panel
          </h2>

          {/* Question */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">
              Question
            </label>
            <textarea
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
              placeholder="Enter question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          {/* Answer */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">
              Manual Answer
            </label>
            <textarea
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="4"
              placeholder="Enter manual answer..."
              value={manualAnswer}
              onChange={(e) => setManualAnswer(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {loading
              ? "Processing..."
              : editingId
              ? "Update QA"
              : "Add QA"}
          </button>
        </div>

        {/* RIGHT: HISTORY */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            AI Knowledge Base
          </h3>

          {history.length === 0 && (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <p className="text-gray-500">
                No training data yet 🤖
              </p>
            </div>
          )}

          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition"
              >
                
                {/* Q */}
                <p className="font-semibold text-gray-800 mb-2">
                  Q: {item.question}
                </p>

                {/* A */}
                <p className="text-gray-600 text-sm mb-4">
                  A: {item.answer}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-200"
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdmin;