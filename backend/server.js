import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import passport from "./config/passport.js";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

// ================= SOCKET SERVER =================
const httpServer = createServer(app);

// Allow multiple origins (important for live + local)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // your production frontend
].filter(Boolean);

export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error("❌ CORS blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // fallback support
  pingTimeout: 60000,   // prevent random disconnects on slow networks
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

// ================= HEALTH CHECK (VERY IMPORTANT FOR DEPLOYMENT) =================
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ================= START SERVER =================
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});