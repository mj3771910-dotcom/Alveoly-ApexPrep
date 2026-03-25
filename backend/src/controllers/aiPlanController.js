// controllers/aiPlanController.js
import AISubscriptionPlan from "../models/AISubscriptionPlan.js";

export const getPlans = async (req, res) => {
  const plans = await AISubscriptionPlan.find({ isActive: true });
  res.json(plans);
};

export const createPlan = async (req, res) => {
  const { name, description, price, durationValue, durationUnit } = req.body;
  const plan = new AISubscriptionPlan({ name, description, price, durationValue, durationUnit });
  await plan.save();
  res.json(plan);
};

export const updatePlan = async (req, res) => {
  const plan = await AISubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(plan);
};

export const deletePlan = async (req, res) => {
  await AISubscriptionPlan.findByIdAndDelete(req.params.id);
  res.json({ message: "Plan deleted" });
};