import express from "express";
import upload from "../middleware/upload.js";
import { uploadContent, getContents, deleteContent, updateContent } from "../controllers/contentController.js";

const router = express.Router();

router.post(
  "/upload",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadContent
);
router.get("/", getContents);
router.delete("/:id", deleteContent);
router.put(
  "/:id",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateContent
);

export default router;