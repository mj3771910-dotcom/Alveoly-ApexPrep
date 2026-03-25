import axios from "axios";

const API = axios.create({
  baseURL: "https://alveoly-apexprep-backend.onrender.com/api",
  // Remove withCredentials if you are using JWT in headers
});

// Interceptor to automatically attach token
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

// Global error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token may be invalid or expired");
      localStorage.removeItem("token"); // clear token automatically
    }
    if (error.response?.status === 403) {
      console.warn("Forbidden - access denied");
    }
    if (!error.response) {
      console.error("Network error - backend might be down");
    }
    return Promise.reject(error);
  }
);

export default API;