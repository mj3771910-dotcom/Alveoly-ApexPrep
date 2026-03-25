import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

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
      const tokenFromUrl = params.get("token");

      if (!tokenFromUrl) {
        navigate("/login", { replace: true });
        return;
      }

      setToken(tokenFromUrl);

      try {
        // ✅ Get user FIRST
        const { data: user } = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${tokenFromUrl}` },
        });

        // ✅ Store in context
        handleGoogleLogin(tokenFromUrl, user);

        // ✅ ADMIN
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
          return;
        }

        // ✅ STUDENT WITH COURSE
        if (user.role === "student" && user.courseId) {
          navigate("/student/dashboard", { replace: true });
          return;
        }

        // ✅ STUDENT WITHOUT COURSE
        if (user.role === "student" && !user.courseId) {
          const { data } = await API.get("/courses");
          setCourses(data);
          setLoading(false);
          return;
        }

      } catch (err) {
        console.error("Auth success error:", err);
        navigate("/login", { replace: true });
      }
    };

    authFlow();
  }, [navigate, handleGoogleLogin]);

  // ================= ASSIGN COURSE =================
  const handleAssignCourse = async () => {
    if (!selectedCourse) return alert("Select a course!");

    try {
      // ✅ Assign course
      await API.put(
        "/auth/me/course",
        { courseId: selectedCourse },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔥 IMPORTANT: REFETCH UPDATED USER
      const { data: updatedUser } = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔥 UPDATE CONTEXT WITH NEW USER
      handleGoogleLogin(token, updatedUser);

      // ✅ NOW GO TO DASHBOARD
      navigate("/student/dashboard", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Failed to assign course");
    }
  };

  // ================= UI =================
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
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex justify-between">
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="px-4 py-2 rounded bg-red-500 text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleAssignCourse}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <p>Logging you in...</p>;
};

export default AuthSuccess;