// services/aiService.js
import axios from "axios";

const API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = "https://openrouter.ai/api/v1";

export const askAI = async (question) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content: "You are a professional nursing tutor. Explain clearly and simply.",
          },
          {
            role: "user",
            content: question,
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      }
    );

    return response.data.choices?.[0]?.message?.content || "No response";

  } catch (error) {
    console.error("❌ OPENROUTER ERROR:", error.response?.data || error.message);
    return "AI is currently unavailable.";
  }
};