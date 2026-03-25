import UserAISubscription from "../models/UserAISubscription.js";
import AISubscriptionPlan from "../models/AISubscriptionPlan.js";
import axios from "axios";

// ================= INIT PAYMENT =================
export const subscribeToPlan = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await AISubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
        amount: plan.price * 100, // in kobo
        callback_url: `${process.env.CLIENT_URL}/student/ai`,
        metadata: {
          planId: plan._id.toString(),
          userId: req.user._id.toString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return res.json({ authorization_url: response.data.data.authorization_url });
  } catch (err) {
    console.error("INIT ERROR:", err.message);
    return res.status(500).json({ message: "Payment initialization failed" });
  }
};

// ================= VERIFY PAYMENT =================
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ message: "No reference provided" });

    const verify = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });

    const data = verify.data.data;
    if (data.status !== "success") return res.status(400).json({ message: "Payment failed" });

    const planId = data.metadata?.planId || data.metadata?.custom_fields?.planId;
    const userId = data.metadata?.userId || data.metadata?.custom_fields?.userId;

    if (!planId || !userId) return res.status(400).json({ message: "Invalid metadata" });

    const plan = await AISubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Prevent duplicate subscriptions
    const existing = await UserAISubscription.findOne({
      userId,
      planId,
      paymentStatus: "completed",
      expiryDate: { $gt: new Date() }, // only active ones
    });

    if (existing) return res.json({ active: true, subscription: existing });

    // Calculate expiry
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    switch (plan.durationUnit) {
      case "minutes": expiryDate.setMinutes(expiryDate.getMinutes() + plan.durationValue); break;
      case "hours": expiryDate.setHours(expiryDate.getHours() + plan.durationValue); break;
      case "days": expiryDate.setDate(expiryDate.getDate() + plan.durationValue); break;
      case "weeks": expiryDate.setDate(expiryDate.getDate() + plan.durationValue * 7); break;
      case "months": expiryDate.setMonth(expiryDate.getMonth() + plan.durationValue); break;
      case "years": expiryDate.setFullYear(expiryDate.getFullYear() + plan.durationValue); break;
      default: break;
    }

    const subscription = new UserAISubscription({
      userId,
      planId,
      startDate,
      expiryDate,
      paymentStatus: "completed",
      isActive: true,
    });

    await subscription.save();

    return res.json({ active: true, subscription });
  } catch (err) {
    console.error("VERIFY ERROR:", err.message);
    return res.status(500).json({ message: "Verification failed" });
  }
};

// ================= GET CURRENT SUBSCRIPTION =================
export const getSubscription = async (req, res) => {
  try {
    const sub = await UserAISubscription.findOne({ userId: req.user._id })
      .sort({ expiryDate: -1 })
      .populate("planId");

    if (!sub) return res.json({ active: false });

    const active = new Date() < sub.expiryDate;
    return res.json({ active, subscription: sub });
  } catch (err) {
    console.error("GET SUB ERROR:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};