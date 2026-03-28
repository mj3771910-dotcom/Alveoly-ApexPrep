import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import axios from "../api/axios";

const socket = io("https://alveoly-apexprep-backend.onrender.com");

const AdminQuestions = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [filter, setFilter] = useState({ courseId: "", subjectId: "" });

  const defaultForm = {
    courseId: "",
    subjectId: "",
    type: "trial",
    examTime: "",
    isExamLocked: false,
    question: "",
    options: ["", ""], // ✅ dynamic start
    correctAnswer: "",
    rationale: "",
  };

  const [questionForms, setQuestionForms] = useState([defaultForm]);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const examTimes = Array.from({ length: 14 }, (_, i) => (i + 1) * 15);

  // ================= FETCH =================
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
      if (courseId) url = `/subjects?course=${courseId}`;
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

  const handleCourseChange = (index, courseId) => {
    const updated = [...questionForms];
    updated[index].courseId = courseId;
    updated[index].subjectId = "";
    setQuestionForms(updated);
    fetchSubjects(courseId);
  };

  const handleOptionChange = (optIndex, qIndex, value) => {
    const updated = [...questionForms];
    updated[qIndex].options[optIndex] = value;
    setQuestionForms(updated);
  };

  // ✅ ADD OPTION
  const addOption = (qIndex) => {
    const updated = [...questionForms];
    updated[qIndex].options.push("");
    setQuestionForms(updated);
  };

  // ✅ REMOVE OPTION
  const removeOption = (qIndex, optIndex) => {
    const updated = [...questionForms];
    if (updated[qIndex].options.length <= 2) return; // minimum 2
    updated[qIndex].options.splice(optIndex, 1);
    setQuestionForms(updated);
  };

  const addQuestionForm = () => {
    setQuestionForms([
      ...questionForms,
      { ...defaultForm, courseId: questionForms[0].courseId },
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

      setQuestionForms([defaultForm]);
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
    <div className="w-full min-w-0">
      <h2 className="text-2xl font-bold mb-6">Manage Questions</h2>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          onChange={(e) => setFilter({ ...filter, courseId: e.target.value })}
          value={filter.courseId}
          className="w-full min-w-0 p-3 border rounded"
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
          className="w-full min-w-0 p-3 border rounded"
        >
          <option value="">Filter by Subject</option>
          {filter.courseId &&
            filteredSubjects(filter.courseId).map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
        </select>
      </div>

      {/* FORMS */}
      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        {questionForms.map((form, index) => (
          <div key={index} className="border p-4 rounded-lg relative w-full">

            {questionForms.length > 1 && (
              <FaTimes
                className="absolute top-3 right-3 text-red-600 cursor-pointer"
                onClick={() => removeQuestionForm(index)}
              />
            )}

            <textarea
              value={form.question}
              onChange={(e) =>
                handleFormChange(index, "question", e.target.value)
              }
              placeholder="Enter question"
              className="w-full min-w-0 p-3 border rounded mb-4"
            />

            {/* OPTIONS */}
            <div className="space-y-3 mb-4">
              {form.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(i, index, e.target.value)
                    }
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 min-w-0 p-3 border rounded"
                  />

                  <button
                    onClick={() => removeOption(index, i)}
                    className="bg-red-500 text-white px-3 rounded"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addOption(index)}
              className="bg-gray-200 px-4 py-2 rounded mb-4"
            >
              + Add Option
            </button>

            {/* ANSWER */}
            <select
              value={form.correctAnswer}
              onChange={(e) =>
                handleFormChange(index, "correctAnswer", e.target.value)
              }
              className="w-full min-w-0 p-3 border rounded mb-4"
            >
              <option value="">Correct Answer</option>
              {form.options.map((_, i) => (
                <option key={i} value={String.fromCharCode(65 + i)}>
                  {String.fromCharCode(65 + i)}
                </option>
              ))}
            </select>

            <textarea
              value={form.rationale}
              onChange={(e) =>
                handleFormChange(index, "rationale", e.target.value)
              }
              placeholder="Rationale"
              className="w-full min-w-0 p-3 border rounded"
            />
          </div>
        ))}

        <button
          onClick={addQuestionForm}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Add Question
        </button>

        <button
          onClick={handleAddQuestions}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow mt-6 space-y-4">
        {filteredQuestions.map((q) => (
          <div key={q._id} className="border p-4 rounded-lg">
            <div className="flex justify-between">
              <h4 className="font-semibold break-words">{q.question}</h4>
              <div className="flex gap-3">
                <FaEdit onClick={() => handleEdit(q)} />
                <FaTrash onClick={() => handleDelete(q._id)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQuestions;