import { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    price: "",
    subjects: [],
    duration: "",
    durationUnit: "days",
  });

  const [editingId, setEditingId] = useState(null);

  // ================= FETCH =================
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/plans");
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchSubjects();
  }, []);

  // ================= HANDLE =================
  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.duration) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await axios.put(`/plans/${editingId}`, form);
      } else {
        await axios.post("/plans", form);
      }

      setForm({
        title: "",
        price: "",
        subjects: [],
        duration: "",
        durationUnit: "days",
      });

      setEditingId(null);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan) => {
    setForm({
      title: plan.title,
      price: plan.price,
      subjects: plan.subjects.map((s) => s._id),
      duration: plan.duration || "",
      durationUnit: plan.durationUnit || "days",
    });
    setEditingId(plan._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan?")) return;

    try {
      await axios.delete(`/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan");
    }
  };

  const toggleSubject = (id) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(id)
        ? prev.subjects.filter((s) => s !== id)
        : [...prev.subjects, id],
    }));
  };

  // ================= UI =================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          📦 Subscription Plans
        </h2>

        {/* ================= FORM ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            {editingId ? "Edit Plan" : "Create New Plan"}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Plan title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              placeholder="Price (GHS)"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              placeholder="Duration"
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: e.target.value })
              }
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={form.durationUnit}
              onChange={(e) =>
                setForm({ ...form, durationUnit: e.target.value })
              }
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </div>

          {/* SUBJECTS */}
          <div className="mt-6">
            <p className="font-semibold mb-2 text-gray-700">
              Select Subjects
            </p>

            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
              <div className="grid md:grid-cols-3 gap-2">
                {subjects.map((s) => (
                  <label
                    key={s._id}
                    className="flex items-center gap-2 bg-white p-2 rounded border hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.subjects.includes(s._id)}
                      onChange={() => toggleSubject(s._id)}
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Plan"
              : "Create Plan"}
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-md border">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Existing Plans
          </h3>

          {loading ? (
            <p className="text-gray-500">Loading plans...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3">Title</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Subjects</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {plans.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 font-medium">{p.title}</td>

                      <td>₵{p.price}</td>

                      <td>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                          {p.duration} {p.durationUnit}
                        </span>
                      </td>

                      <td className="max-w-xs text-gray-600">
                        {p.subjects.map((s) => s.name).join(", ")}
                      </td>

                      <td className="space-x-3">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {plans.length === 0 && (
                <p className="text-center text-gray-400 mt-4">
                  No plans created yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPlans;