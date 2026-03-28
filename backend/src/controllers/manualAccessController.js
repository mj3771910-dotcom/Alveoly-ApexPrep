import ManualAccess from "../models/ManualAccess.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import { io } from "../../server.js";

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

    // Prevent duplicate ACTIVE access only
    const existing = await ManualAccess.findOne({
      userId,
      subjectId,
      status: "active",
      expiresAt: { $gt: new Date() },
    });

    if (existing) {
      return res.status(400).json({
        message: "Student already has active access",
      });
    }

    const access = await ManualAccess.create({
      userId,
      subjectId,
      grantedBy: req.user._id,
      expiresAt,
      note,
      status: "active",
    });

    // 🔥 REAL-TIME UPDATE
    io.emit("manualAccess:updated", {
      userId,
      subjectId,
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
      status: "active", // ✅ only active
      expiresAt: { $gt: now }, // ✅ not expired
    });

    res.json(access);
  } catch (err) {
    console.error("Get Manual Access Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ADMIN: GET ALL =================
export const getAllManualAccess = async (req, res) => {
  try {
    const data = await ManualAccess.find()
      .populate("userId", "name email")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    const now = new Date();

    const formatted = data.map((item) => ({
      ...item._doc,
      isActive:
        item.status === "active" &&
        new Date(item.expiresAt) > now,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fetch Manual Access Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE =================
export const deleteManualAccess = async (req, res) => {
  try {
    const access = await ManualAccess.findById(req.params.id);

    if (!access) {
      return res.status(404).json({ message: "Access not found" });
    }

    const userId = access.userId;
    const subjectId = access.subjectId;

    await access.deleteOne();

    // 🔥 REAL-TIME UPDATE
    io.emit("manualAccess:updated", {
      userId,
      subjectId,
    });

    res.json({ message: "Manual access deleted" });
  } catch (err) {
    console.error("Delete Manual Access Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE =================
export const updateManualAccess = async (req, res) => {
  try {
    const { durationDays, note } = req.body;

    const access = await ManualAccess.findById(req.params.id);

    if (!access) {
      return res.status(404).json({ message: "Access not found" });
    }

    if (durationDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(durationDays));
      access.expiresAt = expiresAt;
    }

    if (note !== undefined) {
      access.note = note;
    }

    const updated = await access.save();

    // 🔥 REAL-TIME UPDATE
    io.emit("manualAccess:updated", {
      userId: updated.userId,
      subjectId: updated.subjectId,
    });

    res.json(updated);
  } catch (err) {
    console.error("Update Manual Access Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= TOGGLE (LOCK / UNLOCK) =================
export const toggleManualAccess = async (req, res) => {
  try {
    const access = await ManualAccess.findById(req.params.id);

    if (!access) {
      return res.status(404).json({ message: "Access not found" });
    }

    // toggle
    access.status =
      access.status === "active" ? "locked" : "active";

    const updated = await access.save();

    // 🔥 REAL-TIME UPDATE
    io.emit("manualAccess:updated", {
      userId: updated.userId,
      subjectId: updated.subjectId,
    });

    res.json(updated);
  } catch (err) {
    console.error("Toggle Manual Access Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};