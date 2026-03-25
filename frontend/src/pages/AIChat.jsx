import { useState, useEffect } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { FaRobot, FaUser, FaTrash } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(BASE_URL);

const AIChat = () => {
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
  }, []);

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
    <div className="flex h-screen bg-gray-100">
      
      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 font-bold text-lg border-b">💬 AI Chats</div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setActiveChatId(chat._id)}
              className={`p-3 rounded-lg cursor-pointer transition flex justify-between items-center ${
                activeChatId === chat._id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="text-sm truncate">
                {chat.messages[0]?.content}
              </p>

              <FaTrash
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat._id);
                }}
                className="text-red-400 hover:text-red-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <FaRobot /> AI Nursing Tutor
          </h2>

          {subscription && (
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {!subscription && (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <h3 className="font-semibold mb-3">Unlock AI Access</h3>
              {plans.map((p) => (
                <button
                  key={p._id}
                  onClick={() => handleSubscribe(p._id)}
                  className="block w-full bg-blue-600 text-white py-2 rounded-lg mt-2 hover:bg-blue-700"
                >
                  {p.name} - ${p.price}
                </button>
              ))}
            </div>
          )}

          {activeChat?.messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "justify-end" : ""
              }`}
            >
              {msg.role === "ai" && (
                <div className="bg-gray-200 p-2 rounded-full">
                  <FaRobot />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-sm shadow ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="bg-blue-200 p-2 rounded-full">
                  <FaUser />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="p-4 border-t bg-white flex gap-3">
          <input
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a nursing question..."
            disabled={!subscription}
          />
          <button
            onClick={handleAsk}
            disabled={!subscription || loading}
            className="bg-blue-600 text-white px-6 rounded-full hover:bg-blue-700"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;