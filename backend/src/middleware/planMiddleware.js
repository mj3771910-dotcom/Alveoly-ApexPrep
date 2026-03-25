import Payment from "../models/Payment.js";

export const requireActivePlan = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const payment = await Payment.findOne({
      userId,
      status: "success",
      planId: { $ne: null },
    }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(403).json({ message: "No active plan" });
    }

    if (payment.expiresAt && new Date(payment.expiresAt) < new Date()) {
      return res.status(403).json({ message: "Plan expired" });
    }

    req.activePlan = payment;
    next();
  } catch (err) {
    console.error("Plan Middleware Error:", err);
    res.status(500).json({ message: "Access verification failed" });
  }
};