import ManualAccess from "../models/ManualAccess.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";

// ================= GRANT ACCESS =================
export const grantManualAccess = async (req, res) => {
  try {
    const { userId, subjectId, durationDays, note } = req.body;

    if (!userId || !subjectId) {
      return res.status(400).json({
        message: "User and Subject are required",
      });
    }

    const user = await User.findById(userId);
    const subject = await Subject.findById(subjectId);

    if (!user || !subject) {
      return res.status(404).json({
        message: "User or Subject not found",
      });
    }

    // Expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (durationDays || 30));

    // Prevent duplicate active access
    const existing = await ManualAccess.findOne({
      userId,
      subjectId,
      expiresAt: { $gt: new Date() },
    });

    if (existing) {
      return res.status(400).json({
        message: "Student already has access",
      });
    }

    const access = await ManualAccess.create({
      userId,
      subjectId,
      grantedBy: req.user._id,
      expiresAt,
      note,
    });

    res.status(201).json({
      message: "Manual access granted",
      access,
    });
  } catch (err) {
    console.error("Grant Manual Access Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET MY MANUAL ACCESS =================
export const getMyManualAccess = async (req, res) => {
  try {
    const now = new Date();

    const access = await ManualAccess.find({
      userId: req.user._id,
      expiresAt: { $gt: now },
    });

    res.json(access);
  } catch (err) {
    console.error("Get Manual Access Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};