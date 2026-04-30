// AdminContent.jsx - UPDATED with Quiz type
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { FaPlayCircle, FaFilePdf, FaPlus, FaEdit, FaTrash, FaQuestionCircle } from "react-icons/fa";

// Quiz Editor Component for standalone quizzes
const StandaloneQuizEditor = ({ content, onClose, onSave }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(content?.quizTimerMinutes || 0);
  const [passMark, setPassMark] = useState(content?.quizPassMark || 70);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    rationale: "",
    points: 1,
  });

  useEffect(() => {
    if (content?._id) {
      fetchExistingQuestions();
    }
  }, [content]);

  const fetchExistingQuestions = async () => {
    try {
      const res = await axios.get(`/lesson-quiz/lesson/${content._id}`);
      if (res.data && res.data.length) {
        setQuestions(res.data);
        if (res.data[0]?.timerMinutes) {
          setTimerMinutes(res.data[0].timerMinutes);
        }
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const resetForm = () => {
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      rationale: "",
      points: 1,
    });
    setEditingIndex(null);
  };

  const handleEditQuestion = (index) => {
    const questionToEdit = questions[index];
    setCurrentQuestion({
      question: questionToEdit.question,
      options: [...questionToEdit.options],
      correctAnswer: questionToEdit.correctAnswer,
      rationale: questionToEdit.rationale || "",
      points: questionToEdit.points || 1,
    });
    setEditingIndex(index);
    document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const addOrUpdateQuestion = () => {
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

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = {
        ...updatedQuestions[editingIndex],
        question: currentQuestion.question,
        options: [...currentQuestion.options],
        correctAnswer: currentQuestion.correctAnswer,
        rationale: currentQuestion.rationale,
        points: currentQuestion.points,
      };
      setQuestions(updatedQuestions);
      alert("Question updated successfully!");
    } else {
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    }
    
    resetForm();
  };

  const removeQuestion = (index) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((_, i) => i !== index));
      if (editingIndex === index) {
        resetForm();
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const saveQuiz = async () => {
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    setLoading(true);
    try {
      const formattedQuestions = questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale || "",
        points: q.points || 1,
      }));

      // First save the content with quiz settings
      await axios.put(`/content/${content._id}`, {
        title: content.title,
        quizTimerMinutes: timerMinutes,
        quizPassMark: passMark,
      });

      // Then save the questions
      const response = await axios.post("/lesson-quiz/save", {
        lessonId: content._id,
        questions: formattedQuestions,
        timerMinutes: timerMinutes,
      });

      alert(`✅ Saved ${questions.length} questions for "${content.title}"!`);
      onSave?.();
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Quiz Editor: {content?.title}</h2>
            <p className="text-sm text-gray-500">
              {questions.length} question(s) | Total Points: {totalPoints}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        <div className="p-6">
          {/* Quiz Settings */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Quiz Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">⏱️ Timer (minutes)</label>
                <select
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                  className="w-full p-3 border rounded-lg bg-white"
                >
                  <option value="0">No timer</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">🎯 Pass Mark (%)</label>
                <input
                  type="number"
                  value={passMark}
                  onChange={(e) => setPassMark(Math.min(100, Math.max(0, parseInt(e.target.value) || 70)))}
                  className="w-full p-3 border rounded-lg bg-white"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Add/Edit Question Form */}
          <div id="question-form" className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-4">
              {editingIndex !== null ? "✏️ Edit Question" : "➕ Add New Question"}
            </h3>
            
            <textarea
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              placeholder="Enter question"
              className="w-full p-3 border rounded mb-3"
              rows="2"
            />

            {currentQuestion.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <span className="w-8 h-10 flex items-center justify-center bg-gray-200 rounded font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
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

            <div className="grid grid-cols-2 gap-3 mb-3">
              <select
                value={currentQuestion.correctAnswer}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                className="w-full p-3 border rounded"
              >
                <option value="">Select Correct Answer</option>
                {currentQuestion.options.map((_, idx) => (
                  <option key={idx} value={String.fromCharCode(65 + idx)}>
                    {String.fromCharCode(65 + idx)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                placeholder="Points"
                className="w-full p-3 border rounded"
                min="1"
              />
            </div>

            <textarea
              value={currentQuestion.rationale}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, rationale: e.target.value })}
              placeholder="Rationale (explanation for correct answer)"
              className="w-full p-3 border rounded mb-3"
              rows="2"
            />

            <div className="flex gap-3">
              <button
                onClick={addOrUpdateQuestion}
                className={`flex-1 px-4 py-2 rounded flex items-center justify-center gap-2 ${
                  editingIndex !== null 
                    ? "bg-yellow-500 hover:bg-yellow-600" 
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition`}
              >
                {editingIndex !== null ? "✏️ Update Question" : "➕ Add Question"}
              </button>
              
              {editingIndex !== null && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Questions List</h3>
              <span className="text-sm text-gray-500">Total Points: {totalPoints}</span>
            </div>
            
            {questions.length === 0 ? (
              <p className="text-gray-500 text-center py-8 border-2 border-dashed rounded-lg">
                No questions added yet. Add your first question above.
              </p>
            ) : (
              questions.map((q, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">{idx + 1}.</span>
                        <span className="font-medium">{q.question}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {q.points || 1} pt{q.points !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {q.options.map((opt, i) => (
                          <p key={i} className={String.fromCharCode(65 + i) === q.correctAnswer ? "text-green-600 font-semibold" : "text-gray-700"}>
                            {String.fromCharCode(65 + i)}. {opt}
                            {String.fromCharCode(65 + i) === q.correctAnswer && " ✓"}
                          </p>
                        ))}
                      </div>
                      {q.rationale && (
                        <p className="text-sm text-gray-600 mt-2 ml-6 bg-gray-50 p-2 rounded">
                          💡 {q.rationale}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditQuestion(idx)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded transition"
                        title="Edit Question"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => removeQuestion(idx)}
                        className="text-red-600 hover:text-red-800 p-2 rounded transition"
                        title="Delete Question"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">
            Cancel
          </button>
          <button
            onClick={saveQuiz}
            disabled={loading || questions.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : `Save Quiz (${questions.length} questions)`}
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

  const handleUpload = async () => {
    if (!form.title || (!file && !editingId && form.type !== "quiz")) {
      return alert("Please fill all required fields");
    }

    if (form.linkType === "subject" && !form.subjectId) {
      return alert("Please select a subject");
    }
    
    if (form.linkType === "course" && !form.courseId) {
      return alert("Please select a course");
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("type", form.type);
    if (file && form.type !== "quiz") formData.append("file", file);
    if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

    if (form.linkType === "subject") {
      formData.append("subjectId", form.subjectId);
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
      let res;
      if (editingId) {
        res = await axios.put(`/content/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setContents((prev) => prev.map((c) => (c._id === editingId ? res.data : c)));
        alert("✅ Content updated");
      } else {
        res = await axios.post("/content/upload", formData);
        setContents((prev) => [res.data, ...prev]);
        alert("✅ Uploaded successfully");
      }

      // If this is a quiz content, open the quiz editor
      if (form.type === "quiz" && res.data) {
        setSelectedLesson(res.data);
        setShowQuizEditor(true);
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
      console.error("Upload error:", err);
      alert("Operation failed: " + (err.response?.data?.message || err.message));
    }
  };

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

  const openViewer = (c) => {
    if (c.type === "quiz") {
      // For quiz content, open the quiz editor instead of viewer
      setSelectedLesson(c);
      setShowQuizEditor(true);
      return;
    }
    setViewer({
      open: true,
      type: c.type,
      url: c.fileUrl,
      title: c.title,
    });
  };

  const closeViewer = () => {
    setViewer({ open: false, type: "", url: "", title: "" });
  };

  const openQuizEditor = (lesson) => {
    setSelectedLesson(lesson);
    setShowQuizEditor(true);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "video": return <FaPlayCircle className="text-blue-500" />;
      case "pdf": return <FaFilePdf className="text-red-500" />;
      case "quiz": return <FaQuestionCircle className="text-purple-500" />;
      default: return <FaPlayCircle />;
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          {editingId ? "✏️ Edit Content" : "📤 Upload Learning Content"}
        </h2>

        <div className="bg-white p-8 rounded-2xl shadow-md space-y-6 border">
          <div>
            <label className="block text-sm font-semibold mb-1">Title</label>
            <input
              placeholder="Enter content title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="p-3 border rounded-lg"
            >
              <option value="video">🎥 Video</option>
              <option value="image">🖼 Image</option>
              <option value="pdf">📄 PDF</option>
              <option value="quiz">📝 Quiz (Standalone)</option>
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

          {form.type !== "quiz" && (
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
          )}

          {form.type === "quiz" && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-purple-700 text-sm flex items-center gap-2">
                <FaQuestionCircle /> After creating the quiz content, you'll be able to add questions, set timer, and configure pass mark.
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            className={`w-full py-3 rounded-xl text-white font-semibold transition ${
              editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {editingId ? "Update Content" : "Upload Content"}
          </button>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">📚 Uploaded Content</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden border group cursor-pointer"
                onClick={() => openViewer(c)}
              >
                <div className="relative h-40 w-full bg-gray-100">
                  {c.type === "quiz" ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex flex-col items-center justify-center">
                      <FaQuestionCircle className="text-purple-500 text-6xl mb-2" />
                      <span className="text-purple-700 font-semibold">Quiz Content</span>
                    </div>
                  ) : (
                    <img
                      src={c.thumbnailUrl || "/placeholder.jpg"}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      alt={c.title}
                      onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                    />
                  )}

                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    {getTypeIcon(c.type)}
                    <span>{c.type === "quiz" ? "📝 Quiz" : c.type === "video" ? "🎥 Video" : c.type === "pdf" ? "📄 PDF" : "🖼 Image"}</span>
                  </div>

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
                    <FaPlus /> {c.type === "quiz" ? "Edit Quiz" : "Add Quiz"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {viewer.open && viewer.type !== "quiz" && (
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

      {showQuizEditor && selectedLesson && (
        <StandaloneQuizEditor
          content={selectedLesson}
          onClose={() => {
            setShowQuizEditor(false);
            setSelectedLesson(null);
          }}
          onSave={() => {
            console.log("Quiz saved for:", selectedLesson.title);
            fetchContents();
          }}
        />
      )}
    </>
  );
};

export default AdminContent;