import express from "express";
import {
  getQuestions,
  createQuestion,
  createMultipleQuestions,
  deleteQuestion,
  updateQuestion,
} from "../controllers/questionController.js";


const router = express.Router();

router.get("/", getQuestions);
router.post("/", createQuestion); // single
router.post("/bulk", createMultipleQuestions); // bulk
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);


export default router;