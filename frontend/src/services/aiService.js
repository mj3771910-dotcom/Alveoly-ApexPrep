import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const askAI = async (question) => {
  const res = await API.post("/ai/ask", { question });
  return res.data.answer;
};