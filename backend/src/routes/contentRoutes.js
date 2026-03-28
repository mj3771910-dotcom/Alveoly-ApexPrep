import express from "express";
import upload from "../middleware/upload.js";
import { uploadContent, getContents } from "../controllers/contentController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadContent);
router.get("/", getContents);

export default router;