import { useState, useEffect } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { FaRobot, FaUser, FaTrash } from "react-icons/fa";

const AIChat = () => {
  const [socket, setSocket] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [fromDB, setFromDB] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qaList, setQaList] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  // ================= SOCKET =================
  useEffect(() => {
    const newSocket = io("https://alveoly-apexprep-backend.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // ================= TIMER =================
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ================= FETCH =================
  useEffect(() => {
    axios.get("/ai/all-admin").then((res) => setQaList(res.data));
  }, []);

  useEffect(() => {
    axios.get("/ai-plans").then((res) => setPlans(res.data));
  }, []);

  useEffect(() => {
    axios.get("/ai-subscriptions").then((res) => {
      if (res.data.active) {
        setSubscription(res.data.subscription);
      }
    });
  }, []);

  useEffect(() => {
    axios.get("/ai/student-history").then((res) => {
      setChats(res.data);
      if (res.data.length) setActiveChatId(res.data[0]._id);
    });
  }, []);

  const activeChat = chats.find((c) => c._id === activeChatId);

  // ================= COUNTDOWN =================
  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
  };

  // ================= ASK =================
  const handleAsk = async () => {
    if (!question.trim()) return;
    if (!subscription) return alert("Subscribe to use AI");

    setLoading(true);
    try {
      const res = await axios.post("/ai/student-ask", {
        question,
        chatId: activeChatId,
      });

      setAnswer(res.data.answer);

      let updatedChats;

      if (activeChatId) {
        updatedChats = chats.map((chat) =>
          chat._id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: "user", content: question },
                  { role: "ai", content: res.data.answer },
                ],
              }
            : chat
        );
      } else {
        const newChat = {
          _id: res.data.chatId,
          messages: [
            { role: "user", content: question },
            { role: "ai", content: res.data.answer },
          ],
        };

        updatedChats = [newChat, ...chats];
        setActiveChatId(newChat._id);
      }

      setChats(updatedChats);
      setQuestion("");
    } catch (err) {
      setAnswer("Error");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">

      {/* HEADER */}
      <div className="flex-shrink-0 bg-white border-b px-4 py-3 flex justify-between items-center">

        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden">
            ☰
          </button>

          <h2 className="flex items-center gap-2 font-semibold">
            <FaRobot className="text-blue-600" /> AI Tutor
          </h2>
        </div>

        {subscription && (
          <span className="text-xs bg-green-100 px-3 py-1 rounded-full">
            ⏱ Active
          </span>
        )}
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden min-w-0">

        {/* SIDEBAR */}
        <div className="hidden md:flex w-72 border-r bg-white flex-col">
          <div className="p-4 border-b font-semibold">Chats</div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setActiveChatId(chat._id)}
                className={`flex justify-between p-3 rounded cursor-pointer ${
                  activeChatId === chat._id ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              >
                <p className="truncate text-sm">
                  {chat.messages[0]?.content}
                </p>

                <FaTrash
                  onClick={(e) => {
                    e.stopPropagation();
                    setChats((prev) =>
                      prev.filter((c) => c._id !== chat._id)
                    );
                  }}
                  className="text-gray-400 hover:text-red-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col relative min-w-0">

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-6 pb-28 min-w-0">

            {!subscription && (
              <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto text-center">
                <h3 className="font-semibold mb-3">Subscribe to AI</h3>
              </div>
            )}

            {activeChat?.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : ""
                }`}
              >
                {msg.role === "ai" && <FaRobot />}

                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === "user" && <FaUser />}
              </div>
            ))}
          </div>

          {/* INPUT (FIXED — NO SHIFT EVER) */}
          <div className="flex-shrink-0 bg-white border-t">
            <div className="w-full max-w-4xl mx-auto p-3">

              <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">

                <input
                  className="flex-1 bg-transparent outline-none text-sm"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question..."
                />

                <button
                  onClick={handleAsk}
                  disabled={loading}
                  className="bg-blue-600 text-white px-5 py-2 rounded-full"
                >
                  {loading ? "..." : "Send"}
                </button>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIChat;