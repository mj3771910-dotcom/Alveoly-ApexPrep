import User from "../models/User.js";
import Question from "../models/Question.js";
import Payment from "../models/Payment.js";
import Subject from "../models/Subject.js";

export const getDashboardStats = async (req, res) => {
  try {
    // ✅ USERS COUNT
    const totalUsers = await User.countDocuments();

    // ✅ QUESTIONS COUNT
    const totalQuestions = await Question.countDocuments();

    // ✅ SUBJECTS COUNT
    const totalSubjects = await Subject.countDocuments();

    // ✅ REVENUE (only successful payments)
    const revenueData = await Payment.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    res.json({
      totalUsers,
      totalQuestions,
      totalSubjects,
      totalRevenue,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};