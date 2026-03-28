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
const [manualAccessList, setManualAccessList] = useState([]);
const [duration, setDuration] = useState(30);

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
   const [coursesRes, subjectsRes, usersRes, manualRes] = await Promise.all([
  axios.get("/courses"),
  axios.get("/subjects"),
  axios.get("/users"),
  axios.get("/manual-access/all"), // 🔥 ADD THIS
]);

setCourses(coursesRes.data);
setSubjects(subjectsRes.data);
setUsers(usersRes.data);
setManualAccessList(manualRes.data); // 🔥 ADD THIS
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

  const handleDeleteAccess = async (id) => {
  if (!window.confirm("Delete this access?")) return;

  try {
    await axios.delete(`/manual-access/${id}`);
    fetchData();
  } catch (err) {
    console.error(err);
  }
};

const handleToggleAccess = async (id) => {
  try {
    await axios.patch(`/manual-access/${id}/toggle`);
    fetchData();
  } catch (err) {
    console.error(err);
  }
};

const handleUpdateAccess = async (id) => {
  const days = prompt("Enter new duration (days):");
  if (!days) return;

  try {
    await axios.put(`/manual-access/${id}`, {
      durationDays: Number(days),
    });

    fetchData();
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
  <div className="w-full px-4 md:px-8 py-8 bg-gray-50 min-h-screen">

    {/* HEADER */}
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-800">
        Subject Management
      </h2>
      <p className="text-gray-500 text-sm">
        Create, manage and control subject access
      </p>
    </div>

    {/* ================= SUBJECT FORM ================= */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition mb-8">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <FaPlus /> {editing ? "Edit Subject" : "Add New Subject"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Subject Name"
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <select
          name="courseId"
          value={form.courseId}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPaid"
            checked={form.isPaid}
            onChange={handleChange}
          />
          Paid Subject
        </label>

        {form.isPaid && (
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price (₵)"
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        )}
      </div>

      <button
        onClick={editing ? handleUpdate : handleAdd}
        disabled={loading}
        className="mt-6 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2.5 rounded-xl font-medium shadow-sm"
      >
        {loading
          ? "Processing..."
          : editing
          ? "Update Subject"
          : "Add Subject"}
      </button>
    </div>

    {/* ================= SUBJECT TABLE ================= */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition mb-8">
      <h3 className="font-semibold text-lg mb-4">All Subjects</h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2">Subject</th>
              <th>Course</th>
              <th>Status</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {subjects.map((s) => (
              <tr key={s._id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-800">
                  {s.name}
                </td>

                <td className="text-gray-600">
                  {getCourseName(s.courseId)}
                </td>

                <td>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      s.isPaid
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {s.isPaid ? "Paid" : "Free"}
                  </span>
                </td>

                <td className="font-medium">
                  {s.isPaid ? `₵${s.price}` : "-"}
                </td>

                <td className="flex gap-4 justify-end py-3">
                  <FaEdit
                    className="text-blue-600 cursor-pointer hover:scale-110 transition"
                    onClick={() => handleEdit(s)}
                  />
                  <FaTrash
                    className="text-red-500 cursor-pointer hover:scale-110 transition"
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition mb-8">
      <h3 className="font-semibold text-lg mb-4">
        Manual Unlock (Offline Payment)
      </h3>

      <div className="grid md:grid-cols-4 gap-4">

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="p-3 border border-gray-200 rounded-xl"
        >
          <option value="">Select Student</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-3 border border-gray-200 rounded-xl"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Days (30)"
          className="p-3 border border-gray-200 rounded-xl"
          onChange={(e) => setDuration(e.target.value)}
        />

        <button
          onClick={handleManualUnlock}
          disabled={manualLoading}
          className="bg-green-600 hover:bg-green-700 transition text-white rounded-xl px-4 py-2"
        >
          {manualLoading ? "Processing..." : "Unlock"}
        </button>
      </div>
    </div>

    {/* ================= MANUAL ACCESS LIST ================= */}
{/* ================= MANUAL ACCESS LIST ================= */}
<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">

  <div className="flex justify-between items-center mb-4">
    <h3 className="font-semibold text-lg">
      Manual Access (Students & Subjects)
    </h3>

    <span className="text-sm text-gray-500">
      {manualAccessList.length} records
    </span>
  </div>

  {manualAccessList.length === 0 ? (
    <p className="text-gray-500 text-sm">
      No manual unlocks yet
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">

        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2 text-left">Student</th>
            <th className="text-left">Subject</th>
            <th className="text-left">Expiry</th>
            <th className="text-left">Status</th>
            <th className="text-left">Note</th>
            <th className="text-left">Actions</th> {/* NEW */}
          </tr>
        </thead>

        <tbody>
          {manualAccessList.map((m) => (
            <tr key={m._id} className="border-b hover:bg-gray-50">

              {/* STUDENT */}
              <td className="py-3">
                <div className="font-medium text-gray-800">{m.userId?.name}</div>
                <div className="text-xs text-gray-500">{m.userId?.email}</div>
              </td>

              {/* SUBJECT */}
              <td className="text-blue-600 font-medium">{m.subjectId?.name}</td>

              {/* EXPIRY */}
              <td>{new Date(m.expiresAt).toLocaleDateString()}</td>

              {/* STATUS */}
              <td>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    m.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {m.isActive ? "Active" : "Expired"}
                </span>
              </td>

              {/* NOTE */}
              <td className="text-gray-500 text-xs">{m.note || "-"}</td>

              {/* ACTIONS */}
              <td className="flex gap-2">
                <button
                  onClick={() => handleUpdateAccess(m._id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                >
                  Update
                </button>

                <button
                  onClick={() => handleToggleAccess(m._id)}
                  className={`px-2 py-1 rounded text-xs text-white ${
                    m.status === "locked"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {m.status === "locked" ? "Unlock" : "Lock"}
                </button>

                <button
                  onClick={() => handleDeleteAccess(m._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  )}
</div>

    {/* ================= EDIT MODAL ================= */}
    {editing && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
        <div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-lg">

          <FaTimes
            className="absolute right-4 top-4 cursor-pointer text-gray-500"
            onClick={() => setEditing(null)}
          />

          <h3 className="font-bold text-lg mb-4">Edit Subject</h3>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-xl mb-3"
          />

          <select
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-xl mb-3"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="flex gap-2 mb-3 text-sm">
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
              className="w-full p-3 border border-gray-200 rounded-xl mb-3"
            />
          )}

          <button
            onClick={handleUpdate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl"
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