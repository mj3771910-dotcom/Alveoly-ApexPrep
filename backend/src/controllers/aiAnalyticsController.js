import TrialAttempt from "../models/TrialAttempt.js";
import { askAI } from "../services/aiService.js";

export const getStudentAIInsights = async (req, res) => {
  try {
    const attempts = await TrialAttempt.find({
      userId: req.user._id,
    }).populate("subjectId", "name");

    if (!attempts.length) {
      return res.json({
        insight: "No data yet. Start practicing to get AI feedback.",
      });
    }

    // 🔥 PREP DATA FOR AI
    const summary = attempts.map((a) => ({
      subject: a.subjectId?.name || "Unknown",
      score: a.percentage,
      performance: a.performance,
    }));

    const prompt = `
You are an intelligent academic coach.

Analyze this student performance:

${JSON.stringify(summary)}

Give:
1. Overall performance summary
2. Weak subjects
3. Strengths
4. भविष्य prediction (next performance)
5. Clear improvement strategy

Keep it short, professional and motivating.
    `;

    const aiResponse = await askAI(prompt);

    res.json({
      insight: aiResponse,
    });

  } catch (error) {
    console.error("AI Insight Error:", error);
    res.status(500).json({
      message: "Failed to generate AI insight",
    });
  }
};