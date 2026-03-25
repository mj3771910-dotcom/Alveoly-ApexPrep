import Plan from "../models/Plan.js";
import { io } from "../../server.js"; // ✅ NEW

// ================= GET ALL PLANS =================
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().populate("subjects", "name");

    res.json(plans);
  } catch (err) {
    console.error("Fetch Plans Error:", err);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
};

// ================= CREATE =================
export const createPlan = async (req, res) => {
  try {
    const { title, price, subjects, duration, durationUnit } = req.body;

    const plan = await Plan.create({
      title,
      price,
      subjects,
      duration,          // ✅ NEW
      durationUnit,      // ✅ NEW
    });

    const populatedPlan = await plan.populate("subjects", "name");

    // 🔥 REAL-TIME UPDATE
    io.emit("plan:created", populatedPlan);

    res.status(201).json(populatedPlan);
  } catch (err) {
    console.error("Create Plan Error:", err);
    res.status(500).json({ message: "Create failed" });
  }
};

// ================= UPDATE =================
export const updatePlan = async (req, res) => {
  try {
    const { title, price, subjects, duration, durationUnit } = req.body;

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      {
        title,
        price,
        subjects,
        duration,        // ✅ NEW
        durationUnit,    // ✅ NEW
      },
      { new: true }
    ).populate("subjects", "name");

    // 🔥 REAL-TIME UPDATE
    io.emit("plan:updated", plan);

    res.json(plan);
  } catch (err) {
    console.error("Update Plan Error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

// ================= DELETE =================
export const deletePlan = async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);

    // 🔥 REAL-TIME UPDATE
    io.emit("plan:deleted", req.params.id);

    res.json({ message: "Plan deleted" });
  } catch (err) {
    console.error("Delete Plan Error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};