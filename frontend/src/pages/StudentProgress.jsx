import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FaChartLine,
  FaCheckCircle,
  FaBookOpen,
  FaClock,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StudentProgress = () => {
  // 🔥 STATES
  const [attempts, setAttempts] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW AI STATES
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get("/trial/progress");

        setAttempts(res.data.attempts || []);
        setStatsData(res.data.stats || {});
      } catch (err) {
        console.error("Progress fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    // 🔥 NEW AI FETCH
    const fetchAIInsight = async () => {
      try {
        setAiLoading(true);
        const res = await axios.get("/ai/insights");
        setAiInsight(res.data.insight);
      } catch (err) {
        console.error("AI Insight error:", err);
        setAiInsight("AI feedback not available.");
      } finally {
        setAiLoading(false);
      }
    };

    fetchProgress();
    fetchAIInsight(); // 🔥 CALL AI
  }, []);

  // ================= TIME FORMAT =================
  const formatTime = (seconds = 0) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs > 0 ? hrs + "h " : ""}${
      mins > 0 ? mins + "m " : ""
    }${secs}s`;
  };

  // ================= STATS =================
  const stats = {
    coursesCompleted: 1,
    totalCourses: 1,
    examsTaken: statsData?.totalAttempts || 0,
    averageScore: statsData?.averageScore || 0,
    studyHours: statsData?.totalTime || 0,
    bestScore: statsData?.bestScore || 0,
  };

  // ================= SUBJECT PROGRESS =================
  const subjectMap = {};

  attempts.forEach((a) => {
    const key = a.subjectId?._id || "unknown";

    if (!subjectMap[key]) {
      subjectMap[key] = {
        name: a.subjectId?.name || "Unknown",
        total: 0,
        score: 0,
      };
    }

    subjectMap[key].total += 1;
    subjectMap[key].score += a.percentage;
  });

  const subjects = Object.values(subjectMap).map((s) => ({
    name: s.name,
    progress: Math.round(s.score / s.total),
  }));

  // ================= CHART =================
  const chartData = attempts
    .slice()
    .reverse()
    .map((a, i) => ({
      name: `Trial ${i + 1}`,
      percentage: a.percentage,
    }));

  // ================= RECENT =================
  const recentActivity = attempts.slice(0, 5);

  // ================= PERFORMANCE COLOR =================
  const getPerformanceColor = (p) => {
    if (p >= 80) return "text-green-600";
    if (p >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  // ================= 🔮 AI PREDICTION =================
  const trend =
    attempts.length >= 2
      ? attempts[0].percentage -
        attempts[attempts.length - 1].percentage
      : 0;

  const predictedScore =
    stats.averageScore +
    (trend > 0 ? 5 : trend < 0 ? -5 : 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaChartLine /> Student Progress
        </h1>
      </div>

      {/* LOADING */}
      {loading && <p className="text-gray-500">Loading progress...</p>}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

        <div className="bg-white p-5 rounded-2xl shadow">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-green-500 text-xl" />
            <h3 className="text-gray-600">Course</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats.coursesCompleted}/{stats.totalCourses}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <div className="flex items-center gap-3">
            <FaBookOpen className="text-blue-500 text-xl" />
            <h3 className="text-gray-600">Trials Taken</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats.examsTaken}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-purple-500 text-xl" />
            <h3 className="text-gray-600">Average</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats.averageScore}%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-green-600 text-xl" />
            <h3 className="text-gray-600">Best Score</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats.bestScore}%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <div className="flex items-center gap-3">
            <FaClock className="text-orange-500 text-xl" />
            <h3 className="text-gray-600">Study Time</h3>
          </div>
          <p className="text-lg font-bold mt-2">
            {formatTime(stats.studyHours)}
          </p>
        </div>
      </div>

      {/* 🔮 NEW: PERFORMANCE PREDICTION */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-3">
          🔮 Performance Prediction
        </h2>

        <h1 className="text-3xl font-bold text-blue-600">
          {predictedScore}%
        </h1>

        <p className="text-sm mt-2 text-gray-500">
          {trend > 0
            ? "📈 You are improving!"
            : trend < 0
            ? "⚠️ Performance is dropping. Focus more."
            : "Stable performance."}
        </p>
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Performance Trend
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="percentage" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SUBJECT PROGRESS */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Subject Progress
        </h2>

        <div className="space-y-4">
          {subjects.length === 0 && (
            <p className="text-gray-500 text-sm">
              No subject data yet.
            </p>
          )}

          {subjects.map((subject, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">
                  {subject.name}
                </span>
                <span className="text-sm text-gray-500">
                  {subject.progress}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${subject.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🤖 NEW: AI FEEDBACK */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          🤖 AI Coach Feedback
        </h2>

        {aiLoading && (
          <p className="text-gray-500">
            Analyzing your performance...
          </p>
        )}

        {!aiLoading && (
          <div className="bg-gray-100 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-line">
            {aiInsight}
          </div>
        )}
      </div>

      {/* RECENT */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-3 text-sm text-gray-600">
          {recentActivity.length === 0 && (
            <li>No activity yet.</li>
          )}

          {recentActivity.map((a, i) => (
            <li key={i}>
              📝 {a.subjectId?.name || "Subject"} — 
              <span className={`ml-2 font-bold ${getPerformanceColor(a.percentage)}`}>
                {a.percentage}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentProgress;