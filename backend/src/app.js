import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import aiPlanRoutes from "./routes/aiPlanRoutes.js";
import aiSubscriptionRoutes from "./routes/aiSubscriptionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import trialRoutes from "./routes/trialRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

// ✅ FIXED CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai-subscriptions", aiSubscriptionRoutes);
app.use("/api/ai-plans", aiPlanRoutes); 
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trial", trialRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/stat", statsRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/messages", messageRoutes);

export default app;