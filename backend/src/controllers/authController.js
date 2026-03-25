import User from "../models/User.js";
import Course from "../models/Course.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";



// ================= REGISTER =================
// controllers/authController.js

export const register = async (req, res) => {
  try {
    const { name, email, password, courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course is required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      courseId,
    });

    res.json({
      token: generateToken(user),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Google account trying password login
    if (!user.password) {
      return res.status(400).json({
        message: "Please login with Google",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user),
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const assignCourse = async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) return res.status(400).json({ message: "Course is required" });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { courseId },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/authController.js
export const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("courseId", "_id name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("👉 User course:", user.courseId);

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GOOGLE CALLBACK =================
export const googleCallback = async (req, res) => {
  try {
    const { user } = req; // comes from passport
    const token = generateToken(user);

    // ✅ Redirect to frontend with token & a flag if course is missing
    const requiresCourse = !user.courseId;
    return res.redirect(
      `http://localhost:3000/auth-success?token=${token}&requiresCourse=${requiresCourse}`
    );
  } catch (err) {
    console.error("GOOGLE CALLBACK ERROR:", err);
    return res.redirect("http://localhost:3000/login");
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "No user found" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpire = Date.now() + 1000 * 60 * 15;

  await user.save();

  const resetLink = `http://localhost:5173/reset-password/${token}`;

  res.json({
    email: user.email,
    name: user.name,
    resetLink,
  });
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};