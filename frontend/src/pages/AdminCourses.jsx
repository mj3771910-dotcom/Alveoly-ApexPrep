import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import axios from "../api/axios"; // your axios instance

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace("/api", "");

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    fetchCourses();

    // ================= SOCKET.IO LISTENERS =================
    socket.on("course:created", (course) => {
      setCourses((prev) => [course, ...prev]);
    });

    socket.on("course:updated", (updatedCourse) => {
      setCourses((prev) =>
        prev.map((c) => (c._id === updatedCourse._id ? updatedCourse : c))
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

  // ================= FETCH COURSES =================
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

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ name: e.target.value });
  };

  // ================= ADD =================
  const handleAdd = async () => {
    if (!form.name.trim()) return;

    try {
      setLoading(true);
      await axios.post("/courses", { name: form.name });
      setForm({ name: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (_id) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      await axios.delete(`/courses/${_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (course) => {
    setEditing(course);
    setForm({ name: course.name });
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!form.name.trim()) return;

    try {
      setLoading(true);
      await axios.put(`/courses/${editing._id}`, { name: form.name });
      setEditing(null);
      setForm({ name: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Courses</h2>

      {/* CREATE */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FaPlus /> {editing ? "Edit Course" : "Add Course"}
        </h3>

        <input
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Course Name"
          className="p-3 border rounded-lg w-full"
        />

        <button
          onClick={editing ? handleUpdate : handleAdd}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {loading
            ? "Processing..."
            : editing
            ? "Update Course"
            : "Add Course"}
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">All Courses</h3>

        {courses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          courses.map((course) => (
            <div
              key={course._id}
              className="flex justify-between items-center border-b py-3"
            >
              <p>{course.name}</p>

              <div className="flex gap-3">
                <button onClick={() => handleEdit(course)}>
                  <FaEdit className="text-blue-600" />
                </button>

                <button onClick={() => handleDelete(course._id)}>
                  <FaTrash className="text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <FaTimes
              className="absolute right-4 top-4 cursor-pointer"
              onClick={() => setEditing(null)}
            />

            <h3 className="font-bold mb-4">Edit Course</h3>

            <input
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;