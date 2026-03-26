import { useEffect, useState } from "react";
import API from "../api/api";
import emailjs from "@emailjs/browser";
import { FaEnvelope, FaReply, FaArrowLeft } from "react-icons/fa";

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [activeMsg, setActiveMsg] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await API.get("/messages");
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const sendReply = async () => {
    if (!replyText || !activeMsg) return;

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_REPLY_TEMPLATE_ID,
        {
          to_email: activeMsg.email,
          message: replyText,
          name: activeMsg.name,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      await API.patch(`/messages/${activeMsg._id}/replied`);

      setReplyText("");
      setActiveMsg(null);
      fetchMessages();

      alert("Reply sent!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* ================= SIDEBAR ================= */}
      <div
        className={`w-full md:w-1/3 bg-white border-r overflow-y-auto 
        ${activeMsg ? "hidden md:block" : "block"}`}
      >
        {/* HEADER */}
        <div className="p-4 border-b flex items-center gap-2">
          <FaEnvelope />
          <h2 className="font-bold text-lg">Inbox</h2>
        </div>

        {messages.length === 0 && (
          <p className="p-4 text-gray-500">No messages</p>
        )}

        {/* MESSAGE LIST */}
        {messages.map((msg) => (
          <div
            key={msg._id}
            onClick={() => setActiveMsg(msg)}
            className={`p-4 border-b cursor-pointer transition ${
              activeMsg?._id === msg._id
                ? "bg-blue-50"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-800 text-sm sm:text-base">
                {msg.name}
              </p>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  msg.status === "pending"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {msg.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {msg.subject}
            </p>
          </div>
        ))}
      </div>

      {/* ================= MESSAGE VIEW ================= */}
      <div
        className={`flex-1 flex flex-col ${
          activeMsg ? "block" : "hidden md:flex"
        }`}
      >
        {!activeMsg ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm sm:text-base">
            Select a message to view
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 sm:p-6 bg-white border-b flex items-center gap-3">
              
              {/* BACK BUTTON (MOBILE ONLY) */}
              <button
                onClick={() => setActiveMsg(null)}
                className="md:hidden text-gray-600"
              >
                <FaArrowLeft />
              </button>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  {activeMsg.subject}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  From: {activeMsg.name} ({activeMsg.email})
                </p>
              </div>
            </div>

            {/* MESSAGE BODY */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50">
              <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {activeMsg.message}
                </p>
              </div>
            </div>

            {/* REPLY BOX */}
            <div className="p-4 bg-white border-t">
              <textarea
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
              />

              <button
                onClick={sendReply}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
              >
                <FaReply />
                Send Reply
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminInbox;