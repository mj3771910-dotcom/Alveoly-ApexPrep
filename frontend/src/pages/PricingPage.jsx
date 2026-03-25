import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "../api/axios";
import {
  FaCheck,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [myPlans, setMyPlans] = useState({});
  const [now, setNow] = useState(new Date());

  const navigate = useNavigate();
  const { user } = useAuth();

  // ================= LIVE TIMER =================
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ================= FETCH PLANS =================
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get("/plans");
        setPlans(res.data);
      } catch (err) {
        console.error("Failed to fetch plans", err);
      }
    };
    fetchPlans();
  }, []);

  // ================= FETCH USER PURCHASES =================
  useEffect(() => {
    if (!user) return;

    const fetchMyPayments = async () => {
      try {
        const res = await axios.get("/payments/mine");

        const planMap = {};

        res.data
          .filter((p) => p.status === "success" && p.planId)
          .forEach((p) => {
            planMap[p.planId] = p.expiresAt;
          });

        setMyPlans(planMap);
      } catch (err) {
        console.error("Failed to fetch my payments", err);
      }
    };

    fetchMyPayments();
  }, [user]);

  // ================= PLAN STATUS =================
  const getPlanStatus = (planId) => {
    const expiry = myPlans[planId];
    if (!expiry) return "none";

    return new Date(expiry) > now ? "active" : "expired";
  };

  // ================= COUNTDOWN =================
  const getTimeLeft = (expiresAt) => {
    if (!expiresAt) return null;

    const diff = new Date(expiresAt) - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    return `${days}d ${hours}h ${mins}m`;
  };

  // ================= HANDLE PLAN =================
  const handleSelectPlan = (plan, status) => {
    if (!user) {
      localStorage.setItem("selectedPlan", JSON.stringify(plan));
      navigate("/login");
      return;
    }

    // If expired → renew flow
    if (status === "expired") {
      navigate("/student/payments");
      return;
    }

    // If new → go payment page
    navigate("/student/payments");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-28 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-100">
          Unlock all subjects, practice exams, and track your success.
        </p>
      </section>

      {/* ================= PLANS ================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800">
            Choose the plan that fits you
          </h2>
          <p className="text-gray-500 mt-2">
            One payment. Full access. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {plans.map((plan, index) => {
            const isFeatured = index === 1;
            const status = getPlanStatus(plan._id);
            const expiry = myPlans[plan._id];
            const timeLeft = getTimeLeft(expiry);

            return (
              <div
                key={plan._id}
                className={`relative flex flex-col justify-between rounded-2xl p-8 border transition-all duration-300
                ${
                  status === "active"
                    ? "bg-white shadow-lg border-green-500"
                    : status === "expired"
                    ? "bg-white shadow-md border-red-400"
                    : isFeatured
                    ? "bg-white shadow-2xl scale-105 border-blue-600"
                    : "bg-white shadow-md hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {/* BADGES */}
                {status === "active" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                    <FaCheck /> Active
                  </div>
                )}

                {status === "expired" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
                    <FaExclamationTriangle /> Expired
                  </div>
                )}

                {isFeatured && status === "none" && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {plan.title}
                  </h3>

                  <div className="mb-4">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ₵{plan.price}
                    </span>
                    <span className="text-gray-500 ml-2 text-sm">
                      / one-time
                    </span>
                  </div>

                  {/* DURATION */}
                  {plan.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <FaClock />
                      {plan.duration} {plan.durationUnit}
                    </div>
                  )}

                  {/* COUNTDOWN */}
                  {status === "active" && timeLeft && (
                    <p className="text-blue-600 text-sm mb-3">
                      ⏳ {timeLeft} left
                    </p>
                  )}

                  {status === "expired" && (
                    <p className="text-red-500 text-sm mb-3">
                      ⚠️ Plan expired — renew to continue
                    </p>
                  )}

                  <ul className="space-y-3 mb-8">
                    {plan.subjects.map((s) => (
                      <li
                        key={s._id}
                        className="flex items-center gap-3 text-gray-600 text-sm"
                      >
                        <FaCheck className="text-green-500 text-xs" />
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(plan, status)}
                  disabled={status === "active"}
                  className={`w-full py-3 rounded-lg font-semibold transition
                  ${
                    status === "active"
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : status === "expired"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : isFeatured
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  {status === "active"
                    ? "Active Plan"
                    : status === "expired"
                    ? "Renew Plan"
                    : "Get Started"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= LOGIN CTA ================= */}
      <section className="text-center pb-20">
        <h2 className="text-2xl font-bold mb-3">
          Already have an account?
        </h2>
        <p className="text-gray-500 mb-6">
          Login to access your learning dashboard
        </p>

        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Login Now
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;