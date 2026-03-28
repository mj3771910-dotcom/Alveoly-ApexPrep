import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  FaHome,
  FaQuestionCircle,
  FaBook,
  FaUsers,
  FaMoneyBill,
  FaRobot,
  FaBars,
  FaTimes,
  FaLayerGroup,
  FaBookMedical,
  FaPersonBooth,
  FaReply,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: <FaHome /> },
    { to: "/admin/questions", label: "Questions", icon: <FaQuestionCircle /> },
    { to: "/admin/subjects", label: "Subjects", icon: <FaBook /> },
    { to: "/admin/users", label: "Users", icon: <FaUsers /> },
    { to: "/admin/payments", label: "Payments", icon: <FaMoneyBill /> },
    { to: "/admin/ai", label: "AI Manager", icon: <FaRobot /> },
    { to: "/admin/results", label: "Student Results", icon: <FaBookMedical /> },
    { to: "/admin/ai-plans", label: "AI Plans Manager", icon: <FaRobot /> },
    { to: "/admin/ai-generator", label: "AI Questions Generator", icon: <FaRobot /> },
    { to: "/admin/testimonials", label: "Testimonials", icon: <FaPersonBooth /> },
    { to: "/admin/in-box", label: "Feedback", icon: <FaReply /> },
    { to: "/admin/courses", label: "Courses", icon: <FaLayerGroup /> },
    { to: "/admin/plans", label: "Plans", icon: <FaLayerGroup /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-x-hidden">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-blue-700 text-white p-6 z-50 transform transition-transform duration-300 overflow-y-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* MOBILE HEADER */}
        <div className="flex justify-between items-center mb-10 md:hidden">
          <h2 className="text-xl font-bold">Alveoly Admin</h2>
          <FaTimes
            className="cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        </div>

        {/* DESKTOP HEADER */}
        <h2 className="text-2xl font-bold mb-10 hidden md:block">
          Alveoly Admin
        </h2>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-4 text-sm">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              onClick={() => setSidebarOpen(false)}
              to={item.to}
              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP NAV */}
        <header className="bg-white shadow px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0">
            <FaBars
              className="text-xl cursor-pointer md:hidden"
              onClick={() => setSidebarOpen(true)}
            />
            <h1 className="font-semibold text-lg truncate">
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 transition whitespace-nowrap"
          >
            Logout
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-x-hidden">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;