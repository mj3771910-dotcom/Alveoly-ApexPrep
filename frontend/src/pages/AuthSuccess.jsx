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
      const googleToken = params.get("token"); // Google ID token

      if (!googleToken) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        // 1️⃣ Exchange Google token for backend JWT
        const { data } = await API.post("/auth/google-login", { idToken: googleToken });

        const backendToken = data.token;
        const user = data.user;

        localStorage.setItem("token", backendToken);
        setToken(backendToken);

        await handleGoogleLogin(backendToken, user); // store in context

        // 2️⃣ Redirect based on role/course
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
          return;
        }

        if (user.role === "student" && user.courseId) {
          navigate("/student/dashboard", { replace: true });
          return;
        }

        if (user.role === "student" && !user.courseId) {
          const { data: coursesData } = await API.get("/courses");
          setCourses(coursesData);
          setLoading(false);
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
      // Assign course
      await API.put(
        "/auth/me/course",
        { courseId: selectedCourse },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refetch updated user
      const { data: updatedUser } = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      await handleGoogleLogin(token, updatedUser);

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