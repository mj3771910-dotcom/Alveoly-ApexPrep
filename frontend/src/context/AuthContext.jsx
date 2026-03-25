import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/api";
import socket from "../api/socket.js"; // ✅ NEW

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= CONNECT SOCKET =================
  const connectSocket = (userData) => {
    if (userData?._id) {
      socket.emit("join:user", userData._id);
    }
  };

  const disconnectSocket = () => {
    socket.disconnect();
  };

  // ================= FETCH FULL USER =================
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await API.get("/auth/me");

      setUser(res.data);

      // 🔥 CONNECT USER TO SOCKET
      connectSocket(res.data);

    } catch (err) {
      console.error("Fetch user error:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD USER ON START =================
  useEffect(() => {
    fetchUser();
  }, []);

  // ================= LOGIN =================
  const login = async (form) => {
    try {
      const res = await API.post("/auth/login", form);

      const token = res.data.token;

      localStorage.setItem("token", token);

      await fetchUser(); // ✅ fetch full user after login

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

      await fetchUser(); // ✅ fetch full user after register

    } catch (err) {
      console.error("Register error:", err);
      throw err;
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin = async (token) => {
    localStorage.setItem("token", token);
    await fetchUser();
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");

    // 🔥 DISCONNECT SOCKET
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