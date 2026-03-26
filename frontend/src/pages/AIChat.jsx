import { useState, useEffect } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { FaRobot, FaUser, FaTrash, FaBars } from "react-icons/fa";

const AIChat = () => {
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const newSocket = io("https://alveoly-apexprep-backend.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
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
      axios.get(`/ai-subscriptions/verify?reference=${reference}`)
        .then((res) => {
          if (res.data.active) {
            setSubscription(res.data.subscription);
            const remaining =
              new Date(res.data.subscription.expiryDate) - new Date();
            setTimeLeft(Math.max(remaining, 0));
          }
        });

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

  const handleAsk = async () => {
    if (!question.trim()) return;
    if (!subscription) return alert("You must have an active AI subscription!");

    setLoading(true);
    try {
      const res = await axios.post("/ai/student-ask", {
        question,
        chatId: activeChatId,
      });

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
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeleteChat = async (id) => {
    try {
      await axios.delete(`/ai/student-history/${id}`);
      setChats((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
  };

  const handleSubscribe = async (planId) => {
    const res = await axios.post("/ai-subscriptions", { planId });
    window.location.href = res.data.authorization_url;
  };

 return (
  <div className="h-screen flex bg-gray-100 overflow-hidden">

    {/* MOBILE MENU */}
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="md:hidden fixed top-3 left-3 z-50 bg-white p-2 rounded shadow"
    >
      <FaBars />
    </button>

    {/* SIDEBAR */}
    <div
      className={`
        fixed md:static z-40 top-0 left-0 h-full bg-white border-r w-64
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300
      `}
    >
      <div className="p-4 font-semibold border-b text-sm">💬 Chats</div>

      <div className="h-[calc(100%-60px)] overflow-y-auto p-2 space-y-2">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => {
              setActiveChatId(chat._id);
              setSidebarOpen(false);
            }}
            className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 flex justify-between items-center"
          >
            <p className="text-xs truncate w-[85%]">
              {chat.messages[0]?.content}
            </p>

            <FaTrash
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat._id);
              }}
              className="text-red-400 text-xs"
            />
          </div>
        ))}
      </div>
    </div>

    {/* MAIN */}
    <div className="flex-1 flex flex-col relative">

      {/* HEADER */}
      <div className="p-3 md:p-4 border-b bg-white flex justify-between items-center shrink-0">
        <h2 className="font-semibold flex items-center gap-2 text-sm md:text-lg">
          <FaRobot /> AI Tutor
        </h2>

        {subscription && (
          <span className="text-xs bg-green-100 px-2 py-1 rounded-full">
            {formatTime(timeLeft)}
          </span>
        )}
      </div>

      {/* CHAT AREA (ONLY SCROLL HERE) */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4 pb-24">

        {!subscription && (
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="mb-2 text-sm">Subscribe to use AI</p>
            {plans.map((p) => (
              <button
                key={p._id}
                onClick={() => handleSubscribe(p._id)}
                className="block w-full bg-blue-600 text-white py-2 rounded mt-2 text-sm"
              >
                {p.name} - ${p.price}
              </button>
            ))}
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
              <div className="bg-gray-200 p-2 rounded-full text-xs">
                <FaRobot />
              </div>
            )}

            <div
              className={`max-w-[80%] md:max-w-xl px-3 py-2 md:px-4 md:py-3 rounded-2xl text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              {msg.content}
            </div>

            {msg.role === "user" && (
              <div className="bg-blue-200 p-2 rounded-full text-xs">
                <FaUser />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* INPUT (FIXED — DOES NOT MOVE) */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t p-2 md:p-3 flex gap-2">
        <input
          className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          disabled={!subscription}
        />

        <button
          onClick={handleAsk}
          disabled={!subscription || loading}
          className="bg-blue-600 text-white px-4 md:px-5 rounded-full text-sm"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  </div>
);
};

export default AIChat;