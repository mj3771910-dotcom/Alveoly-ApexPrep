// api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ✅ REQUIRED
});

// Attach token automatically
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

// Optional: global error handler (recommended)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - user may need to login again");
    }

    if (error.response?.status === 403) {
      console.warn("Forbidden - access denied or subscription issue");
    }

    if (!error.response) {
      console.error("Network error - backend might be down");
    }

    return Promise.reject(error);
  }
);

export default API;