// api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://alveoly-apexprep-backend.onrender.com/api", // ✅ ADD /api
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 403) {
      console.warn("Access forbidden: AI subscription or auth issue");
    }
    return Promise.reject(err);
  }
);

export default API;