import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_URL;

const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

// Optional logs
socket.on("connect", () => {
  console.log("🟢 Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket error:", err.message);
});

export default socket; // ✅ THIS LINE IS THE FIX