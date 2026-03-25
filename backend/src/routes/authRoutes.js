import express from "express";
import passport from "passport";
import {
  register,
  login,
  assignCourse,
  getMyInfo,
  resetPassword,
  forgotPassword,
  googleCallback,
  googleLogin,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Email/Password
router.post("/register", register);
router.post("/login", login);
router.put("/me/course", protect, assignCourse);
router.get("/me", protect, getMyInfo);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Google login via frontend ID token
router.post("/google-login", googleLogin);

// OAuth redirect flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;