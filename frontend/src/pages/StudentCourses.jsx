import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { FaBookOpen } from "react-icons/fa";

const StudentCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();

    socket.on("course:created", (course) => {
      setCourses((prev) => [course, ...prev]);
    });

    socket.on("course:updated", (updated) => {
      setCourses((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
    });

    socket.on("course:deleted", (_id) => {
      setCourses((prev) => prev.filter((c) => c._id !== _id));
    });

    return () => {
      socket.off("course:created");
      socket.off("course:updated");
      socket.off("course:deleted");
    };
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          My Courses
        </h2>
        <p className="text-gray-500 mt-1">
          Select a course to explore subjects and start learning
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && courses.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center">
          <p className="text-gray-500 text-lg">
            No courses available yet 📚
          </p>
        </div>
      )}

      {/* COURSES GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition duration-300 flex flex-col justify-between"
          >
            
            {/* Top */}
            <div className="flex items-center gap-4 mb-4">
              
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FaBookOpen />
              </div>

              {/* Course Name */}
              <h3 className="font-semibold text-gray-800 text-lg">
                {course.name}
              </h3>
            </div>

            {/* Button */}
            <button
              onClick={() =>
                navigate(`/student/subjects?course=${course._id}`)
              }
              className="mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              View Subjects
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;