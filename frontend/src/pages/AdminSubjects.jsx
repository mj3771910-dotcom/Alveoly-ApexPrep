import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import axios from "../api/axios";
import { io } from "socket.io-client";

const socket = io("https://alveoly-apexprep-backend.onrender.com");

const AdminSubjects = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState("");
const [selectedSubject, setSelectedSubject] = useState("");
const [manualLoading, setManualLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    courseId: "",
    isPaid: false,
    price: "",
  });

  // ================= FETCH =================
  useEffect(() => {
    fetchData();

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
    const [coursesRes, subjectsRes, usersRes] = await Promise.all([
      axios.get("/courses"),
      axios.get("/subjects"),
      axios.get("/users"), // 🔥 ADD THIS
    ]);

    setCourses(coursesRes.data);
    setSubjects(subjectsRes.data);
    setUsers(usersRes.data); // 🔥 ADD THIS
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualUnlock = async () => {
  if (!selectedUser || !selectedSubject) {
    alert("Please select student and subject");
    return;
  }

  try {
    setManualLoading(true);

    await axios.post("/manual-access/grant", {
      userId: selectedUser,
      subjectId: selectedSubject,
      durationDays: 30, // you can customize later
      note: "Offline payment",
    });

    alert("✅ Subject unlocked successfully");

    // reset
    setSelectedUser("");
    setSelectedSubject("");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to unlock");
  } finally {
    setManualLoading(false);
  }
};

  // ================= DELETE =================
  const handleDelete = async (_id) => {
    if (!window.confirm("Delete subject?")) return;

    try {
      await axios.delete(`/subjects/${_id}`);
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

  const getCourseName = (id) => {
    return courses.find((c) => c._id === id)?.name || "N/A";
  };

  return (
    <div className="w-full min-w-0">
      <h2 className="text-2xl font-bold mb-6">Manage Subjects</h2>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FaPlus /> {editing ? "Edit Subject" : "Add New Subject"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Subject Name"
            className="w-full min-w-0 p-3 border rounded-lg"
          />

          <select
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
            className="w-full min-w-0 p-3 border rounded-lg"
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
              className="w-full min-w-0 p-3 border rounded-lg"
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

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">All Subjects</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
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
                  <td className="py-3 break-words">{s.name}</td>
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
      </div>

      {/* ================= MANUAL UNLOCK ================= */}
<div className="bg-white p-6 rounded-xl shadow mb-8">
  <h3 className="font-semibold mb-4">
    Manual Unlock (Offline Payment)
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* SELECT STUDENT */}
    <select
      value={selectedUser}
      onChange={(e) => setSelectedUser(e.target.value)}
      className="p-3 border rounded-lg"
    >
      <option value="">Select Student</option>
      {users.map((u) => (
        <option key={u._id} value={u._id}>
          {u.name} ({u.email})
        </option>
      ))}
    </select>

    {/* SELECT SUBJECT */}
    <select
      value={selectedSubject}
      onChange={(e) => setSelectedSubject(e.target.value)}
      className="p-3 border rounded-lg"
    >
      <option value="">Select Subject</option>
      {subjects.map((s) => (
        <option key={s._id} value={s._id}>
          {s.name}
        </option>
      ))}
    </select>

    {/* BUTTON */}
    <button
      onClick={handleManualUnlock}
      disabled={manualLoading}
      className="bg-green-600 text-white rounded-lg px-4 py-2"
    >
      {manualLoading ? "Unlocking..." : "Unlock Subject"}
    </button>
  </div>
</div>

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
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
              className="w-full min-w-0 p-3 border rounded mb-3"
            />

            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full min-w-0 p-3 border rounded mb-3"
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
                className="w-full min-w-0 p-3 border rounded mb-3"
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