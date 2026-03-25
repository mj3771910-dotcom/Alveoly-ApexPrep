import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";

/**
 * ================= REQUIRE SUBJECT ACCESS =================
 * Allows access if:
 * - User has active plan that includes the subject
 * - OR user purchased the subject (and not expired)
 */
export const requireSubjectAccess = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const subjectId = req.params.subjectId || req.query.subjectId;

    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    const now = new Date();

    // ================= 1. SUBJECT PURCHASE =================
    const subjectPayment = await Payment.findOne({
      userId,
      subjectId,
      status: "success",
      expiresAt: { $gt: now }, // ✅ MUST NOT be expired
    });

    if (subjectPayment) {
      return next();
    }

    // ================= 2. PLAN ACCESS =================
    const planPayment = await Payment.findOne({
      userId,
      planId: { $ne: null },
      status: "success",
      expiresAt: { $gt: now }, // ✅ MUST NOT be expired
    }).populate({
      path: "planId",
      populate: {
        path: "subjects",
        select: "_id",
      },
    });

    if (planPayment && planPayment.planId) {
      const hasAccess = planPayment.planId.subjects.some(
        (subj) => subj._id.toString() === subjectId.toString()
      );

      if (hasAccess) {
        return next();
      }
    }

    // ================= DENY =================
    return res.status(403).json({
      message: "Access denied. No active plan or subject purchase.",
    });
  } catch (err) {
    console.error("Access Middleware Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};