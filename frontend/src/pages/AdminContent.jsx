import { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminContent = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);

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

  const handleUpload = async () => {
    if (!file || !form.title) {
      return alert("Fill all fields");
    }

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("type", form.type);
    formData.append("file", file);

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
    </div>
  );
};

export default AdminContent;