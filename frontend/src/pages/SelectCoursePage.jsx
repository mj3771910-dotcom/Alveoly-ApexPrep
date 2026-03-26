import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const SelectCoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get("/courses");
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  const handleSubmit = async () => {
    if (!selected) return alert("Please select a course");

    try {
      setLoading(true);

      const res = await API.put("/auth/me/course", {
        courseId: selected,
      });

      // ✅ update user in context
      setUser(res.data);

      // ✅ go to dashboard
      navigate("/student/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to assign course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Select Your Course
        </h2>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        >
          <option value="">Choose a course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default SelectCoursePage;