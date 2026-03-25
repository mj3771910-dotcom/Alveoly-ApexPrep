import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import passport from "./config/passport.js";
import cors from "cors";

dotenv.config();

// ================= INIT =================
connectDB();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

// ================= CORS (HTTP) =================
const allowedOrigins = [
  "http://localhost:5173",
  CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error("❌ CORS blocked:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ================= HTTP SERVER =================
const httpServer = createServer(app);

// ================= SOCKET.IO =================
export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ================= SOCKET EVENTS =================
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // ===== USER ROOM =====
  socket.on("join:user", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  // ===== ADMIN ROOM =====
  socket.on("join:admin", () => {
    socket.join("admin");
    console.log("🛠️ Admin joined");
  });

  // ===== ERROR HANDLING =====
  socket.on("error", (err) => {
    console.error("❌ Socket error:", err.message);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err.message);
  });

  // ===== DISCONNECT =====
  socket.on("disconnect", (reason) => {
    console.log(`🔴 Client disconnected (${socket.id}):`, reason);
  });
});

// ================= PASSPORT =================
app.use(passport.initialize());

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API is running 🚀",
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

// ================= START SERVER =================
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});