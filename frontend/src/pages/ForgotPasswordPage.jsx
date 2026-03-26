import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import Navbar from "./Navbar";
import Footer from "./Footer";
import forgotIllustration from "../assets/forgot-password.png";
import API from "../api/axios";
import { FaEnvelope } from "react-icons/fa";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize EmailJS once
  useEffect(() => {
    if (import.meta.env.VITE_EMAILJS_PUBLIC_KEY2) {
      emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY2);
    } else {
      console.error("EmailJS PUBLIC KEY is missing in .env");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return alert("Please enter your email");
    }

    try {
      setLoading(true);

      // ✅ Call backend
      const res = await API.post("/auth/forgot-password", { email });

      console.log("BACKEND RESPONSE:", res.data);

      const { email: userEmail, name, resetLink } = res.data;

      // ✅ Validate response
      if (!userEmail || !resetLink) {
        console.error("Invalid backend response:", res.data);
        throw new Error("Failed to generate reset email data");
      }

      // ✅ Validate ENV variables
      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID2;
      const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID2;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY2;

      if (!serviceID || !templateID || !publicKey) {
        console.error("Missing EmailJS ENV variables");
        throw new Error("Email service not configured properly");
      }

      console.log("SENDING EMAIL WITH:", {
        serviceID,
        templateID,
        userEmail,
        name,
        resetLink,
      });

      // ✅ Send email
      const result = await emailjs.send(
        serviceID,
        templateID,
        {
          to_email: userEmail,
          name: name || "User",
          reset_link: resetLink,
        },
        publicKey
      );

      console.log("EMAILJS SUCCESS:", result);

      setSent(true);
    } catch (err) {
      console.error("EMAIL ERROR FULL:", err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col text-gray-800">
      <Navbar />

      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl max-w-5xl w-full md:flex overflow-hidden"
        >
          {/* LEFT ILLUSTRATION */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <img
              src={forgotIllustration}
              alt="Forgot Password"
              className="w-full max-w-sm"
            />
          </div>

          {/* RIGHT FORM */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            {!sent ? (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Forgot your password?
                </h2>

                <p className="text-gray-500 mb-6 text-sm">
                  Enter your email and we’ll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-4 text-gray-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>

                  <button
                    disabled={loading}
                    className={`w-full py-3 rounded-lg text-white font-medium transition ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <p className="text-xs text-gray-400 mt-4">
                  Make sure your email is correct before submitting.
                </p>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-green-600 mb-3">
                  Email Sent 🎉
                </h2>

                <p className="text-gray-600 mb-2">
                  We’ve sent a password reset link to:
                </p>

                <p className="font-semibold text-gray-800 mb-4">{email}</p>

                <p className="text-sm text-gray-500">
                  Please check your inbox (and spam folder).
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;