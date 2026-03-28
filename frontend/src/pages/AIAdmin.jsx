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
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  // ✅ NEW: extracted text preview
  const [previewText, setPreviewText] = useState("");

  // ================= SOCKET =================
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

  // ================= SOCKET UPDATES =================
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

  // ================= EDIT =================
  const handleEdit = (qa) => {
    setQuestion(qa.question);
    setManualAnswer(qa.answer);
    setEditingId(qa.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/ai/delete/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FILE UPLOAD =================
  const handleFileUpload = async () => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "text/csv",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      return alert("Invalid file type");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const res = await axios.post("/ai/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ SHOW EXTRACTED TEXT
      setPreviewText(res.data.extractedText || "");

      alert(res.data.message || "Upload successful");
      setFile(null);
    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Upload failed");
    }

    setUploading(false);
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">

          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaRobot /> AI Training Panel
          </h2>

          <textarea
            placeholder="Question"
            className="w-full border p-3 rounded-lg mb-3"
            rows="3"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <textarea
            placeholder="Manual Answer"
            className="w-full border p-3 rounded-lg mb-3"
            rows="4"
            value={manualAnswer}
            onChange={(e) => setManualAnswer(e.target.value)}
          />

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg mb-4"
          >
            {loading ? "Processing..." : editingId ? "Update QA" : "Add QA"}
          </button>

          {/* FILE */}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border p-2 rounded-lg mb-2"
          />

          <button
            onClick={handleFileUpload}
            disabled={uploading}
            className="w-full bg-green-600 text-white py-3 rounded-lg"
          >
            {uploading ? "Uploading..." : "Upload & Train AI"}
          </button>

          {/* ✅ PREVIEW TEXT */}
          {previewText && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg max-h-60 overflow-y-auto whitespace-pre-wrap text-sm">
              <strong>Extracted File Text:</strong>
              <br />
              {previewText}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            AI Knowledge Base
          </h3>

          {history.length === 0 ? (
            <div className="bg-white p-6 rounded-xl text-center">
              No training data yet 🤖
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl">
                  <p className="font-semibold">Q: {item.question}</p>
                  <p className="text-sm text-gray-600">A: {item.answer}</p>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(item.id)}>
                      <FaTrash />
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