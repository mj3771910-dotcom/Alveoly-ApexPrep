import { useEffect, useState } from "react";
import API from "../api/axios";
import PaystackPayment from "../pages/PaystackPayment";
import { FaCheck, FaClock, FaExclamationTriangle } from "react-icons/fa";

const StudentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [myPlans, setMyPlans] = useState({});
  const [now, setNow] = useState(Date.now());

  // ================= LIVE TIMER =================
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
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

  // ================= FETCH USER PAYMENTS =================
  useEffect(() => {
    const fetchMyPayments = async () => {
      try {
        const res = await API.get("/payments/mine");

        const planMap = {};

        res.data
          .filter((p) => p.status === "success" && p.planId)
          .forEach((p) => {
            const existing = planMap[p.planId];

            // ✅ keep latest expiry
            if (!existing || new Date(p.expiresAt) > new Date(existing)) {
              planMap[p.planId] = p.expiresAt;
            }
          });

        setMyPlans(planMap);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMyPayments();
  }, []);

  // ================= STATUS =================
  const getPlanStatus = (planId) => {
    const expiry = myPlans[planId];
    if (!expiry) return "none";

    return new Date(expiry).getTime() > now ? "active" : "expired";
  };

  // ================= COUNTDOWN =================
  const getTimeLeft = (expiresAt) => {
    if (!expiresAt) return null;

    const diff = new Date(expiresAt).getTime() - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  // ================= PROGRESS =================
  const getProgress = (expiresAt, duration, unit) => {
    if (!expiresAt) return 0;

    const end = new Date(expiresAt).getTime();
    const totalDurationMs = convertToMs(duration, unit);
    const start = end - totalDurationMs;

    const progress = ((now - start) / totalDurationMs) * 100;

    return Math.min(100, Math.max(0, progress));
  };

  const convertToMs = (value, unit) => {
    const map = {
      minutes: 60000,
      hours: 3600000,
      days: 86400000,
      weeks: 604800000,
      months: 2592000000,
    };
    return value * (map[unit] || map.days);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
        Choose Your Plan
      </h2>
      <p className="text-gray-500 mb-10">
        Unlock subjects and start learning instantly
      </p>

      {loadingPlans ? (
        <p>Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const isFeatured = index === 1;
            const status = getPlanStatus(plan._id);
            const expiry = myPlans[plan._id];
            const timeLeft = getTimeLeft(expiry);
            const progress = getProgress(
              expiry,
              plan.duration,
              plan.durationUnit
            );

            return (
              <div
                key={plan._id}
                className={`relative rounded-2xl p-8 border transition-all duration-300 flex flex-col justify-between
                ${
                  status === "active"
                    ? "border-green-500 shadow-lg"
                    : status === "expired"
                    ? "border-red-400 opacity-90"
                    : isFeatured
                    ? "border-blue-600 scale-105 shadow-2xl"
                    : "hover:shadow-xl hover:-translate-y-1"
                } bg-white`}
              >
                {/* BADGES */}
                {status === "active" && (
                  <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs flex gap-1 items-center">
                    <FaCheck /> Active
                  </div>
                )}

                {status === "expired" && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs flex gap-1 items-center">
                    <FaExclamationTriangle /> Expired
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {plan.title}
                  </h3>

                  <div className="mb-4">
                    <span className="text-4xl font-bold">
                      ₵{plan.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FaClock />
                    {plan.duration} {plan.durationUnit}
                  </div>

                  {/* COUNTDOWN */}
                  {status === "active" && (
                    <>
                      <div className="text-blue-600 font-medium mb-2">
                        ⏳ {timeLeft}
                      </div>

                      {/* PROGRESS BAR */}
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </>
                  )}

                  {status === "expired" && (
                    <p className="text-red-600 text-sm mt-2">
                      ⚠️ Plan expired
                    </p>
                  )}

                  {/* SUBJECTS */}
                  <ul className="mt-6 space-y-2 text-sm">
                    {plan.subjects.map((s) => (
                      <li key={s._id} className="flex gap-2 items-center">
                        <FaCheck className="text-green-500 text-xs" />
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* BUTTON */}
                <button
                  disabled={status === "active"}
                  onClick={() => setSelectedPlan(plan)}
                  className={`mt-6 w-full py-3 rounded-lg font-semibold
                  ${
                    status === "active"
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : status === "expired"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
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
      )}

      {/* MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md relative">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-center mb-4">
              {selectedPlan.title}
            </h2>

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

export default StudentPlans;