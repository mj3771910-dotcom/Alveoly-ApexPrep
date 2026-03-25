import User from "../models/User.js";
import Course from "../models/Course.js"; // only if you have it

// ================= ADMIN DASHBOARD =================
export const getAdminDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name role");

    res.json({
      name: user.name,
    });

  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= STUDENT DASHBOARD =================
export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("name");

    // If you already have Course model with students field
    let courses = [];
    try {
      courses = await Course.find({ students: userId }).select("name");
    } catch {
      // If Course model not ready yet, just return empty
      courses = [];
    }

    res.json({
      name: user.name,
      courses,
    });

  } catch (error) {
    console.error("STUDENT DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};