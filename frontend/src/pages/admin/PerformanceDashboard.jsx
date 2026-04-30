// pages/admin/PerformanceDashboard.jsx - COMPLETE FIXED VERSION
import { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaChartLine,
  FaUsers,
  FaBook,
  FaTrophy,
  FaDownload,
  FaRedoAlt,
  FaEye,
  FaTimes,
  FaCheckCircle,
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
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchAllStudents();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSubjects(selectedCourse);
      setSelectedSubject("");
      setSelectedStudent("");
      setPerformance(null);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedSubject) {
      fetchPerformanceData();
    }
  }, [selectedSubject, selectedStudent]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to fetch courses");
    }
  };

  const fetchSubjects = async (courseId) => {
    try {
      const res = await axios.get(`/subjects?course=${courseId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      toast.error("Failed to fetch subjects");
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get("/users/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      // Don't show error to user, just log it
    }
  };

  const fetchPerformanceData = async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    setPerformance(null);
    
    try {
      let res;
      if (selectedStudent) {
        // Fetch specific student's progress
        res = await axios.get(`/lesson-quiz/student/${selectedStudent}/progress`);
        console.log("Student progress data:", res.data);
      } else {
        // Fetch subject-wide performance
        res = await axios.get(`/lesson-quiz/subject/${selectedSubject}/performance`);
        console.log("Subject performance data:", res.data);
      }
      setPerformance(res.data);
    } catch (err) {
      console.error("Error fetching performance:", err);
      console.error("Error response:", err.response);
      const errorMsg = err.response?.data?.message || "Failed to fetch performance data";
      toast.error(errorMsg);
      setPerformance({ attempts: [], stats: { averageScore: 0, passRate: 0, totalAttempts: 0, completedLessons: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const handleAllowRetake = async (attemptId, studentName, lessonTitle) => {
    if (!window.confirm(`Allow ${studentName} to retake "${lessonTitle}"? The new result will replace the old one.`)) {
      return;
    }
    
    try {
      await axios.post(`/lesson-quiz/allow-retake/${attemptId}`);
      toast.success(`Retake permission granted for ${studentName}`);
      await fetchPerformanceData();
    } catch (err) {
      console.error("Error allowing retake:", err);
      toast.error(err.response?.data?.message || "Failed to allow retake");
    }
  };

  const viewAttemptDetails = (attempt) => {
    setSelectedAttempt(attempt);
    setShowDetailsModal(true);
  };

  const exportReport = () => {
    if (!performance) return;
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      subject: subjects.find(s => s._id === selectedSubject)?.name || "N/A",
      course: courses.find(c => c._id === selectedCourse)?.name || "N/A",
      student: selectedStudent ? students.find(s => s._id === selectedStudent)?.name : "All Students",
      stats: performance.stats,
      attempts: performance.attempts?.map(a => ({
        student: a.userName,
        email: a.userEmail,
        lesson: a.lessonId?.title || "N/A",
        score: `${a.score}/${a.totalPoints}`,
        percentage: `${Math.round(a.percentage)}%`,
        status: a.isPassed ? "Passed" : "Failed",
        date: a.completedAt ? new Date(a.completedAt).toLocaleDateString() : "N/A",
      })),
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `performance_report_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    toast.success("Report exported successfully");
  };

  const selectedSubjectName = subjects.find(s => s._id === selectedSubject)?.name || "";
  const selectedCourseName = courses.find(c => c._id === selectedCourse)?.name || "";
  const selectedStudentName = students.find(s => s._id === selectedStudent)?.name || "";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📊 Performance Dashboard
          </h1>
          {selectedSubjectName && (
            <p className="text-gray-500 mt-1">
              {selectedCourseName} • {selectedSubjectName}
              {selectedStudentName && ` • Student: ${selectedStudentName}`}
            </p>
          )}
        </div>
        <button
          onClick={exportReport}
          disabled={!performance || !performance.attempts?.length}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
        >
          <FaDownload /> Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={!selectedCourse}
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student (Optional)</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={!selectedSubject}
            >
              <option value="">All Students</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!selectedSubject && !loading && (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <p className="text-gray-500">Select a course and subject to view performance data</p>
        </div>
      )}

      {performance && !loading && (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <FaChartLine className="text-3xl mb-2 opacity-90" />
              <p className="text-sm opacity-90">Average Score</p>
              <p className="text-3xl font-bold">{Math.round(performance.stats?.averageScore || 0)}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <FaTrophy className="text-3xl mb-2 opacity-90" />
              <p className="text-sm opacity-90">Pass Rate</p>
              <p className="text-3xl font-bold">{Math.round(performance.stats?.passRate || 0)}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <FaUsers className="text-3xl mb-2 opacity-90" />
              <p className="text-sm opacity-90">Total Attempts</p>
              <p className="text-3xl font-bold">{performance.stats?.totalAttempts || 0}</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <FaBook className="text-3xl mb-2 opacity-90" />
              <p className="text-sm opacity-90">Lessons Completed</p>
              <p className="text-3xl font-bold">{performance.stats?.completedLessons || 0}</p>
            </div>
          </div>

          {/* Student Performance Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold">Student Performance Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                {performance.attempts?.length || 0} attempt(s) found
              </p>
            </div>
            
            {performance.attempts?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No attempts found for this filter</p>
                <p className="text-sm text-gray-400 mt-1">Students need to take quizzes to see data here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {performance.attempts?.map((attempt, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{attempt.userName || "Unknown"}</p>
                            <p className="text-sm text-gray-500">{attempt.userEmail || "No email"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900">{attempt.lessonId?.title || "N/A"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{attempt.score || 0} / {attempt.totalPoints || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${attempt.percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{Math.round(attempt.percentage || 0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {attempt.isPassed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              <FaCheckCircle size={12} /> Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              <FaTimes size={12} /> Failed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewAttemptDetails(attempt)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded transition"
                              title="View Details"
                            >
                              <FaEye size={18} />
                            </button>
                            <button
                              onClick={() => handleAllowRetake(attempt._id, attempt.userName, attempt.lessonId?.title)}
                              className="text-yellow-600 hover:text-yellow-800 p-1 rounded transition"
                              title="Allow Retake"
                            >
                              <FaRedoAlt size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Attempt Details Modal */}
      {showDetailsModal && selectedAttempt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Quiz Attempt Details</h2>
                <p className="text-sm text-gray-500">
                  {selectedAttempt.userName} • {selectedAttempt.lessonId?.title || "Unknown Lesson"}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Score</p>
                  <p className="text-xl font-bold">{selectedAttempt.score || 0} / {selectedAttempt.totalPoints || 0}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Percentage</p>
                  <p className="text-xl font-bold">{Math.round(selectedAttempt.percentage || 0)}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-xl font-bold ${selectedAttempt.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedAttempt.isPassed ? 'Passed' : 'Failed'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Completed On</p>
                  <p className="text-lg font-medium">{selectedAttempt.completedAt ? new Date(selectedAttempt.completedAt).toLocaleString() : "N/A"}</p>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-4">Question Answers</h3>
              <div className="space-y-4">
                {selectedAttempt.questions?.map((q, idx) => (
                  <div key={idx} className={`border rounded-lg p-4 ${q.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="font-semibold mb-2">{idx + 1}. {q.questionText || "No question text"}</p>
                    <p className="text-sm">
                      Student's answer: <span className={q.isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {q.selected || "None"}. {q.selectedText || 'No answer'}
                      </span>
                    </p>
                    {!q.isCorrect && (
                      <p className="text-sm text-green-700 mt-1">
                        Correct answer: {q.correct || "Unknown"}. {q.correctText || ""}
                      </p>
                    )}
                    {q.rationale && (
                      <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded">
                        💡 {q.rationale}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleAllowRetake(selectedAttempt._id, selectedAttempt.userName, selectedAttempt.lessonId?.title);
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
              >
                <FaRedoAlt /> Allow Retake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;