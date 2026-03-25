import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);

      await API.post(`/auth/reset-password/${token}`, { password });

      alert("Password reset successful!");
      navigate("/login");
    } catch (err) {
      alert("Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Reset Your Password
          </h2>
          <p className="text-sm text-gray-500">
            Enter your new password below
          </p>
        </div>

        {/* PASSWORD */}
        <div className="relative mb-4">
          <FaLock className="absolute left-3 top-4 text-gray-400" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-4 cursor-pointer text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="relative mb-4">
          <FaLock className="absolute left-3 top-4 text-gray-400" />

          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <span
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-4 cursor-pointer text-gray-500"
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* BUTTON */}
        <button
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {/* EXTRA */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Make sure your password is strong and secure 🔒
        </p>
      </form>
    </div>
  );
};

export default ResetPasswordPage;