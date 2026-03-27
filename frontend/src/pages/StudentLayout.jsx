import { useState, useEffect } from "react";
import { Joyride } from "react-joyride"; // ✅ NEW
import { Outlet, Link } from "react-router-dom";
import {
  FaHome,
  FaBook,
  FaClipboardList,
  FaChartLine,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaWallet,
  FaRobot,
  FaTags,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const { logout } = useAuth();

  const menuItems = [
    { to: "/student/dashboard", label: "Dashboard", icon: <FaHome /> },
    { to: "/student/courses", label: "Courses", icon: <FaBook /> },
    { to: "/student/subjects", label: "Subjects", icon: <FaClipboardList /> },
    { to: "/student/progress", label: "Progress", icon: <FaChartLine /> },
    { to: "/student/plans", label: "Plans", icon: <FaTags /> },
    { to: "/student/payments", label: "Payments", icon: <FaWallet /> },
    { to: "/student/ai", label: "AI Assistant", icon: <FaRobot /> },
    { to: "/student/testimonials", label: "Testimonials", icon: <FaCheck /> },
  ];

  // ================= TOUR STEPS =================
  const steps = [
    {
      target: "body",
      placement: "center",
      content: (
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2">🤖 Welcome to Alveoly</h2>
          <p className="text-sm text-gray-600">
            I’ll guide you through your dashboard step-by-step.
          </p>
        </div>
      ),
    },
    {
      target: ".sidebar",
      content: "📌 This is your main navigation panel.",
    },
    {
      target: ".nav-dashboard",
      content: "🏠 Go to your dashboard overview anytime.",
    },
    {
      target: ".nav-subjects",
      content: "📚 Access all your subjects here.",
    },
    {
      target: ".nav-ai",
      content: "🤖 Use AI assistant for instant help.",
    },
    {
      target: ".top-header",
      content: "📊 This is your workspace header.",
    },
    {
      target: ".page-content",
      content: "📖 Your content appears here.",
    },
  ];

  // ================= AUTO START =================
  useEffect(() => {
    const seen = localStorage.getItem("appTourDone");
    if (!seen) setRunTour(true);
  }, []);

  // ================= TRACK =================
  const handleTourCallback = (data) => {
    const { status } = data;

    if (status === "finished" || status === "skipped") {
      localStorage.setItem("appTourDone", "true");
      setRunTour(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">

      {/* ✅ JOYRIDE */}
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        disableOverlayClose
        spotlightClicks
        callback={handleTourCallback}
        styles={{
          options: {
            primaryColor: "#2563eb",
            textColor: "#1f2937",
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: "14px",
            padding: "18px",
          },
        }}
      />

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`sidebar fixed md:static top-0 left-0 h-full w-64 bg-blue-700 text-white p-6 z-50 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-10 md:hidden">
          <h2 className="text-xl font-bold">Student Panel</h2>
          <FaTimes onClick={() => setSidebarOpen(false)} className="cursor-pointer" />
        </div>

        <h2 className="text-2xl font-bold mb-10 hidden md:block">
          Alveoly Student
        </h2>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-4 text-sm">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 hover:text-gray-200 transition-colors
                ${item.label === "Dashboard" ? "nav-dashboard" : ""}
                ${item.label === "Subjects" ? "nav-subjects" : ""}
                ${item.label === "AI Assistant" ? "nav-ai" : ""}
              `}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="top-header bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FaBars
              className="md:hidden cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            />
            <h1 className="font-semibold text-lg">Student Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ TOUR BUTTON */}
            <button
              onClick={() => setRunTour(true)}
              className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
            >
              Take Tour
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="page-content flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;