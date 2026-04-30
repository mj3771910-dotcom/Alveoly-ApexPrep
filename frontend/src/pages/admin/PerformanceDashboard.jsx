// pages/admin/PerformanceDashboard.jsx
import { useState, useEffect } from "react";
import axios from "../../api/axios";
import {
  FaChartLine,
  FaUsers,
  FaBook,
  FaTrophy,
  FaDownload,
} from "react-icons/fa";

const PerformanceDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [students, setStudents] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSubjects(selectedCourse);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedSubject && selectedStudent) {
      fetchStudentPerformance();
    } else if (selectedSubject) {
      fetchSubjectPerformance();
    }
  }, [selectedSubject, selectedStudent]);

  const fetchCourses = async () => {
    const res = await axios.get("/courses");
    setCourses(res.data);
  };

  const fetchSubjects = async (courseId) => {
    const res = await axios.get(`/subjects?course=${courseId}`);
    setSubjects(res.data);
  };

  const fetchStudents = async () => {
    const res = await axios.get("/users/students");
    setStudents(res.data);
  };

  const fetchStudentPerformance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/lesson-quiz/student/${selectedStudent}/progress`);
      setPerformance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectPerformance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/lesson-quiz/subject/${selectedSubject}/performance`);
      setPerformance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!performance) return;
    const dataStr = JSON.stringify(performance, null, 2);
    const dataUri = "data:application/json;charset=utf-8,"+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `performance_report_${Date.now()}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          📊 Performance Dashboard
        </h1>
        <button
          onClick={exportReport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaDownload /> Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="p-3 border rounded-lg"
          >
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-3 border rounded-lg"
            disabled={!selectedCourse}
          >
            <option value="">Select Subject</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="p-3 border rounded-lg"
            disabled={!selectedSubject}
          >
            <option value="">All Students</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {performance && !loading && (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <FaChartLine className="text-3xl mb-2" />
              <p className="text-sm opacity-90">Average Score</p>
              <p className="text-3xl font-bold">{performance.stats?.averageScore || 0}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <FaTrophy className="text-3xl mb-2" />
              <p className="text-sm opacity-90">Pass Rate</p>
              <p className="text-3xl font-bold">{performance.stats?.passRate || 0}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <FaUsers className="text-3xl mb-2" />
              <p className="text-sm opacity-90">Total Students</p>
              <p className="text-3xl font-bold">{performance.attempts?.length || 0}</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <FaBook className="text-3xl mb-2" />
              <p className="text-sm opacity-90">Lessons Completed</p>
              <p className="text-3xl font-bold">{performance.stats?.completedLessons || 0}</p>
            </div>
          </div>

          {/* Student Performance Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Student Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lesson</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {performance.attempts?.map((attempt, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{attempt.userName}</p>
                          <p className="text-sm text-gray-500">{attempt.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {attempt.lessonId?.title || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {attempt.score} / {attempt.totalPoints}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${attempt.percentage}%` }}
                            />
                          </div>
                          <span>{Math.round(attempt.percentage)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {attempt.isPassed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Passed
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceDashboard;