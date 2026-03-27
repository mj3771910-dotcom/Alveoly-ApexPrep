import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaClipboardList,
  FaCheckCircle,
  FaChartLine,
  FaArrowRight,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PaystackPayment from "../pages/PaystackPayment";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [stats, setStats] = useState({
    totalQuestions: 0,
    examsTaken: 0,
    averagePerformance: 0,
  });

  const [myPlans, setMyPlans] = useState({});
  const [now, setNow] = useState(new Date());

  // ================= TIMER =================
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ================= FETCH STUDENT =================
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await API.get("/auth/me");
        setStudent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, []);

  // ================= FETCH STATS =================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/student/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  // ================= FETCH PLANS =================
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await API.get("/plans");
        setPlans(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // ================= FETCH PAYMENTS =================
  useEffect(() => {
    const fetchMyPayments = async () => {
      try {
        const res = await API.get("/payments/mine");

        const map = {};

        res.data
          .filter((p) => p.status === "success" && p.planId)
          .forEach((p) => {
            const existing = map[p.planId];
            if (!existing || new Date(p.expiresAt) > new Date(existing)) {
              map[p.planId] = p.expiresAt;
            }
          });

        setMyPlans(map);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMyPayments();
  }, []);

  if (loading)
    return <div className="p-6 text-center">Loading dashboard...</div>;

  const courseId =
    student?.courseId?._id || student?.courseId || null;

  // ================= STATUS =================
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

  return (
    <div className="w-full">

      {/* HEADER */}
      <div className="mb-8 w-full">
        <h2 className="text-2xl font-bold">
          Welcome back 👋 {student?.name}
        </h2>
        <p className="text-gray-500 text-sm">
          {student?.courseId?.name
            ? `You are enrolled in: ${student.courseId.name}`
            : "No course assigned yet"}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 w-full">
        {[
          { icon: FaBook, label: "Courses", value: courseId ? 1 : 0, color: "text-blue-600" },
          { icon: FaClipboardList, label: "Questions", value: stats.totalQuestions, color: "text-green-600" },
          { icon: FaCheckCircle, label: "Exams", value: stats.examsTaken, color: "text-purple-600" },
          { icon: FaChartLine, label: "Performance", value: `${stats.averagePerformance}%`, color: "text-yellow-600" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow flex gap-4 w-full">
            <item.icon className={`${item.color} text-2xl`} />
            <div>
              <p className="text-gray-500 text-sm">{item.label}</p>
              <h3 className="text-xl font-bold">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10 w-full">
        {[
          { title: "Browse Subjects", color: "text-blue-600" },
          { title: "Practice / Exams", color: "text-green-600" },
          { title: "Payments", color: "text-purple-600" },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => {
              if (!courseId) return alert("No course assigned yet");
              navigate(
                item.title === "Payments"
                  ? "/student/payments"
                  : `/student/subjects?course=${courseId}`
              );
            }}
            className="bg-white p-6 rounded-2xl shadow cursor-pointer hover:shadow-lg transition w-full"
          >
            <h3 className={`font-bold ${item.color}`}>{item.title}</h3>
            <p className="text-sm text-gray-500 mt-2">
              Access this feature
            </p>
          </div>
        ))}
      </div>

      {/* PLANS */}
      <div className="bg-white p-6 rounded-2xl shadow w-full">
        <h3 className="font-semibold mb-6">Your Subscription Plan</h3>

        {loadingPlans ? (
          <p>Loading plans...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {plans.map((plan, index) => {
              const status = getPlanStatus(plan._id);
              const expiry = myPlans[plan._id];
              const timeLeft = getTimeLeft(expiry);

              return (
                <div key={plan._id} className="relative p-6 rounded-xl border w-full">

                  {status === "active" && (
                    <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded flex gap-1 items-center">
                      <FaCheck /> Active
                    </span>
                  )}

                  {status === "expired" && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded flex gap-1 items-center">
                      <FaExclamationTriangle /> Expired
                    </span>
                  )}

                  <h4 className="font-bold text-lg">{plan.title}</h4>

                  <p className="text-3xl font-extrabold">
                    ₵{plan.price}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FaClock />
                    {plan.duration} {plan.durationUnit}
                  </div>

                  {status === "active" && (
                    <p className="text-blue-600 text-sm">
                      ⏳ {timeLeft}
                    </p>
                  )}

                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full mt-4 bg-black text-white py-2 rounded"
                  >
                    {status === "active" ? "Active" : "Choose Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-center mb-4">
              {selectedPlan.title}
            </h3>

            <p className="text-center mb-4">
              ₵{selectedPlan.price}
            </p>

            <PaystackPayment plan={selectedPlan} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;