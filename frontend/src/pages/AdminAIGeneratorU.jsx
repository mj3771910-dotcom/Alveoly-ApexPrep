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
  <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">

    {/* MOBILE SIDEBAR */}
    {sidebarOpen && (
      <div className="fixed inset-0 z-40 flex">
        <div className="w-72 max-w-[85%] bg-white/90 backdrop-blur-xl h-full shadow-2xl p-4">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-gray-700">History</h3>
            <button onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <div className="space-y-2 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  setActiveId(item._id);
                  setSidebarOpen(false);
                }}
                className="p-3 rounded-xl hover:bg-gray-100 cursor-pointer text-sm transition"
              >
                {item.subject}
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex-1 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      </div>
    )}

    {/* DESKTOP SIDEBAR */}
    <div className="hidden md:flex md:w-72 flex-col border-r bg-white/80 backdrop-blur-xl">
      <div className="p-5 border-b font-bold text-gray-700 text-lg">
        AI Generator ✨
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-6">
            No history yet
          </p>
        ) : (
          history.map((item) => (
            <div
              key={item._id}
              onClick={() => setActiveId(item._id)}
              className={`group p-3 rounded-xl cursor-pointer transition ${
                activeId === item._id
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="truncate text-sm font-medium">
                {item.subject}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item._id);
                }}
                className="text-red-500 text-xs mt-1 opacity-0 group-hover:opacity-100 transition"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>

    {/* MAIN */}
    <div className="flex-1 flex flex-col">

      {/* HEADER */}
      <div className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b px-3 sm:px-4 py-3 flex justify-between items-center shadow-sm">
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-600 text-xl"
          >
            ☰
          </button>

          <h2 className="font-bold text-gray-800 text-sm sm:text-lg">
            AI Generator 🤖
          </h2>
        </div>

        {activeItem && (
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={handleCopy}
              className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow"
            >
              Copy
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow"
            >
              PDF
            </button>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6">

        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="flex gap-1">
              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        ) : activeItem ? (

          <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl mx-auto flex items-center gap-2 overflow-hidden">

            <h3 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4 text-gray-800">
              {activeItem.subject}
            </h3>

            {/* 🔥 FIXED MOBILE OVERFLOW */}
            <div className="overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed text-gray-700">
                {activeItem.result}
              </pre>
            </div>

          </div>

        ) : (
          <div className="text-center text-gray-400 mt-20 text-sm">
            Start by generating a question set 👇
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="border-t bg-white/80 backdrop-blur px-2 sm:px-4 py-3 sticky bottom-0 z-20">
        <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl mx-auto flex items-center gap-2">

          <input
  type="text"
  placeholder="Enter subject..."
  className="flex-1 h-10 sm:h-11 border border-gray-300 rounded-full px-3 sm:px-4 text-[16px] sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all duration-200"
  value={subject}
  onChange={(e) => setSubject(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
/>

<input
  type="number"
  className="w-14 sm:w-20 h-10 sm:h-11 border border-gray-300 rounded-full px-2 sm:px-3 text-[16px] sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200"
  value={count}
  onChange={(e) => setCount(e.target.value)}
/>

          <button
            onClick={handleGenerate}
            className="h-10 sm:h-11 px-3 sm:px-5 text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-md"
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