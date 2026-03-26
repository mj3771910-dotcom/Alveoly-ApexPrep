import { useState, useEffect } from "react";
import axios from "../api/axios";
import { FaTrash } from "react-icons/fa";

const AIGenerator = () => {
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/ai/history");
        setHistory(res.data);
        if (res.data.length > 0) setActiveId(res.data[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

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

  const handleCopy = () => {
    if (!activeItem) return;
    navigator.clipboard.writeText(activeItem.result);
  };

  const handleDownloadPDF = () => {
    if (!activeItem) return;

    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>${activeItem.subject}</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            pre { white-space: pre-wrap; }
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/ai/history/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));
      if (activeId === id) setActiveId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-3 flex justify-between items-center">
        
        <div className="flex items-center gap-3">
          {/* HAMBURGER */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-600"
          >
            ☰
          </button>

          <h2 className="font-semibold text-gray-700">
            🤖 AI Question Generator
          </h2>
        </div>

        {activeItem && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="text-xs sm:text-sm bg-green-500 text-white px-3 py-1 rounded"
            >
              Copy
            </button>
            <button
              onClick={handleDownloadPDF}
              className="text-xs sm:text-sm bg-purple-500 text-white px-3 py-1 rounded"
            >
              PDF
            </button>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:flex md:w-72 bg-white border-r flex-col">
          <div className="p-4 font-semibold border-b">History</div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {history.map((item) => (
              <div
                key={item._id}
                onClick={() => setActiveId(item._id)}
                className={`group p-3 rounded-lg cursor-pointer flex justify-between ${
                  activeId === item._id
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <div>
                  <p className="text-sm truncate font-medium">
                    {item.subject}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                <FaTrash
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE SIDEBAR */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 flex">
            <div className="w-72 bg-white h-full shadow-lg p-3">
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold">History</h3>
                <button onClick={() => setSidebarOpen(false)}>✕</button>
              </div>

              {history.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setActiveId(item._id);
                    setSidebarOpen(false);
                  }}
                  className="p-3 rounded-lg hover:bg-gray-100"
                >
                  {item.subject}
                </div>
              ))}
            </div>

            <div
              className="flex-1 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">

          {/* SCROLL AREA */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">

            {loading ? (
              <p className="text-center text-gray-400 mt-20">
                Generating questions...
              </p>
            ) : activeItem ? (
              <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">
                  {activeItem.subject}
                </h3>

                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {activeItem.result}
                </pre>
              </div>
            ) : (
              <p className="text-center text-gray-400 mt-20">
                Generate your first questions 👇
              </p>
            )}

          </div>

          {/* STICKY INPUT */}
          <div className="sticky bottom-0 bg-white border-t p-3">
            <div className="max-w-3xl mx-auto flex gap-2">
              
              <input
                type="text"
                placeholder="Enter subject..."
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <input
                type="number"
                className="w-20 border rounded-full px-3 py-2 text-sm"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />

              <button
                onClick={handleGenerate}
                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700"
              >
                {loading ? "..." : "Generate"}
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIGenerator;