import { useState, useEffect } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { FaRobot, FaUser, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AIChat = () => {
   // ✅ MOVE SOCKET HERE
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("https://alveoly-apexprep-backend.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    console.log("🟢 Connected:", newSocket.id);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQA = async () => {
      try {
        const res = await axios.get("/ai/all-admin");
        setQaList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQA();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    if (reference) {
      axios
        .get(`/ai-subscriptions/verify?reference=${reference}`)
        .then((res) => {
          alert("🎉 Subscription activated!");
          if (res.data.active) {
            setSubscription(res.data.subscription);
            const remaining =
              new Date(res.data.subscription.expiryDate) - new Date();
            setTimeLeft(Math.max(remaining, 0));
          }
        })
        .catch(() => alert("❌ Payment verification failed"));

      window.history.replaceState({}, document.title, "/student/ai");
    }
  }, []);

  useEffect(() => {
  if (!socket) return;

  socket.on("newQA", (qa) => setQaList((prev) => [qa, ...prev]));

  socket.on("updateQA", (qa) =>
    setQaList((prev) => prev.map((item) => (item.id === qa.id ? qa : item)))
  );

  socket.on("deleteQA", (id) =>
    setQaList((prev) => prev.filter((item) => item.id !== id))
  );

  return () => {
    socket.off("newQA");
    socket.off("updateQA");
    socket.off("deleteQA");
  };
}, [socket]);

  useEffect(() => {
    const fetchPlansAndSub = async () => {
      try {
        const plansRes = await axios.get("/ai-plans");
        setPlans(plansRes.data);

        const subRes = await axios.get("/ai-subscriptions");
        if (subRes.data.active) {
          setSubscription(subRes.data.subscription);
          const remaining =
            new Date(subRes.data.subscription.expiryDate) - new Date();
          setTimeLeft(Math.max(remaining, 0));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlansAndSub();
  }, []);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          setSubscription(null);
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("/ai/student-history");
        setChats(res.data);
        if (res.data.length > 0) setActiveChatId(res.data[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChats();
  }, []);

  const activeChat = chats.find((c) => c._id === activeChatId);

  useEffect(() => {
  const el = document.getElementById("chat-end");
  el?.scrollIntoView({ behavior: "smooth" });
}, [activeChat, loading]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    if (!subscription) return alert("You must have an active AI subscription!");

    setLoading(true);
    try {
      const res = await axios.post("/ai/student-ask", {
        question,
        chatId: activeChatId,
      });

      setAnswer(res.data.answer);
      setFromDB(res.data.fromDB || false);

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
      setAnswer(err.response?.data?.message || "Error getting AI response");
    }
    setLoading(false);
  };

  const handleDeleteChat = async (id) => {
    try {
      await axios.delete(`/ai/student-history/${id}`);
      setChats((prev) => prev.filter((c) => c._id !== id));
      if (activeChatId === id) setActiveChatId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
  };

  const handleSubscribe = async (planId) => {
    try {
      const res = await axios.post("/ai-subscriptions", { planId });
      window.location.href = res.data.authorization_url;
    } catch (err) {
      alert("Subscription failed. Try again.");
    }
  };

 return (
  <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">

    {/* HEADER */}
    <div className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-gray-600 text-xl"
        >
          ☰
        </button>

        <h2 className="font-bold flex items-center gap-2 text-gray-800 text-lg">
          <FaRobot className="text-blue-600 text-xl" />
          AI Nursing Tutor
        </h2>
      </div>

      {subscription && (
        <span className="text-xs sm:text-sm bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full shadow">
          ⏱ {formatTime(timeLeft)}
        </span>
      )}
    </div>

    {/* MAIN */}
    <div className="flex flex-1 overflow-hidden max-w-7xl w-full mx-auto">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex w-72 flex-col border-r bg-white/80 backdrop-blur">
        <div className="p-4 font-semibold border-b text-gray-700">
          Chats
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setActiveChatId(chat._id)}
              className={`group p-3 rounded-xl cursor-pointer transition flex justify-between items-center ${
                activeChatId === chat._id
                  ? "bg-gradient-to-r from-blue-100 to-purple-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="text-sm truncate text-gray-700">
                {chat.messages[0]?.content?.slice(0, 40) || "New Chat"}
              </p>

              <FaTrash
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat._id);
                }}
                className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
              />
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-72 bg-white h-full shadow-xl p-3">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Chats</h3>
              <button onClick={() => setSidebarOpen(false)}>✕</button>
            </div>

            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => {
                  setActiveChatId(chat._id);
                  setSidebarOpen(false);
                }}
                className="p-3 rounded-lg hover:bg-gray-100"
              >
                {chat.messages[0]?.content?.slice(0, 40)}
              </div>
            ))}
          </div>

          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col relative min-w-0">

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-3 md:px-8 py-6 space-y-4">

          {!subscription && (
            <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-md mx-auto border">
              <h3 className="font-bold mb-4 text-lg text-gray-800">
                Unlock AI Access
              </h3>

              {plans.map((p) => (
                <button
                  key={p._id}
                  onClick={() => handleSubscribe(p._id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg mt-2 hover:scale-[1.02] transition"
                >
                  {p.name} - ${p.price}
                </button>
              ))}
            </div>
          )}

          {!activeChat && subscription && (
            <div className="text-center text-gray-400 mt-20">
              Start a conversation 👇
            </div>
          )}

          {activeChat?.messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "justify-end" : ""
              }`}
            >
              {msg.role === "ai" && (
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-2 rounded-full">
                  <FaRobot />
                </div>
              )}

              <div
  className={`px-4 py-3 text-sm leading-relaxed rounded-2xl max-w-[85%] md:max-w-xl break-words whitespace-pre-wrap shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                    : "bg-white text-gray-700 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="bg-blue-100 p-2 rounded-full">
                  <FaUser />
                </div>
              )}
            </div>
          ))}

          {/* TYPING INDICATOR */}
          {loading && (
            <div className="flex gap-1 px-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
            </div>
          )}

          <div id="chat-end" />
        </div>

        {/* INPUT */}
        {/* INPUT */}
<div className="border-t bg-white/80 backdrop-blur px-2 sm:px-3 md:px-6 py-2 sm:py-3">

  <div className="flex items-center gap-2 max-w-5xl mx-auto w-full min-w-0">

    <input
      className="
        flex-1 min-w-0
        h-10 sm:h-11
        border border-gray-300
        rounded-full
        px-3 sm:px-4
        text-[16px] sm:text-sm   /* 🔥 PREVENT ZOOM */
        focus:ring-2 focus:ring-purple-500
        outline-none
        shadow-sm
      "
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleAsk()}
      placeholder="Ask a nursing question..."
      disabled={!subscription}
    />

    <button
      onClick={handleAsk}
      disabled={!subscription || loading}
      className="
        flex-shrink-0
        h-10 sm:h-11
        px-3 sm:px-6
        text-xs sm:text-sm
        bg-gradient-to-r from-blue-600 to-purple-600
        text-white
        rounded-full
        transition
        disabled:opacity-50
        shadow-md
      "
    >
      Send
    </button>

  </div>
</div>
      </div>
    </div>
  </div>
);
};

export default AIChat;