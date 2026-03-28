import { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminContent = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [contents, setContents] = useState([]);

  const [form, setForm] = useState({
    title: "",
    type: "video",
    linkType: "subject", // 🔥 KEY (subject OR course)
    courseId: "",
    subjectId: "",
    isPaid: false,
    price: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const [c, s] = await Promise.all([
        axios.get("/courses"),
        axios.get("/subjects"),
      ]);
      setCourses(c.data);
      setSubjects(s.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
  const fetchContents = async () => {
    const res = await axios.get("/content");
    setContents(res.data);
  };

  fetchContents();
}, []);

  const handleUpload = async () => {
    if (!file || !form.title) {
      return alert("Fill all fields");
    }

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("type", form.type);
    formData.append("file", file);
    formData.append("thumbnail", form.thumbnail);

    if (form.linkType === "subject") {
      formData.append("subjectId", form.subjectId);
    } else {
      formData.append("courseId", form.courseId);
    }

    formData.append("isPaid", form.isPaid);
    formData.append("price", form.price);

    await axios.post("/content/upload", formData);

    alert("✅ Uploaded successfully");

    // reset
    setForm({
      title: "",
      type: "video",
      linkType: "subject",
      courseId: "",
      subjectId: "",
      isPaid: false,
      price: "",
    });
    setFile(null);
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this content?")) return;

  await axios.delete(`/content/${id}`);

  setContents((prev) => prev.filter((c) => c._id !== id));
};



  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Upload Learning Content</h2>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <input
          placeholder="Content title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 border rounded"
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full p-3 border rounded"
        >
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="pdf">PDF</option>
        </select>

        {/* 🔥 LINK TYPE */}
        <select
          value={form.linkType}
          onChange={(e) =>
            setForm({ ...form, linkType: e.target.value })
          }
          className="w-full p-3 border rounded"
        >
          <option value="subject">Attach to Subject</option>
          <option value="course">Attach to Course</option>
        </select>

        {form.linkType === "subject" ? (
          <select
            value={form.subjectId}
            onChange={(e) =>
              setForm({ ...form, subjectId: e.target.value })
            }
            className="w-full p-3 border rounded"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={form.courseId}
            onChange={(e) =>
              setForm({ ...form, courseId: e.target.value })
            }
            className="w-full p-3 border rounded"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full"
        />

        <input
  type="file"
  onChange={(e) => setFile(e.target.files[0])}
/>

<input
  type="file"
  onChange={(e) =>
    setForm({ ...form, thumbnail: e.target.files[0] })
  }
/>

        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={form.isPaid}
            onChange={(e) =>
              setForm({ ...form, isPaid: e.target.checked })
            }
          />
          Paid Content
        </label>

        {form.isPaid && (
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
            className="w-full p-3 border rounded"
          />
        )}

        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          Upload Content
        </button>
      </div>

      <div className="mt-10">
  <h3 className="text-xl font-bold mb-4">Uploaded Content</h3>

  <div className="grid md:grid-cols-3 gap-6">
    {contents.map((c) => (
      <div key={c._id} className="bg-white p-4 rounded-xl shadow">

        {/* THUMBNAIL */}
        <img
          src={c.thumbnailUrl}
          className="w-full h-40 object-cover rounded mb-3"
        />

        <h4 className="font-bold">{c.title}</h4>
        <p className="text-xs text-gray-500 mb-2">{c.type}</p>

        <div className="flex gap-2 mt-3">
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