import axios from "axios";
import Payment from "../models/Payment.js";
import Subject from "../models/Subject.js";
import { io } from "../../server.js";
import Plan from "../models/Plan.js";

// ================= HELPER: CALCULATE EXPIRY =================
const calculateExpiry = (duration, unit) => {
  const now = new Date();

  if (!duration || duration <= 0) {
    duration = 30;
    unit = "days";
  }

  const expiry = new Date(now);

  switch (unit) {
    case "minutes":
      expiry.setMinutes(expiry.getMinutes() + duration);
      break;
    case "hours":
      expiry.setHours(expiry.getHours() + duration);
      break;
    case "days":
      expiry.setDate(expiry.getDate() + duration);
      break;
    case "weeks":
      expiry.setDate(expiry.getDate() + duration * 7);
      break;
    case "months":
      expiry.setMonth(expiry.getMonth() + duration);
      break;
    default:
      expiry.setDate(expiry.getDate() + 30);
  }

  return expiry;
};

// ================= PLAN PAYMENT =================
export const initiatePlanPayment = async (req, res) => {
  try {
    const { planId } = req.body;
    const user = req.user;

    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // ✅ Prevent buying active plan again
    const existingActivePlan = await Payment.findOne({
      userId: user._id,
      planId,
      status: "success",
      expiresAt: { $gt: new Date() },
    });

    if (existingActivePlan) {
      return res.status(400).json({
        message: "You already have an active plan",
      });
    }

    const reference = `plan_${Date.now()}_${user._id}`;

    await Payment.create({
      userId: user._id,
      planId,
      amount: plan.price,
      reference,
      status: "pending",
      accessType: "plan",
    });

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: plan.price * 100,
        reference,
        callback_url: `${process.env.CLIENT_URL}/payment-success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.json({
      authorizationUrl: response.data.data.authorization_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Plan payment failed" });
  }
};

// ================= SUBJECT PAYMENT =================
export const initiatePayment = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const user = req.user;

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // ✅ Prevent buying active subject again
    const existing = await Payment.findOne({
      userId: user._id,
      subjectId,
      status: "success",
      expiresAt: { $gt: new Date() },
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have access to this subject",
      });
    }

    const reference = `ref_${Date.now()}_${user._id}`;

    await Payment.create({
      userId: user._id,
      subjectId,
      amount: subject.price,
      reference,
      status: "pending",
      accessType: "subject",
    });

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: subject.price * 100,
        reference,
        callback_url: `${process.env.CLIENT_URL}/payment-success?courseId=${subject.courseId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.json({
      authorizationUrl: response.data.data.authorization_url,
    });
  } catch (err) {
    console.error("Payment Init Error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

// ================= VERIFY PAYMENT =================
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "success") {
      return res.json({ message: "Already verified" });
    }

    payment.status = "success";

    // ================= PLAN =================
    if (payment.planId) {
      const plan = await Plan.findById(payment.planId);

      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const expiresAt = calculateExpiry(plan.duration, plan.durationUnit);

      payment.expiresAt = expiresAt;
      await payment.save();

      // ❌ NO MORE SUBJECT UNLOCKING HERE
      // ✅ Access will be controlled via middleware using expiry

      return res.json({
        message: "Plan activated successfully",
        expiresAt,
      });
    }

    // ================= SUBJECT =================
    const subject = await Subject.findById(payment.subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const expiresAt = calculateExpiry(1, "months");

    payment.expiresAt = expiresAt;
    await payment.save();

    // ✅ Subject unlock (allowed here)
    if (!subject.studentsUnlocked) {
      subject.studentsUnlocked = [];
    }

    const exists = subject.studentsUnlocked.some(
      (id) => id.toString() === payment.userId.toString()
    );

    if (!exists) {
      subject.studentsUnlocked.push(payment.userId);
      await subject.save();
    }

    io.emit("subject:updated", subject);

    return res.json({
      message: "Subject unlocked successfully",
      expiresAt,
    });
  } catch (err) {
    console.error("Verify Payment Error:", err.response?.data || err.message);
    res.status(500).json({ message: "Verification failed" });
  }
};

// ================= USER PAYMENTS =================
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate("subjectId", "name")
      .populate("planId", "title")
      .sort({ createdAt: -1 });

    const formatted = payments.map((p) => ({
      _id: p._id,
      planId: p.planId?._id || null,
      planTitle: p.planId?.title || null,
      subject: p.subjectId?.name || null,
      amount: p.amount,
      status: p.status,
      expiresAt: p.expiresAt,
      isExpired: p.expiresAt ? new Date(p.expiresAt) < new Date() : false,
      date: p.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Get My Payments Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ADMIN PAYMENTS =================
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("subjectId", "name")
      .populate("planId", "title")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const formatted = payments.map((p) => ({
      _id: p._id,
      student: p.userId?.name || "N/A",
      email: p.userId?.email || "N/A",
      type: p.planId ? "Plan" : "Subject",
      title: p.planId?.title || p.subjectId?.name || "N/A",
      amount: p.amount,
      status: p.status,
      expiresAt: p.expiresAt || null,
      isExpired: p.expiresAt ? new Date(p.expiresAt) < new Date() : false,
      date: p.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Get All Payments Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE =================
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    await payment.deleteOne();

    res.json({ message: "Payment deleted" });
  } catch (err) {
    console.error("Delete Payment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};