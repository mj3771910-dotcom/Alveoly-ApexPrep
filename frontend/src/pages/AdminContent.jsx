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
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">{editingId ? "Edit Content" : "Upload Learning Content"}</h2>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        {/* Title */}
        <input
          placeholder="Content title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 border rounded"
        />

        {/* Type */}
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full p-3 border rounded"
        >
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="pdf">PDF</option>
        </select>

        {/* Link type */}
        <select
          value={form.linkType}
          onChange={(e) => setForm({ ...form, linkType: e.target.value })}
          className="w-full p-3 border rounded"
        >
          <option value="subject">Attach to Subject</option>
          <option value="course">Attach to Course</option>
        </select>

        {/* Subject / Course select */}
        {form.linkType === "subject" ? (
          <select
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            className="w-full p-3 border rounded"
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
            className="w-full p-3 border rounded"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        )}

        {/* ================= FILE INPUTS ================= */}
        <div className="space-y-4">
          {/* Main File */}
          <div>
            <label className="block mb-1 font-semibold">Main Content (Video, Image, PDF)</label>
            <input
              type="file"
              accept={
                form.type === "video"
                  ? "video/*"
                  : form.type === "image"
                  ? "image/*"
                  : ".pdf"
              }
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full"
            />
            {file && <p className="text-xs text-gray-500 mt-1">Selected file: {file.name}</p>}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block mb-1 font-semibold">Thumbnail (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })}
              className="w-full"
            />
            {form.thumbnail && (
              <div className="mt-1">
                <p className="text-xs text-gray-500">Selected thumbnail: {form.thumbnail.name}</p>
                <img
                  src={URL.createObjectURL(form.thumbnail)}
                  alt="thumbnail preview"
                  className="w-32 h-20 object-cover rounded mt-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Paid Content */}
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={form.isPaid}
            onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
          />
          Paid Content
        </label>

        {form.isPaid && (
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full p-3 border rounded"
          />
        )}

        <button
          onClick={handleUpload}
          className={`w-full py-3 rounded-lg text-white ${editingId ? "bg-yellow-600" : "bg-blue-600"}`}
        >
          {editingId ? "Update Content" : "Upload Content"}
        </button>
      </div>

      {/* ================= CONTENT LIST ================= */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">Uploaded Content</h3>

        <div className="grid md:grid-cols-3 gap-6">
          {contents.map((c) => (
            <div key={c._id} className="bg-white p-4 rounded-xl shadow">
              {/* THUMBNAIL */}
              <div className="w-full aspect-[16/9] mb-3">
                <img
                  src={c.thumbnailUrl}
                  className="w-full h-full object-cover rounded"
                  alt={c.title}
                />
              </div>

              <h4 className="font-bold">{c.title}</h4>
              <p className="text-xs text-gray-500 mb-2">{c.type}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(c)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;