import { useEffect, useState } from "react";
import axios from "../api/axios";
import { FaSearch, FaTrash, FaRedo, FaUserGraduate, FaEye } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const AdminExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    courseId: "",
    subjectId: "",
    userId: "",
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.userId) params.userId = filters.userId;

      const res = await axios.get("/admin/exam-results", { params });
      setResults(res.data);
    } catch (err) {
      console.error("Fetch results failed", err);
      toast.error("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDelete = async (attemptId) => {
    if (!window.confirm("Delete this attempt?")) return;
    try {
      await axios.delete(`/admin/exam-attempt/${attemptId}`);
      toast.success("Exam attempt deleted");
      setResults((prev) => prev.filter((r) => r._id !== attemptId));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleResit = async (attemptId) => {
    try {
      await axios.patch(`/admin/exam-attempt/${attemptId}/resit`);
      toast.success("Resit allowed");
      setResults((prev) =>
        prev.map((r) => (r._id === attemptId ? { ...r, resitAllowed: true } : r))
      );
    } catch (err) {
      console.error(err);
      toast.error("Resit failed");
    }
  };

  const handleFilter = (e) => {
    e?.preventDefault();
    fetchResults();
  };

  const viewDetails = async (attemptId) => {
    try {
      const res = await axios.get(`/admin/exam-attempt/${attemptId}/details`);
      setSelectedResult(res.data);
      setShowDetails(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 Exam Results Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor student performance, manage attempts & resits</p>
      </div>

      <form onSubmit={handleFilter} className="bg-white shadow-lg rounded-2xl p-4 mb-6 border">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            placeholder="Course ID"
            value={filters.courseId}
            onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
            className="border px-4 py-2 rounded-lg w-56 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            placeholder="Subject ID"
            value={filters.subjectId}
            onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
            className="border px-4 py-2 rounded-lg w-56 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="border px-4 py-2 rounded-lg w-56 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FaSearch /> Filter
          </button>
        </div>
      </form>

      <div className="bg-white shadow-lg rounded-2xl overflow-x-auto border">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FaUserGraduate className="text-4xl mx-auto mb-3 text-gray-300" />
            <p>No exam results found</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Subject</th>
                <th className="p-4 text-left">Score</th>
                <th className="p-4 text-left">%</th>
                <th className="p-4 text-left">Result</th>
                <th className="p-4 text-left">Resit</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{r.userId?.name || r.userName || "User Deleted"}</td>
                  <td className="p-4">{r.courseId?.name || r.courseName || "N/A"}</td>
                  <td className="p-4">{r.subjectId?.name || r.subjectName || "N/A"}</td>
                  <td className="p-4 font-semibold">
                    {r.score}/{r.totalQuestions || "?"}
                  </td>
                  <td className="p-4">{r.percentage}%</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        r.result === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.result}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        r.resitAllowed ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {r.resitAllowed ? "Allowed" : "No"}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => handleResit(r._id)}
                      disabled={r.resitAllowed}
                      className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 inline-flex ${
                        r.resitAllowed
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      <FaRedo /> Resit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700 flex items-center gap-1 inline-flex"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-3xl shadow-2xl overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold mb-4">Exam Details</h2>
            <div className="mb-4">
              <p><strong>Student:</strong> {selectedResult.userId?.name}</p>
              <p><strong>Course:</strong> {selectedResult.courseId?.name}</p>
              <p><strong>Subject:</strong> {selectedResult.subjectId?.name}</p>
              <p><strong>Score:</strong> {selectedResult.score}/{selectedResult.totalQuestions} ({selectedResult.percentage}%)</p>
              <p><strong>Result:</strong> {selectedResult.result}</p>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Question Details:</h3>
              {selectedResult.questionResults?.map((qr, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <p className="font-semibold">{idx + 1}. {qr.questionText}</p>
                  <p className={qr.isCorrect ? "text-green-600" : "text-red-600"}>
                    Your Answer: {qr.userAnswerLetter} - {qr.userAnswerText || "None"}
                  </p>
                  {!qr.isCorrect && (
                    <p className="text-green-600">Correct: {qr.correctAnswer}</p>
                  )}
                  <p className="text-xs text-gray-500">Match Type: {qr.matchType || "N/A"}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamResults;