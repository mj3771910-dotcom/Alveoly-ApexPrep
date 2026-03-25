import UserAISubscription from "../models/UserAISubscription.js";

export const checkAISubscription = async (req, res, next) => {
  try {
    const subscription = await UserAISubscription.findOne({
      userId: req.user._id,
      isActive: true,
      paymentStatus: "completed",
      expiryDate: { $gt: new Date() }
    }).sort({ expiryDate: -1 });

    if (!subscription) {
      return res.status(403).json({ message: "Access forbidden: AI subscription or auth issue" });
    }

    req.subscription = subscription;
    next();
  } catch (err) {
    console.error("Subscription check error:", err);
    res.status(500).json({ message: "Server error" });
  }
};