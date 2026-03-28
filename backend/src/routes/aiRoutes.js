import express from "express";
import { 
  askQuestionAdmin, 
  updateQA, 
  deleteQA, 
  askQuestionStudent, 
  getAllAdminQA, 
} from "../controllers/aiController.js";
import { getStudentAIInsights } from "../controllers/aiAnalyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkAISubscription } from "../middleware/aiSubscriptionMiddleware.js";
import { deleteHistory, generateQuestions, getHistory } from "../controllers/aiGeneratorController.js";
import { askStudentAI, deleteChat, getStudentChats } from "../controllers/aiChatController.js";
import multer from "multer";
import { uploadQAFile } from "../controllers/aiController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-file", protect, upload.single("file"), uploadQAFile);
router.post("/ask", protect, checkAISubscription, askQuestionStudent);
router.get("/insights", protect, checkAISubscription, getStudentAIInsights);     // Admin add QA
router.put("/update/:id", protect, updateQA);              // Admin edit
router.delete("/delete/:id", protect, deleteQA);           // Admin delete
router.get("/all-admin", protect, getAllAdminQA);          // Admin view all QA
// Admin add QA
router.post("/admin-ask", protect, askQuestionAdmin);       // Student asks question
// routes/aiRoutes.js

router.post("/generate-questions", protect, generateQuestions);
router.get("/history", protect, getHistory);
router.delete("/history/:id", protect, deleteHistory);
// routes/aiRoutes.js
router.post("/student-ask", protect, checkAISubscription, askStudentAI);
router.get("/student-history", protect, getStudentChats);
router.delete("/student-history/:id", protect, deleteChat);

export default router;