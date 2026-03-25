import express from "express";
import passport from "passport";
import { register, login, assignCourse, getMyInfo, resetPassword, forgotPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// EMAIL AUTH
router.post("/register", register);
router.post("/login", login);
router.put("/me/course", protect, assignCourse);
router.get("/me", protect, getMyInfo)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// GOOGLE LOGIN
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GOOGLE CALLBACK
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { token } = req.user;

    // ✅ SINGLE REDIRECT
    res.redirect(
      `http://localhost:5173/auth-success?token=${token}`
    );
  }
);

export default router;