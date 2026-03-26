import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBook,
} from "react-icons/fa";

import Navbar from "./Navbar";
import Footer from "./Footer";
import signupIllustration from "../assets/signup-illustration.png";

import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { GoogleLogin } from "@react-oauth/google";

const SignUpPage = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [courses, setCourses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    courseId: "",
  });

  useEffect(() => {
    setGoogleReady(true);

    const fetchCourses = async () => {
      try {
        const res = await API.get("/courses");
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= NORMAL SIGNUP =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.courseId) {
      return alert("Please select a course");
    }

    try {
      setLoading(true);
      await register(form);
      navigate("/student/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE SIGNUP =================
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
      console.error(err);
      alert(err.response?.data?.message || err.message || "Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div className="bg-white shadow-xl rounded-2xl max-w-5xl w-full md:flex overflow-hidden">
          
          {/* LEFT */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <img src={signupIllustration} className="w-full max-w-sm" />
          </div>

          {/* RIGHT */}
          <div className="w-full md:w-1/2 p-10">
            <h2 className="text-3xl font-bold mb-2">Create Account 🚀</h2>

            {/* GOOGLE */}
            <div className="mb-4 text-center">
              {googleReady && !googleLoading && (
                <GoogleLogin
                  onSuccess={handleGoogleAuth}
                  onError={() => alert("Google signup failed")}
                />
              )}

              {googleLoading && (
                <p className="text-sm text-gray-500">
                  Signing in with Google...
                </p>
              )}
            </div>

            <div className="text-center text-gray-400 mb-6 text-sm">OR</div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" placeholder="Full Name" onChange={handleChange} required className="w-full p-3 border rounded-lg" />
              <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 border rounded-lg" />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-lg"
                />
                <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 cursor-pointer">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <select name="courseId" onChange={handleChange} required className="w-full p-3 border rounded-lg">
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default SignUpPage;