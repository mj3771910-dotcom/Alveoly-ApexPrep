import { useEffect, useState } from "react";
import axios from "../api/axios";
import { FaUsers, FaQuestionCircle, FaMoneyBill, FaBook } from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalRevenue: 0,
    totalSubjects: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/stat/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Stats error:", err);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        
        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <FaUsers className="text-blue-600 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Users</p>
            <h3 className="text-xl font-bold">
              {loading ? "..." : stats.totalUsers}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <FaQuestionCircle className="text-green-600 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Questions</p>
            <h3 className="text-xl font-bold">
              {loading ? "..." : stats.totalQuestions}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <FaMoneyBill className="text-yellow-600 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Revenue</p>
            <h3 className="text-xl font-bold">
              {loading ? "..." : `₵${stats.totalRevenue}`}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <FaBook className="text-purple-600 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Subjects</p>
            <h3 className="text-xl font-bold">
              {loading ? "..." : stats.totalSubjects}
            </h3>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;