import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { handleGoogleLogin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    const authFlow = async () => {
      const params = new URLSearchParams(window.location.search);
      const googleToken = params.get("token"); // Backend JWT

      if (!googleToken) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        localStorage.setItem("token", googleToken);
        setToken(googleToken);

        const { data: user } = await API.get("/auth/me");
        await handleGoogleLogin(googleToken, user);

        if (user.role === "admin") return navigate("/admin", { replace: true });
        if (user.courseId) return navigate("/student/dashboard", { replace: true });

        // Student without course -> fetch courses
        const { data: coursesData } = await API.get("/courses");
        setCourses(coursesData);
        setLoading(false);

      } catch (err) {
        console.error("Auth success error:", err);
        navigate("/login", { replace: true });
      }
    };

    authFlow();
  }, [navigate, handleGoogleLogin]);

  const handleAssignCourse = async () => {
    if (!selectedCourse) return alert("Select a course!");

    try {
      await API.put("/auth/me/course", { courseId: selectedCourse });
      const { data: updatedUser } = await API.get("/auth/me");
      await handleGoogleLogin(token, updatedUser);
      navigate("/student/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Failed to assign course");
    }
  };

  if (loading) return <p>Logging you in...</p>;
  if (courses.length > 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Select Your Course</h2>
          <select
            className="w-full p-3 border rounded mb-4"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Choose your course --</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div className="flex justify-between">
            <button onClick={() => navigate("/login", { replace: true })} className="px-4 py-2 rounded bg-red-500 text-white">Cancel</button>
            <button onClick={handleAssignCourse} className="px-4 py-2 rounded bg-blue-600 text-white">Confirm</button>
          </div>
        </div>
      </div>
    );
  }

  return <p>Logging you in...</p>;
};

export default AuthSuccess;