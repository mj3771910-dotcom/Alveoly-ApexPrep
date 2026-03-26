import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";

import Navbar from "./Navbar";
import Footer from "./Footer";
import loginIllustration from "../assets/login-illustration.png";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setGoogleReady(true); // ✅ prevent multiple init issue
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= EMAIL LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(form);

      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleAuth = async (credentialResponse) => {
    try {
      setGoogleLoading(true);

      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("No Google credential received");

      const res = await googleLogin(idToken);

      console.log("GOOGLE RESPONSE:", res);

      if (res.requiresCourse) {
        navigate("/select-course");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert(err.response?.data?.message || err.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl max-w-5xl w-full md:flex overflow-hidden"
        >
          {/* LEFT */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <img src={loginIllustration} className="w-full max-w-sm" />
          </div>

          {/* RIGHT */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">Welcome Back 👋</h2>
            <p className="text-gray-500 mb-6">
              Login to continue your learning journey
            </p>

            {/* GOOGLE */}
            <div className="mb-4 text-center">
              {googleReady && !googleLoading && (
                <GoogleLogin
                  onSuccess={handleGoogleAuth}
                  onError={() => alert("Google login failed")}
                />
              )}

              {googleLoading && (
                <p className="text-sm text-gray-500 mt-2">
                  Signing in with Google...
                </p>
              )}
            </div>

            <div className="text-center text-gray-400 mb-6 text-sm">OR</div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Email Address"
                  className="w-full pl-10 py-3 border rounded-lg"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 border rounded-lg"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button
                disabled={loading}
                className={`w-full py-3 text-white rounded-lg ${
                  loading ? "bg-gray-400" : "bg-blue-600"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 font-semibold">
                Sign Up
              </Link>
            </p>

            <p className="text-center text-sm mt-2">
              <Link to="/forgot-password" className="text-blue-600">
                Forgot Password?
              </Link>
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default LoginPage;