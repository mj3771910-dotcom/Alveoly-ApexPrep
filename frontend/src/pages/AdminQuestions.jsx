import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import axios from "../api/axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(BASE_URL);

const AdminQuestions = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [filter, setFilter] = useState({ courseId: "", subjectId: "" });
  const [questionForms, setQuestionForms] = useState([
    {
      courseId: "",
      subjectId: "",
      type: "trial",
      examTime: "",
      isExamLocked: false,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      rationale: "",
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const examTimes = Array.from({ length: 14 }, (_, i) => (i + 1) * 15);

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchCourses();
    fetchSubjects();
    fetchQuestions();

    socket.on("question:created", (q) =>
      setQuestions((prev) => [q, ...prev])
    );

    socket.on("question:updated", (q) =>
      setQuestions((prev) =>
        prev.map((item) => (item._id === q._id ? q : item))
      )
    );

    socket.on("question:deleted", (_id) =>
      setQuestions((prev) => prev.filter((q) => q._id !== _id))
    );

    return () => {
      socket.off("question:created");
      socket.off("question:updated");
      socket.off("question:deleted");
    };
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async (courseId = "") => {
    try {
      let url = "/subjects";

      if (courseId) {
        url = `/subjects?course=${courseId}`;
      }

      const res = await axios.get(url);
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= HANDLERS =================
  const handleFormChange = (index, field, value) => {
    const updated = [...questionForms];
    updated[index][field] = value;
    setQuestionForms(updated);
  };

  // ✅ NEW: FIX COURSE CHANGE (DO NOT REMOVE ANYTHING)
  const handleCourseChange = (index, courseId) => {
    const updated = [...questionForms];

    updated[index].courseId = courseId; // ✅ FIX
    updated[index].subjectId = ""; // reset subject

    setQuestionForms(updated);

    fetchSubjects(courseId); // ✅ fetch from backend
  };

  const handleOptionChange = (index, qIndex, value) => {
    const updated = [...questionForms];
    updated[qIndex].options[index] = value;
    setQuestionForms(updated);
  };

  const addQuestionForm = () => {
    setQuestionForms([
      ...questionForms,
      {
        courseId: questionForms[0].courseId,
        subjectId: questionForms[0].subjectId,
        type: "trial",
        examTime: "",
        isExamLocked: false,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        rationale: "",
      },
    ]);
  };

  const removeQuestionForm = (index) => {
    if (questionForms.length === 1) return;
    const updated = [...questionForms];
    updated.splice(index, 1);
    setQuestionForms(updated);
  };

  const handleAddQuestions = async () => {
    try {
      setLoading(true);

      if (editingId) {
        await axios.put(`/questions/${editingId}`, questionForms[0]);
      } else {
        await axios.post("/questions/bulk", { questions: questionForms });
      }

      setQuestionForms([
        {
          courseId: "",
          subjectId: "",
          type: "trial",
          examTime: "",
          isExamLocked: false,
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          rationale: "",
        },
      ]);
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    setEditingId(q._id);
    setQuestionForms([q]);
  };

  const handleDelete = async (_id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(`/questions/${_id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== _id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete question. Try again.");
    }
  };

  const filteredSubjects = (courseId) =>
    subjects.filter((s) => s.courseId.toString() === courseId);

  const filteredQuestions = questions.filter(
    (q) =>
      (!filter.courseId || q.courseId === filter.courseId) &&
      (!filter.subjectId || q.subjectId === filter.subjectId)
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Questions</h2>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-2 gap-4">
        <select
          onChange={(e) => setFilter({ ...filter, courseId: e.target.value })}
          value={filter.courseId}
          className="p-3 border rounded"
        >
          <option value="">Filter by Course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setFilter({ ...filter, subjectId: e.target.value })}
          value={filter.subjectId}
          className="p-3 border rounded"
        >
          <option value="">Filter by Subject</option>
          {filter.courseId &&
            filteredSubjects(filter.courseId).map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} {s.isPaid ? "(Paid)" : "(Free)"}
              </option>
            ))}
        </select>
      </div>

      {/* QUESTION FORMS */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-6">
        {questionForms.map((form, index) => (
          <div key={index} className="border p-4 rounded-lg relative">
            {questionForms.length > 1 && (
              <FaTimes
                className="absolute top-2 right-2 cursor-pointer text-red-600"
                onClick={() => removeQuestionForm(index)}
              />
            )}

            <h3 className="font-semibold mb-4 flex items-center gap-2">
              {editingId ? (
                <>
                  <FaEdit /> Edit Question
                </>
              ) : (
                <>
                  <FaPlus /> Question {index + 1}
                </>
              )}
            </h3>

            {/* COURSE */}
            <select
              value={form.courseId}
              onChange={(e) => handleCourseChange(index, e.target.value)}
              className="p-3 border rounded w-full mb-3"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* SUBJECT */}
            <select
              value={form.subjectId}
              onChange={(e) =>
                handleFormChange(index, "subjectId", e.target.value)
              }
              className="w-full p-3 border rounded mb-3"
            >
              <option value="">Select Subject</option>
              {form.courseId &&
                filteredSubjects(form.courseId).map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.isPaid ? "(Paid)" : "(Free)"}
                  </option>
                ))}
            </select>

            {/* TYPE */}
            <select
              value={form.type}
              onChange={(e) =>
                handleFormChange(index, "type", e.target.value)
              }
              className="w-full p-3 border rounded mb-3"
            >
              <option value="trial">Trial Test</option>
              <option value="exam">Exam</option>
            </select>

            {/* EXAM SETTINGS */}
            {form.type === "exam" && (
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <select
                  value={form.examTime}
                  onChange={(e) =>
                    handleFormChange(index, "examTime", e.target.value)
                  }
                  className="p-3 border rounded"
                >
                  <option value="">Select Time</option>
                  {examTimes.map((t) => (
                    <option key={t} value={t}>
                      {t} mins
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isExamLocked}
                    onChange={(e) =>
                      handleFormChange(
                        index,
                        "isExamLocked",
                        e.target.checked
                      )
                    }
                  />
                  Lock Exam
                </label>
              </div>
            )}

            {/* QUESTION TEXT */}
            <textarea
              value={form.question}
              onChange={(e) =>
                handleFormChange(index, "question", e.target.value)
              }
              placeholder="Enter question"
              className="w-full p-3 border rounded mb-4"
            />

            {/* OPTIONS */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {form.options.map((opt, i) => (
                <input
                  key={i}
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(i, index, e.target.value)
                  }
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="p-3 border rounded"
                />
              ))}
            </div>

            {/* ANSWER */}
            <select
              value={form.correctAnswer}
              onChange={(e) =>
                handleFormChange(index, "correctAnswer", e.target.value)
              }
              className="w-full p-3 border rounded mb-4"
            >
              <option value="">Correct Answer</option>
              {["A", "B", "C", "D"].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* RATIONALE */}
            <textarea
              value={form.rationale}
              onChange={(e) =>
                handleFormChange(index, "rationale", e.target.value)
              }
              placeholder="Enter rationale"
              className="w-full p-3 border rounded mb-4"
            />
          </div>
        ))}

        {!editingId && (
          <button
            onClick={addQuestionForm}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mb-4"
          >
            Add Another Question
          </button>
        )}

        <button
          onClick={handleAddQuestions}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {loading
            ? "Processing..."
            : editingId
            ? "Save Changes"
            : "Submit All Questions"}
        </button>
      </div>

      {/* QUESTIONS LIST */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        {filteredQuestions.map((q) => (
          <div key={q._id} className="border p-4 rounded-lg">
            <div className="flex justify-between">
              <h4 className="font-semibold">{q.question}</h4>
              <div className="flex gap-3">
                <FaEdit
                  className="cursor-pointer text-blue-600"
                  onClick={() => handleEdit(q)}
                />
                <FaTrash
                  className="cursor-pointer text-red-600"
                  onClick={() => handleDelete(q._id)}
                />
              </div>
            </div>

            <p className="text-sm text-gray-500">
              {q.courseName} → {q.subjectName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQuestions;