import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBook } from "react-icons/fa";

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
  const [courses, setCourses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    courseId: "",
  });

  // FETCH COURSES
  useEffect(() => {
  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");
      if (res.data.length > 0) {
        setCourses(res.data);
      } else {
        throw new Error("No courses");
      }
    } catch (err) {
      console.warn("Using fallback courses");

      setCourses([
        { _id: "temp1", name: "Physiology" },
        { _id: "temp2", name: "Anatomy" },
        { _id: "temp3", name: "Pharmacology" },
      ]);
    }
  };

  fetchCourses();
}, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= EMAIL/PASSWORD SIGNUP =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId) {
      alert("Please select a course");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/student/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE SIGNUP =================
  const handleGoogleSignUp = async (credentialResponse) => {
    try {
      setGoogleLoading(true);

      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("No Google credential received");

      const userData = await googleLogin(idToken);

      // Redirect based on course selection
      if (!userData.courseId) {
        navigate("/select-course");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Google signup error:", err);
      alert(err.message || "Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col">
      <Navbar />

      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-xl rounded-2xl max-w-5xl w-full md:flex overflow-hidden"
        >
          {/* LEFT */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <img
              src={signupIllustration}
              alt="Signup illustration"
              className="w-full max-w-sm"
            />
          </div>

          {/* RIGHT */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">

            {/* HEADER */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Your Account 🚀
            </h2>
            <p className="text-gray-500 mb-6">
              Start your AI-powered learning journey today
            </p>

            {/* GOOGLE LOGIN */}
            <div className="mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSignUp}
                onError={() => alert("Google signup failed")}
                useOneTap={false}
              />
              {googleLoading && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Signing in with Google...
                </p>
              )}
            </div>

            <div className="text-center text-gray-400 mb-6 text-sm">
              OR
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* NAME */}
              <div className="relative">
                <FaUser className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 cursor-pointer text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* COURSE */}
              <div className="relative">
                <FaBook className="absolute left-3 top-4 text-gray-400" />
                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                >
                  <option value="">Select Your Course</option>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading courses...</option>
                  )}
                </select>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                  loading
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* FOOTER LINKS */}
            <p className="mt-6 text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold">
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