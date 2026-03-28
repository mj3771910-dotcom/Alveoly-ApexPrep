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
  const [file, setFile] = useState(null);

  // ✅ SOCKET INIT
  useEffect(() => {
    const newSocket = io("https://alveoly-apexprep-backend.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("🟢 Admin Connected:", newSocket.id);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // ✅ FETCH DATA
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

  // ✅ SOCKET LIVE UPDATES
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

  // ✅ SAVE
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

    // scroll to form on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/ai/delete/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async () => {
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    setLoading(true);

    const res = await axios.post("/ai/upload-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("SUCCESS:", res.data); // ✅ OK

    alert(res.data.message || "Upload successful");
    setFile(null);

  } catch (err) {
    console.error("UPLOAD ERROR:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Upload failed");
  }

  setLoading(false);
};
  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
      
      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================= LEFT: FORM ================= */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm w-full 
                        lg:sticky lg:top-6 h-fit">

          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <FaRobot /> AI Training Panel
          </h2>

          {/* QUESTION */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">
              Question
            </label>
            <textarea
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
              rows="3"
              placeholder="Enter question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          {/* ANSWER */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">
              Manual Answer
            </label>
            <textarea
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium 
                       hover:bg-blue-700 transition text-sm sm:text-base"
          >
            {loading
              ? "Processing..."
              : editingId
              ? "Update QA"
              : "Add QA"}
          </button>
        </div>

        {/* FILE INPUT */}
<div className="mb-4">
  <label className="text-sm text-gray-600 mb-1 block">
    Upload File (PDF, CSV, Image)
  </label>

  <input
    type="file"
    onChange={(e) => setFile(e.target.files[0])}
    className="w-full border p-2 rounded-lg"
  />
</div>

<button
  onClick={handleFileUpload}
  disabled={loading}
  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition mb-3"
>
  {loading ? "Uploading..." : "Upload & Train AI"}
</button>

        {/* ================= RIGHT: HISTORY ================= */}
        <div className="w-full">

          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            AI Knowledge Base
          </h3>

          {history.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm text-center">
              <p className="text-gray-500 text-sm sm:text-base">
                No training data yet 🤖
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  {/* QUESTION */}
                  <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Q: {item.question}
                  </p>

                  {/* ANSWER */}
                  <p className="text-gray-600 text-xs sm:text-sm mb-4">
                    A: {item.answer}
                  </p>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-yellow-200"
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-red-200"
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