import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import axios from "../api/axios";
import { io } from "socket.io-client";

const AdminSubjects = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    courseId: "",
    isPaid: false,
    price: "",
  });

  // ================= FETCH =================
  useEffect(() => {
    fetchData();

    // ================= SOCKET.IO LISTENERS =================
    socket.on("subject:created", (data) => {
      setSubjects((prev) => [data, ...prev]);
    });

    socket.on("subject:updated", (updated) => {
      setSubjects((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
    });

    socket.on("subject:deleted", (_id) => {
      setSubjects((prev) => prev.filter((s) => s._id !== _id));
    });

    return () => {
      socket.off("subject:created");
      socket.off("subject:updated");
      socket.off("subject:deleted");
    };
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        axios.get("/courses"),
        axios.get("/subjects"),
      ]);

      setCourses(coursesRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // ================= ADD =================
  const handleAdd = async () => {
    if (!form.name || !form.courseId) {
      alert("All required fields needed");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/subjects", {
        ...form,
        price: form.isPaid ? Number(form.price) : 0,
      });

      setForm({ name: "", courseId: "", isPaid: false, price: "" });
      setEditing(null);
      // No need to emit; server broadcasts via Socket.IO
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (_id) => {
    if (!window.confirm("Delete subject?")) return;

    try {
      await axios.delete(`/subjects/${_id}`);
      // Server broadcasts via Socket.IO
    } catch (err) {
      console.error(err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (subject) => {
    setEditing(subject);
    setForm({
      name: subject.name,
      courseId: subject.courseId,
      isPaid: subject.isPaid,
      price: subject.price || "",
    });
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      setLoading(true);

      await axios.put(`/subjects/${editing._id}`, {
        ...form,
        price: form.isPaid ? Number(form.price) : 0,
      });

      setEditing(null);
      setForm({ name: "", courseId: "", isPaid: false, price: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= GET COURSE NAME =================
  const getCourseName = (id) => {
    return courses.find((c) => c._id === id)?.name || "N/A";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Subjects</h2>

      {/* CREATE */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FaPlus /> {editing ? "Edit Subject" : "Add New Subject"}
        </h3>

        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Subject Name"
            className="p-3 border rounded-lg"
          />

          <select
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPaid"
              checked={form.isPaid}
              onChange={handleChange}
            />
            Paid
          </label>

          {form.isPaid && (
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price (₵)"
              className="p-3 border rounded-lg"
            />
          )}
        </div>

        <button
          onClick={editing ? handleUpdate : handleAdd}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {loading
            ? "Processing..."
            : editing
            ? "Update Subject"
            : "Add Subject"}
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">All Subjects</h3>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-500 text-sm">
              <th>Subject</th>
              <th>Course</th>
              <th>Status</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {subjects.map((s) => (
              <tr key={s._id} className="border-b">
                <td className="py-3">{s.name}</td>
                <td>{getCourseName(s.courseId)}</td>

                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      s.isPaid
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {s.isPaid ? "Paid" : "Free"}
                  </span>
                </td>

                <td>{s.isPaid ? `₵${s.price}` : "-"}</td>

                <td className="flex gap-3 justify-end">
                  <FaEdit
                    className="text-blue-600 cursor-pointer"
                    onClick={() => handleEdit(s)}
                  />

                  <FaTrash
                    className="text-red-600 cursor-pointer"
                    onClick={() => handleDelete(s._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <FaTimes
              className="absolute right-4 top-4 cursor-pointer"
              onClick={() => setEditing(null)}
            />

            <h3 className="font-bold mb-4">Edit Subject</h3>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded mb-3"
            />

            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full p-3 border rounded mb-3"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="flex gap-2 mb-3">
              <input
                type="checkbox"
                name="isPaid"
                checked={form.isPaid}
                onChange={handleChange}
              />
              Paid
            </label>

            {form.isPaid && (
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full p-3 border rounded mb-3"
              />
            )}

            <button
              onClick={handleUpdate}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;