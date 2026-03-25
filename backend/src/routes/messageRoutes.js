import express from "express";
import {
  createMessage,
  getMessages,
  markAsReplied,
} from "../controllers/messageController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createMessage); // public
router.get("/", protect, adminOnly, getMessages); // admin
router.patch("/:id/replied", protect, adminOnly, markAsReplied);

export default router;