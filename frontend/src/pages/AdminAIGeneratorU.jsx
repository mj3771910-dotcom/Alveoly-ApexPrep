import { useState, useEffect } from "react";
import axios from "../api/axios";

const AIGenerator = () => {
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // ✅ Fetch history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/ai/history");
        setHistory(res.data);

        if (res.data.length > 0) {
          setActiveId(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, []);

  // ✅ Generate questions (saved in backend)
  const handleGenerate = async () => {
    if (!subject.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post("/ai/generate-questions", {
        subject,
        count,
      });

      setHistory((prev) => [res.data, ...prev]);
      setActiveId(res.data._id);
      setSubject("");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const activeItem = history.find((item) => item._id === activeId);

  // ✅ Copy
  const handleCopy = () => {
    if (!activeItem) return;
    navigator.clipboard.writeText(activeItem.result);
  };

  // ✅ PDF Export
  const handleDownloadPDF = () => {
    if (!activeItem) return;

    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>${activeItem.subject}</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            h2 { margin-bottom: 20px; }
            pre { white-space: pre-wrap; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>${activeItem.subject}</h2>
          <pre>${activeItem.result}</pre>
        </body>
      </html>
    `);
    win.print();
  };

  // ✅ Delete from backend
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/ai/history/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));

      if (activeId === id) {
        setActiveId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ================= SIDEBAR ================= */}
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b font-semibold text-lg">
          AI Generator
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">No history yet</p>
          ) : (
            history.map((item) => (
              <div
                key={item._id}
                onClick={() => setActiveId(item._id)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  activeId === item._id
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <p className="text-sm font-medium truncate">
                  {item.subject}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  className="text-red-500 text-xs mt-1 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="bg-white border-b p-4 flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            AI Question Generator 🤖
          </h2>

          {activeItem && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded"
              >
                Copy
              </button>

              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1 text-sm bg-purple-500 text-white rounded"
              >
                PDF
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400 mt-20">
              Generating questions...
            </div>
          ) : activeItem ? (
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                {activeItem.subject}
              </h3>

              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {activeItem.result}
              </pre>
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-20">
              Start by generating a question set 👇
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="border-t bg-white p-4">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Enter subject (e.g. Pharmacology)"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <input
              type="number"
              className="w-20 border rounded-lg px-2 py-2 text-sm"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />

            <button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-4 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              {loading ? "..." : "Generate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;