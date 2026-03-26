import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
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
  FaCheck, // ✅ NEW ICON FOR PLANS
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const StudentLayout = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-blue-700 text-white p-6 z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-10 md:hidden">
          <h2 className="text-xl font-bold">Student Panel</h2>
          <FaTimes onClick={() => setOpen(false)} className="cursor-pointer" />
        </div>

        <h2 className="text-2xl font-bold mb-10 hidden md:block">
          Alveoly Student
        </h2>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-4 text-sm">

          <Link to="/student/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaHome /> Dashboard
          </Link>

          <Link to="/student/courses" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaBook /> Courses
          </Link>

          <Link to="/student/subjects" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaClipboardList /> Subjects
          </Link>

          <Link to="/student/progress" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaChartLine /> Progress
          </Link>

          {/* ✅ NEW PLANS LINK */}
          <Link to="/student/plans" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaTags /> Plans
          </Link>

          <Link to="/student/payments" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaWallet /> Payments
          </Link>

          <Link to="/student/ai" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaRobot /> AI Assistant
          </Link>

           <Link to="/student/testimonials" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaCheck /> Testimonials
          </Link>

        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOP NAV */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FaBars className="md:hidden cursor-pointer" onClick={() => setOpen(true)} />
            <h1 className="font-semibold text-lg">Student Dashboard</h1>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-1 rounded"
          >
            <FaSignOutAlt /> Logout
          </button>
        </header>

        {/* CONTENT */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;