import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/api";
import socket from "../api/socket.js"; // ✅ Socket connection

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= SOCKET =================
  const connectSocket = (userData) => {
    if (userData?._id) {
      socket.emit("join:user", userData._id);
    }
  };

  const disconnectSocket = () => {
    socket.disconnect();
  };

  // ================= FETCH USER =================
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Axios interceptor automatically adds token
      const res = await API.get("/auth/me");

      setUser(res.data);

      // Connect socket
      connectSocket(res.data);

    } catch (err) {
      console.error("Fetch user error:", err);

      // Token invalid or expired
      localStorage.removeItem("token");
      setUser(null);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ================= LOGIN =================
  const login = async (form) => {
    try {
      const res = await API.post("/auth/login", form);
      const token = res.data.token;

      localStorage.setItem("token", token);
      await fetchUser();
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  // ================= REGISTER =================
  const register = async (form) => {
    try {
      const res = await API.post("/auth/register", form);
      const token = res.data.token;

      localStorage.setItem("token", token);
      await fetchUser();
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    }
  };

  // ================= GOOGLE LOGIN =================
  // token: backend JWT returned from /auth/google-login
  // userData: optional pre-fetched user object
  const handleGoogleLogin = async (token, userData = null) => {
    localStorage.setItem("token", token);

    if (userData) {
      // Use provided user object (from /auth/google-login)
      setUser(userData);
      connectSocket(userData);
    } else {
      // Fetch user from backend
      await fetchUser();
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    disconnectSocket();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        handleGoogleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);