import express from "express";
import {
  register,
  login,
  assignCourse,
  getMyInfo,
  resetPassword,
  forgotPassword,
  googleLogin,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// EMAIL AUTH
router.post("/register", register);
router.post("/login", login);
router.put("/me/course", protect, assignCourse);
router.get("/me", protect, getMyInfo);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// GOOGLE LOGIN (frontend sends idToken)
router.post("/google-login", googleLogin);

export default router;