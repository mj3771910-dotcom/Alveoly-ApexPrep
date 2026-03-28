import { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminContent = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [contents, setContents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    type: "video",
    linkType: "subject",
    courseId: "",
    subjectId: "",
    isPaid: false,
    price: "",
    thumbnail: null,
  });

  // Fetch courses and subjects
  useEffect(() => {
    const fetchData = async () => {
      const [c, s] = await Promise.all([axios.get("/courses"), axios.get("/subjects")]);
      setCourses(c.data);
      setSubjects(s.data);
    };
    fetchData();
  }, []);

  // Fetch contents
  useEffect(() => {
    const fetchContents = async () => {
      const res = await axios.get("/content");
      setContents(res.data);
    };
    fetchContents();
  }, []);

  // ================= HANDLE UPLOAD / UPDATE =================
  const handleUpload = async () => {
    if (!form.title || (!file && !editingId)) return alert("Fill all required fields");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("type", form.type);
    if (file) formData.append("file", file);
    if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

    if (form.linkType === "subject") {
      formData.append("subjectId", form.subjectId);
    } else {
      formData.append("courseId", form.courseId);
    }

    formData.append("isPaid", form.isPaid);
    formData.append("price", form.price);

    try {
      if (editingId) {
        // Update existing content
        const res = await axios.put(`/content/${editingId}`, {
          title: form.title,
          isPaid: form.isPaid,
          price: form.price,
        });
        setContents((prev) => prev.map((c) => (c._id === editingId ? res.data : c)));
        alert("✅ Content updated");
      } else {
        // Upload new content
        const res = await axios.post("/content/upload", formData);
        setContents((prev) => [res.data, ...prev]);
        alert("✅ Uploaded successfully");
      }

      // Reset form
      setForm({
        title: "",
        type: "video",
        linkType: "subject",
        courseId: "",
        subjectId: "",
        isPaid: false,
        price: "",
        thumbnail: null,
      });
      setFile(null);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  // ================= HANDLE DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this content?")) return;
    try {
      await axios.delete(`/content/${id}`);
      setContents((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (content) => {
    setEditingId(content._id);
    setForm({
      title: content.title,
      type: content.type,
      linkType: content.subjectId ? "subject" : "course",
      courseId: content.courseId || "",
      subjectId: content.subjectId || "",
      isPaid: content.isPaid,
      price: content.price,
      thumbnail: null,
    });
    setFile(null);
  };

  return (
  <div className="max-w-6xl mx-auto px-6 py-10">
    <h2 className="text-3xl font-bold mb-8 text-gray-800">
      {editingId ? "✏️ Edit Content" : "📤 Upload Learning Content"}
    </h2>

    {/* FORM */}
    <div className="bg-white p-8 rounded-2xl shadow-md space-y-6 border">
      
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold mb-1">Title</label>
        <input
          placeholder="Enter content title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Type + Link Type */}
      <div className="grid md:grid-cols-2 gap-4">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="video">🎥 Video</option>
          <option value="image">🖼 Image</option>
          <option value="pdf">📄 PDF</option>
        </select>

        <select
          value={form.linkType}
          onChange={(e) => setForm({ ...form, linkType: e.target.value })}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="subject">Attach to Subject</option>
          <option value="course">Attach to Course</option>
        </select>
      </div>

      {/* Subject / Course */}
      {form.linkType === "subject" ? (
        <select
          value={form.subjectId}
          onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      ) : (
        <select
          value={form.courseId}
          onChange={(e) => setForm({ ...form, courseId: e.target.value })}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      )}

      {/* FILE UPLOAD */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Main File */}
        <div>
          <label className="block font-semibold mb-2">Main File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block font-semibold mb-2">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })}
            className="w-full text-sm"
          />

          {form.thumbnail && (
            <img
              src={URL.createObjectURL(form.thumbnail)}
              className="mt-3 w-full h-32 object-cover rounded-lg border"
            />
          )}
        </div>
      </div>

      {/* Paid */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.isPaid}
          onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
        />
        <span className="font-medium">Paid Content</span>
      </div>

      {form.isPaid && (
        <input
          type="number"
          placeholder="Enter price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full p-3 border rounded-lg"
        />
      )}

      {/* BUTTON */}
      <button
        onClick={handleUpload}
        className={`w-full py-3 rounded-xl text-white font-semibold transition ${
          editingId
            ? "bg-yellow-500 hover:bg-yellow-600"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {editingId ? "Update Content" : "Upload Content"}
      </button>
    </div>

    {/* CONTENT GRID */}
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">📚 Uploaded Content</h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden border"
          >
            {/* Thumbnail */}
            <div className="h-40 w-full">
              <img
                src={c.thumbnailUrl || "/placeholder.jpg"}
                className="w-full h-full object-cover"
                alt={c.title}
              />
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-lg">{c.title}</h4>
              <p className="text-xs text-gray-500">{c.type}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(c)}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default AdminContent;