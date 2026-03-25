import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/api";
import socket from "../api/socket.js"; // ✅ Global socket

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= SOCKET =================
  const connectSocket = (userData) => {
    if (userData?._id) {
      socket.connect();
      socket.emit("join:user", userData._id);
    }
  };

  const disconnectSocket = () => {
    if (socket.connected) socket.disconnect();
  };

  // ================= FETCH CURRENT USER =================
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await API.get("/auth/me"); // Axios interceptor adds token automatically
      setUser(res.data);

      // Connect socket
      connectSocket(res.data);

    } catch (err) {
      console.error("Fetch user error:", err);

      // Invalid/expired token
      localStorage.removeItem("token");
      setUser(null);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ================= EMAIL / PASSWORD LOGIN =================
  const login = async (form) => {
    try {
      const res = await API.post("/auth/login", form);
      const token = res.data.token;

      localStorage.setItem("token", token);
      await fetchUser(); // Fetch user data + connect socket
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
  // idToken: Google credential token
  const googleLogin = async (idToken) => {
    try {
      const res = await API.post("/auth/google-login", { idToken });
      const { token, user: userData } = res.data;

      localStorage.setItem("token", token);
      setUser(userData);
      connectSocket(userData);

      return userData; // For redirect logic in frontend
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
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
        loading,
        login,
        register,
        logout,
        googleLogin, // ✅ Use this in LoginPage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);