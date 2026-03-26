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
        {/* CLOSE BUTTON (MOBILE) */}
        <div className="flex justify-between items-center mb-10 md:hidden">
          <h2 className="text-xl font-bold">Alveoly Admin</h2>
          <FaTimes
            className="cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        </div>

        {/* DESKTOP TITLE */}
        <h2 className="text-2xl font-bold mb-10 hidden md:block">
          Alveoly Admin
        </h2>

        <nav className="flex flex-col gap-4 text-sm">
          <Link onClick={() => setSidebarOpen(false)} to="/admin" className="flex items-center gap-2 hover:text-gray-200">
            <FaHome /> Dashboard
          </Link>

          <Link onClick={() => setSidebarOpen(false)} to="/admin/questions" className="flex items-center gap-2 hover:text-gray-200">
            <FaQuestionCircle /> Questions
          </Link>

          <Link onClick={() => setSidebarOpen(false)} to="/admin/subjects" className="flex items-center gap-2 hover:text-gray-200">
            <FaBook /> Subjects
          </Link>

          <Link onClick={() => setSidebarOpen(false)} to="/admin/users" className="flex items-center gap-2 hover:text-gray-200">
            <FaUsers /> Users
          </Link>

          <Link onClick={() => setSidebarOpen(false)} to="/admin/payments" className="flex items-center gap-2 hover:text-gray-200">
            <FaMoneyBill /> Payments
          </Link>

          <Link onClick={() => setSidebarOpen(false)} to="/admin/ai" className="flex items-center gap-2 hover:text-gray-200">
            <FaRobot /> AI Manager
          </Link>

           <Link onClick={() => setSidebarOpen(false)} to="/admin/results" className="flex items-center gap-2 hover:text-gray-200">
            <FaBookMedical /> Student Results
          </Link>

          <Link onClick={() => setSidebarOpen(false)} to="/admin/ai-plans" className="flex items-center gap-2 hover:text-gray-200">
            <FaRobot /> AI Plans Manager
          </Link>

          <Link onClick={() => setSidebarOpen(false)} to="/admin/ai-generator" className="flex items-center gap-2 hover:text-gray-200">
            <FaRobot /> AI Questions Generator
          </Link>

          <Link onClick={() => setSidebarOpen(false)} to="/admin/testimonials" className="flex items-center gap-2 hover:text-gray-200">
            <FaPersonBooth /> Testimonials
          </Link>

          <Link onClick={() => setSidebarOpen(false)} to="/admin/in-box" className="flex items-center gap-2 hover:text-gray-200">
            <FaReply /> Feedback
          </Link>

          <Link
  onClick={() => setSidebarOpen(false)}
  to="/admin/courses"
  className="flex items-center gap-2 hover:text-gray-200"
>
  <FaLayerGroup /> Courses
</Link>

<Link
  onClick={() => setSidebarOpen(false)}
  to="/admin/plans"
  className="flex items-center gap-2 hover:text-gray-200"
>
  <FaLayerGroup /> Plans
</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* TOP NAV */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">
            {/* HAMBURGER (MOBILE ONLY) */}
            <FaBars
              className="text-xl cursor-pointer md:hidden"
              onClick={() => setSidebarOpen(true)}
            />

            <h1 className="font-semibold text-lg">Admin Dashboard</h1>
          </div>

          {/* RIGHT SIDE */}
          <button onClick={logout} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition">
            Logout
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;