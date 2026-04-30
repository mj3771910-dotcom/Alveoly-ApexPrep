import { useEffect, useState } from "react";
import axios from "../api/axios";
import { FaPlayCircle, FaFilePdf } from "react-icons/fa";

const AdminContent = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [contents, setContents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const QuizEditor = ({ lesson, onClose, onSave }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    rationale: "",
    points: 1,
  });
}

  // ✅ VIEWER STATE (NEW)
  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
  });

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
      const [c, s] = await Promise.all([
        axios.get("/courses"),
        axios.get("/subjects"),
      ]);
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
    if (!form.title || (!file && !editingId))
      return alert("Fill all required fields");

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
  const formData = new FormData();

  formData.append("title", form.title);
  formData.append("isPaid", form.isPaid);
  formData.append("price", form.price);

  if (file) formData.append("file", file);
  if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

  const res = await axios.put(`/content/${editingId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  setContents((prev) =>
    prev.map((c) => (c._id === editingId ? res.data : c))
  );

  alert("✅ Content updated");
} else {
        const res = await axios.post("/content/upload", formData);
        setContents((prev) => [res.data, ...prev]);
        alert("✅ Uploaded successfully");
      }

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

  // ================= DELETE =================
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

  // ================= EDIT =================
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

  // ✅ OPEN VIEWER
  const openViewer = (c) => {
    setViewer({
      open: true,
      type: c.type,
      url: c.fileUrl,
      title: c.title,
    });
  };

  // ✅ CLOSE VIEWER
  const closeViewer = () => {
    setViewer({ open: false, type: "", url: "", title: "" });
  };

  useEffect(() => {
    if (lesson?._id) {
      fetchExistingQuestions();
    }
  }, [lesson]);

  const fetchExistingQuestions = async () => {
    try {
      const res = await axios.get(`/lesson-quiz/lesson/${lesson._id}`);
      if (res.data.length) {
        setQuestions(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert("Please fill all options");
      return;
    }
    if (!currentQuestion.correctAnswer) {
      alert("Please select correct answer");
      return;
    }

    setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      rationale: "",
      points: 1,
    });
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/lesson-quiz/save", {
        lessonId: lesson._id,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          rationale: q.rationale,
          points: q.points,
        })),
      });
      alert(`Saved ${questions.length} questions for this lesson!`);
      onSave?.();
      onClose();
    } catch (err) {
      alert("Failed to save questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Type + Link Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
              className="p-3 border rounded-lg"
            >
              <option value="video">🎥 Video</option>
              <option value="image">🖼 Image</option>
              <option value="pdf">📄 PDF</option>
            </select>

            <select
              value={form.linkType}
              onChange={(e) =>
                setForm({ ...form, linkType: e.target.value })
              }
              className="p-3 border rounded-lg"
            >
              <option value="subject">Attach to Subject</option>
              <option value="course">Attach to Course</option>
            </select>
          </div>

          {/* Subject / Course */}
          {form.linkType === "subject" ? (
            <select
              value={form.subjectId}
              onChange={(e) =>
                setForm({ ...form, subjectId: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
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
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* FILES */}
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, thumbnail: e.target.files[0] })
              }
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handleUpload}
            className={`w-full py-3 rounded-xl text-white ${
              editingId ? "bg-yellow-500" : "bg-blue-600"
            }`}
          >
            {editingId ? "Update Content" : "Upload Content"}
          </button>
        </div>

        {/* CONTENT GRID */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">
            📚 Uploaded Content
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((c) => (
              <div
                key={c._id}
                onClick={() => openViewer(c)}
                className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden border group cursor-pointer"
              >
                {/* THUMBNAIL */}
                <div className="relative h-40 w-full">
                  <img
                    src={c.thumbnailUrl || "/placeholder.jpg"}
                    className="w-full h-full object-cover"
                    alt={c.title}
                  />

                  {/* TYPE */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {c.type}
                  </div>

                  {/* ▶ VIDEO */}
                  {c.type === "video" && (
                    <FaPlayCircle className="absolute inset-0 m-auto text-white text-5xl" />
                  )}

                  {/* 📄 PDF */}
                  {c.type === "pdf" && (
                    <FaFilePdf className="absolute inset-0 m-auto text-red-600 text-4xl" />
                  )}
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-lg">{c.title}</h4>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(c);
                      }}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c._id);
                      }}
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

      {/* ================= MODAL ================= */}
      {viewer.open && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 text-white">
            <h3>{viewer.title}</h3>
            <button onClick={closeViewer}>✖</button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            {viewer.type === "video" && (
              <video src={viewer.url} controls autoPlay className="max-h-full" />
            )}

            {viewer.type === "image" && (
              <img src={viewer.url} className="max-h-full" />
            )}

             {viewer.type === "pdf" && (
  <iframe
    src={`https://docs.google.com/gview?url=${viewer.url}&embedded=true`}
    className="w-full h-full rounded-lg"
  />
            )}
          </div>
        </div>
      )}

       <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Quiz Editor: {lesson?.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        <div className="p-6">
          {/* Add Question Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-4">Add New Question</h3>
            
            <textarea
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              placeholder="Enter question"
              className="w-full p-3 border rounded mb-3"
              rows="2"
            />

            {currentQuestion.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...currentQuestion.options];
                    newOpts[idx] = e.target.value;
                    setCurrentQuestion({ ...currentQuestion, options: newOpts });
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  className="flex-1 p-3 border rounded"
                />
              </div>
            ))}

            <select
              value={currentQuestion.correctAnswer}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
              className="w-full p-3 border rounded mb-3"
            >
              <option value="">Select Correct Answer</option>
              {currentQuestion.options.map((_, idx) => (
                <option key={idx} value={String.fromCharCode(65 + idx)}>
                  {String.fromCharCode(65 + idx)}
                </option>
              ))}
            </select>

            <textarea
              value={currentQuestion.rationale}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, rationale: e.target.value })}
              placeholder="Rationale (explanation)"
              className="w-full p-3 border rounded mb-3"
              rows="2"
            />

            <input
              type="number"
              value={currentQuestion.points}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
              placeholder="Points"
              className="w-32 p-3 border rounded mb-3"
              min="1"
            />

            <button
              onClick={addQuestion}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Add Question
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Questions ({questions.length})</h3>
            {questions.map((q, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{idx + 1}. {q.question}</p>
                    <div className="ml-4 mt-2 space-y-1">
                      {q.options.map((opt, i) => (
                        <p key={i} className={String.fromCharCode(65 + i) === q.correctAnswer ? "text-green-600 font-semibold" : ""}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </p>
                      ))}
                    </div>
                    {q.rationale && (
                      <p className="text-sm text-gray-600 mt-2">💡 {q.rationale}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Points: {q.points}</p>
                  </div>
                  <button
                    onClick={() => removeQuestion(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={saveQuiz}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminContent;