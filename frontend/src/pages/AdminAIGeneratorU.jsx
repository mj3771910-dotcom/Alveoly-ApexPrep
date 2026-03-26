import { useState, useEffect } from "react";
import axios from "../api/axios";

const AIGenerator = () => {
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // ✅ NEW (hamburger control)
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-gray-50">

      {/* ================= MOBILE SIDEBAR ================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-white h-full shadow-lg p-3">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold text-sm">History</h3>
              <button onClick={() => setSidebarOpen(false)}>✕</button>
            </div>

            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setActiveId(item._id);
                    setSidebarOpen(false);
                  }}
                  className="p-2 rounded hover:bg-gray-100 text-xs"
                >
                  {item.subject}
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex-1 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <div className="hidden md:flex md:w-64 bg-white border-r flex-col">
        <div className="p-4 border-b font-semibold text-base">
          AI Generator
        </div>

        <div className="p-2 space-y-2">
          {history.length === 0 ? (
            <p className="text-gray-400 text-xs">No history yet</p>
          ) : (
            history.map((item) => (
              <div
                key={item._id}
                onClick={() => setActiveId(item._id)}
                className={`p-2 rounded-lg cursor-pointer transition text-sm ${
                  activeId === item._id
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <p className="truncate">{item.subject}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  className="text-red-500 text-xs mt-1"
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
        <div className="bg-white border-b px-3 py-2 flex justify-between items-center sticky top-0 z-20">
          
          <div className="flex items-center gap-2">
            {/* HAMBURGER */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600"
            >
              ☰
            </button>

            <h2 className="font-semibold text-sm sm:text-base">
              AI Question Generator 🤖
            </h2>
          </div>

          {activeItem && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded"
              >
                Copy
              </button>

              <button
                onClick={handleDownloadPDF}
                className="px-2 py-1 text-xs bg-purple-500 text-white rounded"
              >
                PDF
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="px-3 py-4 space-y-4">

          {loading ? (
            <div className="text-center text-gray-400 mt-10 text-sm">
              Generating questions...
            </div>
          ) : activeItem ? (
            <div className="max-w-2xl mx-auto bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-base font-semibold mb-3">
                {activeItem.subject}
              </h3>

              <pre className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-gray-800">
                {activeItem.result}
              </pre>
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-10 text-sm">
              Start by generating a question set 👇
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="sticky bottom-0 border-t bg-white p-3">
          <div className="max-w-2xl mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Enter subject..."
              className="flex-1 border rounded-full px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <input
              type="number"
              className="w-16 border rounded-full px-2 py-2 text-xs"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />

            <button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-3 py-2 rounded-full text-xs sm:text-sm hover:bg-blue-700"
            >
              {loading ? "..." : "Go"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;