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
  googleLogin, // ✅ IMPORT THIS
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


router.post("/google-login", googleLogin); // ✅ frontend sends Google idToken here

// GOOGLE LOGIN
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ GOOGLE CALLBACK (CLEAN)
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback // ✅ USE CONTROLLER
);

export default router;