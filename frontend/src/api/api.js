import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

// ================= REQUEST INTERCEPTOR =================
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

// ================= RESPONSE INTERCEPTOR =================
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || "";

    // ✅ 1. SESSION KICK (ANTI-SHARING)
    if (
      message.includes("logged out because your account was used on another device")
    ) {
      alert("⚠️ Your account was logged in on another device.");

      localStorage.removeItem("token");

      // optional: clear user data if you store it
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    // ✅ 2. GENERAL UNAUTHORIZED
    else if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default API;