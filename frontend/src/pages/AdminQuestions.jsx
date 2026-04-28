import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import axios from "../api/axios";

const socket = io("https://alveoly-apexprep-eqmi.onrender.com");

const AdminQuestions = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [filter, setFilter] = useState({ courseId: "", subjectId: "" });
  
  // NEW: Exam settings for the entire subject
  const [examSettings, setExamSettings] = useState({
    courseId: "",
    subjectId: "",
    examTime: "",
    isExamLocked: false,
  });
  const [showExamSettings, setShowExamSettings] = useState(false);

  const defaultForm = {
    courseId: "",
    subjectId: "",
    type: "trial",
    question: "",
    options: ["", ""],
    correctAnswer: "",
    rationale: "",
  };

  const [questionForms, setQuestionForms] = useState([defaultForm]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const examTimes = Array.from({ length: 14 }, (_, i) => (i + 1) * 15);

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

  const addOption = (qIndex) => {
    const updated = [...questionForms];
    updated[qIndex].options.push("");
    setQuestionForms(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questionForms];
    if (updated[qIndex].options.length <= 2) return;
    updated[qIndex].options.splice(optIndex, 1);
    updated[qIndex].correctAnswer = "";
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

      const questionsToSubmit = questionForms.map(q => ({
        ...q,
        // If it's an exam question, use the exam settings from the subject
        examTime: q.type === "exam" && examSettings.subjectId === q.subjectId 
          ? examSettings.examTime 
          : "",
        isExamLocked: q.type === "exam" && examSettings.subjectId === q.subjectId
          ? examSettings.isExamLocked
          : false,
      }));

      if (editingId) {
        await axios.put(`/questions/${editingId}`, questionsToSubmit[0]);
      } else {
        await axios.post("/questions/bulk", { questions: questionsToSubmit });
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
    // Load exam settings for this subject
    if (q.type === "exam") {
      setExamSettings({
        courseId: q.courseId,
        subjectId: q.subjectId,
        examTime: q.examTime,
        isExamLocked: q.isExamLocked,
      });
      setShowExamSettings(true);
    }
  };

  const handleDelete = async (_id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(`/questions/${_id}`);
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
    <div className="w-full min-w-0 p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6">
        Manage Questions
      </h2>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={filter.courseId}
          onChange={(e) =>
            setFilter({ ...filter, courseId: e.target.value })
          }
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
          value={filter.subjectId}
          onChange={(e) =>
            setFilter({ ...filter, subjectId: e.target.value })
          }
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

      {/* EXAM SETTINGS SECTION - New */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6">
        <button
          onClick={() => setShowExamSettings(!showExamSettings)}
          className="bg-purple-600 text-white px-4 py-2 rounded mb-4"
        >
          {showExamSettings ? "Hide Exam Settings" : "Configure Exam Settings"}
        </button>
        
        {showExamSettings && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg">Exam Configuration for Subject</h3>
            
            <select
              value={examSettings.courseId}
              onChange={(e) => {
                setExamSettings({ ...examSettings, courseId: e.target.value, subjectId: "" });
                fetchSubjects(e.target.value);
              }}
              className="w-full p-3 border rounded"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={examSettings.subjectId}
              onChange={(e) => setExamSettings({ ...examSettings, subjectId: e.target.value })}
              className="w-full p-3 border rounded"
            >
              <option value="">Select Subject</option>
              {examSettings.courseId &&
                filteredSubjects(examSettings.courseId).map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>

            {examSettings.subjectId && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={examSettings.examTime}
                    onChange={(e) =>
                      setExamSettings({ ...examSettings, examTime: e.target.value })
                    }
                    className="p-3 border rounded"
                  >
                    <option value="">Select Exam Duration</option>
                    {examTimes.map((t) => (
                      <option key={t} value={t}>
                        {t} minutes
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={examSettings.isExamLocked}
                      onChange={(e) =>
                        setExamSettings({ ...examSettings, isExamLocked: e.target.checked })
                      }
                    />
                    Lock Exam (prevent retake)
                  </label>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                  ⚠️ These settings will apply to ALL exam questions under this subject
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* QUESTION FORMS */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow space-y-6">
        {questionForms.map((form, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg relative space-y-4"
          >
            {questionForms.length > 1 && (
              <FaTimes
                className="absolute top-3 right-3 text-red-600 cursor-pointer"
                onClick={() => removeQuestionForm(index)}
              />
            )}

            {/* COURSE */}
            <select
              value={form.courseId}
              onChange={(e) =>
                handleCourseChange(index, e.target.value)
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

            {/* SUBJECT */}
            <select
              value={form.subjectId}
              onChange={(e) =>
                handleFormChange(index, "subjectId", e.target.value)
              }
              className="w-full p-3 border rounded"
            >
              <option value="">Select Subject</option>
              {form.courseId &&
                filteredSubjects(form.courseId).map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>

            {/* TYPE */}
            <select
              value={form.type}
              onChange={(e) =>
                handleFormChange(index, "type", e.target.value)
              }
              className="w-full p-3 border rounded"
            >
              <option value="trial">Trial</option>
              <option value="exam">Exam</option>
            </select>

            {/* Display exam info if available */}
            {form.type === "exam" && examSettings.subjectId === form.subjectId && examSettings.examTime && (
              <div className="bg-blue-50 p-3 rounded text-sm">
                📋 Exam Timer: {examSettings.examTime} minutes {examSettings.isExamLocked && "🔒 Locked"}
              </div>
            )}

            {/* QUESTION */}
            <textarea
              value={form.question}
              onChange={(e) =>
                handleFormChange(index, "question", e.target.value)
              }
              placeholder="Enter question"
              className="w-full p-3 border rounded"
            />

            {/* OPTIONS */}
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(i, index, e.target.value)
                    }
                    className="flex-1 p-3 border rounded"
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
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
              className="bg-gray-200 px-4 py-2 rounded"
            >
              + Add Option
            </button>

            {/* ANSWER */}
            <select
              value={form.correctAnswer}
              onChange={(e) =>
                handleFormChange(index, "correctAnswer", e.target.value)
              }
              className="w-full p-3 border rounded"
            >
              <option value="">Correct Answer</option>
              {form.options.map((_, i) => (
                <option key={i} value={String.fromCharCode(65 + i)}>
                  {String.fromCharCode(65 + i)}
                </option>
              ))}
            </select>

            {/* RATIONALE */}
            <textarea
              value={form.rationale}
              onChange={(e) =>
                handleFormChange(index, "rationale", e.target.value)
              }
              placeholder="Rationale"
              className="w-full p-3 border rounded"
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

      {/* QUESTION LIST */}
      <div className="bg-white p-6 rounded-xl shadow mt-6 space-y-4">
        <h3 className="font-bold text-lg mb-4">Existing Questions</h3>
        {filteredQuestions.map((q) => (
          <div key={q._id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold break-words">{q.question}</h4>
                <div className="text-sm text-gray-500 mt-1">
                  Type: {q.type} | 
                  {q.type === "exam" && q.examTime && ` Timer: ${q.examTime}min`}
                </div>
              </div>
              <div className="flex gap-3 ml-4">
                <FaEdit onClick={() => handleEdit(q)} className="cursor-pointer text-blue-600" />
                <FaTrash onClick={() => handleDelete(q._id)} className="cursor-pointer text-red-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQuestions;