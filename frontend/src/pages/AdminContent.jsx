import { useEffect, useState } from "react";
import axios from "../api/axios";
import { FaPlayCircle, FaFilePdf, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

// Quiz Editor Component (moved outside)
const QuizEditor = ({ lesson, onClose, onSave }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  // Add this state in QuizEditor component
const [timerMinutes, setTimerMinutes] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    rationale: "",
    points: 1,
  });

  useEffect(() => {
    if (lesson?._id) {
      fetchExistingQuestions();
    }
  }, [lesson]);

  const fetchExistingQuestions = async () => {
    try {
      const res = await axios.get(`/lesson-quiz/lesson/${lesson._id}`);
      if (res.data && res.data.length) {
        setQuestions(res.data);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
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
    console.log("Saving questions for lesson:", lesson._id);
    console.log("Questions to save:", questions);

    // Format questions properly for backend
    const formattedQuestions = questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      rationale: q.rationale || "",
      points: q.points || 1,
    }));

    const response = await axios.post("/lesson-quiz/save", {
  lessonId: lesson._id,
  questions: formattedQuestions,
  timerMinutes: timerMinutes, // Add this
});

    console.log("Save response:", response.data);
    alert(`✅ Saved ${questions.length} questions for this lesson!`);
    onSave?.();
    onClose();
  } catch (err) {
    console.error("Save error - Full error:", err);
    console.error("Error response:", err.response);
    console.error("Error message:", err.message);
    
    // Show detailed error message
    const errorMsg = err.response?.data?.message || err.message || "Failed to save questions";
    alert(`Failed to save questions: ${errorMsg}`);
  } finally {
    setLoading(false);
  }
};

  return (
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
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
              placeholder="Points"
              className="w-32 p-3 border rounded mb-3"
              min="1"
            />

            <button
              onClick={addQuestion}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Add Question
            </button>
          </div>

          <div className="mb-4">
  <label className="block text-sm font-semibold mb-1">Quiz Timer (minutes)</label>
  <select
    value={timerMinutes}
    onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
    className="w-full p-3 border rounded"
  >
    <option value="0">No timer</option>
    <option value="5">5 minutes</option>
    <option value="10">10 minutes</option>
    <option value="15">15 minutes</option>
    <option value="20">20 minutes</option>
    <option value="30">30 minutes</option>
    <option value="45">45 minutes</option>
    <option value="60">60 minutes</option>
  </select>
</div>


          {/* Questions List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Questions ({questions.length})</h3>
            {questions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No questions added yet. Add your first question above.</p>
            ) : (
              questions.map((q, idx) => (
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
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button
            onClick={saveQuiz}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main AdminContent Component
const AdminContent = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [contents, setContents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Viewer state
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
      try {
        const [c, s] = await Promise.all([
          axios.get("/courses"),
          axios.get("/subjects"),
        ]);
        setCourses(c.data);
        setSubjects(s.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch contents
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await axios.get("/content");
        setContents(res.data);
      } catch (err) {
        console.error("Error fetching contents:", err);
      }
    };
    fetchContents();
  }, []);

  // Handle upload / update
  // In AdminContent.jsx - Update handleUpload
const handleUpload = async () => {
  if (!form.title || (!file && !editingId)) {
    return alert("Please fill all required fields");
  }

  // Validate subject/course selection
  if (form.linkType === "subject" && !form.subjectId) {
    return alert("Please select a subject");
  }
  
  if (form.linkType === "course" && !form.courseId) {
    return alert("Please select a course");
  }

  const formData = new FormData();
  formData.append("title", form.title);
  formData.append("type", form.type);
  if (file) formData.append("file", file);
  if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

  if (form.linkType === "subject") {
    formData.append("subjectId", form.subjectId);
    // Get courseId from the selected subject
    const selectedSubject = subjects.find(s => s._id === form.subjectId);
    if (selectedSubject && selectedSubject.courseId) {
      formData.append("courseId", selectedSubject.courseId);
    } else {
      alert("Selected subject is not associated with a course");
      return;
    }
  } else {
    formData.append("courseId", form.courseId);
  }

  formData.append("isPaid", form.isPaid);
  formData.append("price", form.price);

  try {
    if (editingId) {
      const res = await axios.put(`/content/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setContents((prev) => prev.map((c) => (c._id === editingId ? res.data : c)));
      alert("✅ Content updated");
    } else {
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
    console.error("Upload error:", err);
    alert("Operation failed: " + (err.response?.data?.message || err.message));
  }
};

  // Delete content
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this content?")) return;
    try {
      await axios.delete(`/content/${id}`);
      setContents((prev) => prev.filter((c) => c._id !== id));
      alert("✅ Deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Edit content
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

  // Open viewer
  const openViewer = (c) => {
    setViewer({
      open: true,
      type: c.type,
      url: c.fileUrl,
      title: c.title,
    });
  };

  // Close viewer
  const closeViewer = () => {
    setViewer({ open: false, type: "", url: "", title: "" });
  };

  // Open quiz editor
  const openQuizEditor = (lesson) => {
    setSelectedLesson(lesson);
    setShowQuizEditor(true);
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
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Type + Link Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="p-3 border rounded-lg"
            >
              <option value="video">🎥 Video</option>
              <option value="image">🖼 Image</option>
              <option value="pdf">📄 PDF</option>
            </select>

            <select
              value={form.linkType}
              onChange={(e) => setForm({ ...form, linkType: e.target.value })}
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
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
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
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
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

          {/* Paid Content Toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPaid}
                onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
              />
              This is paid content
            </label>
            {form.isPaid && (
              <input
                type="number"
                placeholder="Price (₵)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="p-2 border rounded w-32"
              />
            )}
          </div>

          {/* FILES */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1">Content File</label>
              <input
                type="file"
                accept="video/*,image/*,application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Thumbnail (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleUpload}
            className={`w-full py-3 rounded-xl text-white font-semibold transition ${
              editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
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
                className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden border group cursor-pointer"
              >
                <div onClick={() => openViewer(c)}>
                  {/* THUMBNAIL */}
                  <div className="relative h-40 w-full bg-gray-100">
                    <img
                      src={c.thumbnailUrl || "/placeholder.jpg"}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      alt={c.title}
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />

                    {/* TYPE BADGE */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {c.type === "video" ? "🎥 Video" : c.type === "pdf" ? "📄 PDF" : "🖼 Image"}
                    </div>

                    {/* PLAY BUTTON FOR VIDEO */}
                    {c.type === "video" && (
                      <FaPlayCircle className="absolute inset-0 m-auto text-white text-5xl opacity-90" />
                    )}

                    {/* PDF ICON */}
                    {c.type === "pdf" && (
                      <FaFilePdf className="absolute inset-0 m-auto text-red-600 text-4xl" />
                    )}

                    {/* PAID BADGE */}
                    {c.isPaid && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        ₵{c.price}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-lg group-hover:text-blue-600 transition">
                      {c.title}
                    </h4>
                  </div>
                </div>

                <div className="p-4 pt-0 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(c);
                    }}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c._id);
                    }}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 transition flex items-center justify-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openQuizEditor(c);
                    }}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <FaPlus /> Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VIEWER MODAL */}
      {viewer.open && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 text-white bg-black/50">
            <h3 className="text-lg font-semibold">{viewer.title}</h3>
            <button onClick={closeViewer} className="hover:text-gray-300 text-2xl">
              ✖
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            {viewer.type === "video" && (
              <video src={viewer.url} controls autoPlay className="max-h-full max-w-full rounded-lg" />
            )}
            {viewer.type === "image" && (
              <img src={viewer.url} alt={viewer.title} className="max-h-full max-w-full rounded-lg" />
            )}
            {viewer.type === "pdf" && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(viewer.url)}&embedded=true`}
                title={viewer.title}
                className="w-full h-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}

      {/* QUIZ EDITOR MODAL */}
      {showQuizEditor && selectedLesson && (
        <QuizEditor
          lesson={selectedLesson}
          onClose={() => {
            setShowQuizEditor(false);
            setSelectedLesson(null);
          }}
          onSave={() => {
            console.log("Quiz saved for lesson:", selectedLesson.title);
          }}
        />
      )}
    </>
  );
};

export default AdminContent;