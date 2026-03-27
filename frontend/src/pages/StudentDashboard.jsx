import React, { useState, useEffect } from "react";
import { Joyride } from "react-joyride"; // ✅ NEW
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

  // ✅ TOUR STATE
  const [runTour, setRunTour] = useState(false);

  // ================= TOUR STEPS =================
  const steps = [
    {
      target: "body",
      placement: "center",
      content: (
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2">🎉 Welcome</h2>
          <p className="text-sm text-gray-600">
            Let’s quickly show you how to use your dashboard.
          </p>
        </div>
      ),
    },
    {
      target: ".stats-section",
      content: "📊 Track your performance, exams, and progress here.",
    },
    {
      target: ".quick-actions",
      content: "⚡ Use these shortcuts to access subjects and exams quickly.",
    },
    {
      target: ".course-card",
      content: "📚 View your course and access subjects here.",
    },
    {
      target: ".plans-section",
      content: "💳 Manage your subscription and unlock premium content.",
    },
  ];

  // ================= AUTO TOUR =================
  useEffect(() => {
    const seen = localStorage.getItem("seenDashboardTour");
    if (!seen) {
      setRunTour(true);
    }
  }, []);

 const handleTourCallback = (data) => {
  const { status } = data;

  if (status === "finished" || status === "skipped") {
    localStorage.setItem("seenDashboardTour", "true");
    setRunTour(false);
  }
};
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

  if (loading) return <p>Loading dashboard...</p>;

  const courseId =
    student?.courseId?._id || student?.courseId || null;

  const getPlanStatus = (planId) => {
    const expiry = myPlans[planId];
    if (!expiry) return "none";
    return new Date(expiry) > now ? "active" : "expired";
  };

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
    <div className="relative">

      {/* ✅ TOUR COMPONENT */}
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        spotlightClicks={true}
disableOverlayClose={true}
        callback={handleTourCallback}
        styles={{
          options: {
            primaryColor: "#2563eb",
            textColor: "#1f2937",
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: "12px",
            padding: "16px",
          },
          buttonNext: {
            backgroundColor: "#2563eb",
            borderRadius: "6px",
          },
          buttonBack: {
            color: "#6b7280",
          },
          buttonSkip: {
            color: "#ef4444",
          },
        }}
      />

      {/* ================= HEADER ================= */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome back 👋 {student?.name}
          </h2>
          <p className="text-gray-500 text-sm">
            {student?.courseId?.name
              ? `You are enrolled in: ${student.courseId.name}`
              : "No course assigned yet"}
          </p>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 stats-section">
        {/* unchanged */}
        <div className="bg-white p-6 rounded-2xl shadow flex gap-4">
          <FaBook className="text-blue-600 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Courses</p>
            <h3 className="text-xl font-bold">
              {courseId ? 1 : 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow flex gap-4">
          <FaClipboardList className="text-green-600 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Questions</p>
            <h3 className="text-xl font-bold">{stats.totalQuestions}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow flex gap-4">
          <FaCheckCircle className="text-purple-600 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Exams</p>
            <h3 className="text-xl font-bold">{stats.examsTaken}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow flex gap-4">
          <FaChartLine className="text-yellow-600 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Performance</p>
            <h3 className="text-xl font-bold">
  {stats.averagePerformance}%
</h3>
          </div>
        </div>
      </div>

        {/* ================= QUICK ACTIONS ================= */}
      <div className="grid md:grid-cols-3 gap-6 mb-10 quick-actions">
        <div
          onClick={() => {
            if (!courseId) {
              alert("No course assigned yet");
              return;
            }
            navigate(`/student/subjects?course=${courseId}`);
          }}
          className="bg-white p-6 rounded-2xl shadow cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="font-bold text-blue-600">Browse Subjects</h3>
          <p className="text-sm text-gray-500 mt-2">
            Access all subjects under your course
          </p>
        </div>

        <div
          onClick={() => {
            if (!courseId) {
              alert("No course assigned yet");
              return;
            }
            navigate(`/student/subjects?course=${courseId}`);
          }}
          className="bg-white p-6 rounded-2xl shadow cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="font-bold text-green-600">Practice / Exams</h3>
          <p className="text-sm text-gray-500 mt-2">
            Start trial tests or exam mode
          </p>
        </div>

        <div
          onClick={() => navigate("/student/payments")}
          className="bg-white p-6 rounded-2xl shadow cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="font-bold text-purple-600">Payments</h3>
          <p className="text-sm text-gray-500 mt-2">
            Manage subscriptions & history
          </p>
        </div>
      </div>

      {/* ================= COURSE CARD ================= */}
      {courseId && (
        <div className="bg-white p-6 rounded-2xl shadow mb-10 course-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">My Course</h3>
            <button
              onClick={() => navigate("/student/courses")}
              className="text-sm text-blue-600 flex items-center gap-1"
            >
              View all <FaArrowRight />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-4 hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-blue-600">
                  {student?.courseId?.name || "My Course"}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Access subjects and start practicing questions.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(`/student/subjects?course=${courseId}`)
                }
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
              >
                View Subjects
              </button>
            </div>
          </div>
        </div>
      )}

       {/* ================= PLANS ================= */}
      <div className="bg-white p-6 rounded-2xl shadow plans-section">
        <h3 className="font-semibold mb-6">Your Subscription Plan</h3>

        {loadingPlans ? (
          <p>Loading plans...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const status = getPlanStatus(plan._id);
              const expiry = myPlans[plan._id];
              const timeLeft = getTimeLeft(expiry);
              const isFeatured = index === 1;

              return (
                <div
                  key={plan._id}
                  className={`relative p-6 rounded-xl border transition
                  ${
                    status === "active"
                      ? "border-green-500 shadow-lg"
                      : status === "expired"
                      ? "border-red-400"
                      : isFeatured
                      ? "border-blue-600"
                      : "hover:shadow-lg"
                  }`}
                >
                  {/* BADGES */}
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

                  <h4 className="font-bold text-lg mb-2">
                    {plan.title}
                  </h4>

                  <p className="text-3xl font-extrabold mb-2">
                    ₵{plan.price}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FaClock />
                    {plan.duration} {plan.durationUnit}
                  </div>

                  {/* COUNTDOWN */}
                  {status === "active" && (
                    <p className="text-blue-600 text-sm mb-2">
                      ⏳ {timeLeft}
                    </p>
                  )}

                  {status === "expired" && (
                    <p className="text-red-500 text-sm mb-2">
                      Plan expired
                    </p>
                  )}

                  <ul className="text-sm text-gray-600 mb-4 space-y-1">
                    {plan.subjects.map((s) => (
                      <li key={s._id} className="flex gap-2">
                        <FaCheck className="text-green-500 text-xs mt-1" />
                        {s.name}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={status === "active"}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full py-2 rounded
                    ${
                      status === "active"
                        ? "bg-gray-300"
                        : status === "expired"
                        ? "bg-red-600 text-white"
                        : "bg-black text-white"
                    }`}
                  >
                    {status === "active"
                      ? "Active Plan"
                      : status === "expired"
                      ? "Renew Plan"
                      : "Choose Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-2 right-3 text-xl"
            >
              ×
            </button>

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