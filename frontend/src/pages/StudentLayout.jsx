import { useState } from "react";
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

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-blue-700 text-white p-6 z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-10 md:hidden">
          <h2 className="text-xl font-bold">Student Panel</h2>
          <FaTimes className="cursor-pointer" onClick={() => setSidebarOpen(false)} />
        </div>

        <h2 className="text-2xl font-bold mb-10 hidden md:block">Alveoly Student</h2>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-4 text-sm">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              onClick={() => setSidebarOpen(false)}
              to={item.to}
              className="flex items-center gap-2 hover:text-gray-200 transition-colors"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP NAV */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FaBars className="md:hidden cursor-pointer" onClick={() => setSidebarOpen(true)} />
            <h1 className="font-semibold text-lg">Student Dashboard</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;