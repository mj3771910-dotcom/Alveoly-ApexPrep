import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import axios from "../api/axios";

const socket = io("https://alveoly-apexprep-eqmi.onrender.com");

const AdminQuestions = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState({ courseId: "", subjectId: "" });

  // Wizard State
  const [step, setStep] = useState(1); // 1: Config, 2: Questions, 3: Review
  const [config, setConfig] = useState({
    courseId: "",
    subjectId: "",
    type: "exam",
    examTime: "",
    isExamLocked: false,
  });

  // Questions State
  const [questionList, setQuestionList] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Current question form
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", ""],
    correctAnswer: "",
    rationale: "",
  });

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

  const filteredSubjects = (courseId) =>
    subjects.filter((s) => s.courseId.toString() === courseId);

  // Handle config changes
  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value });
    if (field === "courseId") {
      setConfig({ ...config, courseId: value, subjectId: "" });
      fetchSubjects(value);
    }
  };

  // Question management
  const handleQuestionChange = (field, value) => {
    setCurrentQuestion({ ...currentQuestion, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""],
    });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) return;
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions, correctAnswer: "" });
  };

  const addOrUpdateQuestion = () => {
    // Validate
    if (!currentQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert("Please fill all options");
      return;
    }
    if (!currentQuestion.correctAnswer) {
      alert("Please select the correct answer");
      return;
    }

    if (editingQuestionId !== null) {
      // Update existing question
      const updatedList = questionList.map(q =>
        q.tempId === editingQuestionId
          ? { ...currentQuestion, tempId: editingQuestionId }
          : q
      );
      setQuestionList(updatedList);
      setEditingQuestionId(null);
    } else {
      // Add new question
      setQuestionList([
        ...questionList,
        { ...currentQuestion, tempId: Date.now() },
      ]);
    }

    // Reset form
    setCurrentQuestion({
      question: "",
      options: ["", ""],
      correctAnswer: "",
      rationale: "",
    });
  };

  const editQuestion = (index) => {
    setCurrentQuestion(questionList[index]);
    setEditingQuestionId(questionList[index].tempId);
    setCurrentQuestionIndex(index);
  };

  const deleteQuestion = (index) => {
    if (window.confirm("Delete this question?")) {
      const newList = questionList.filter((_, i) => i !== index);
      setQuestionList(newList);
      if (currentQuestionIndex >= newList.length) {
        setCurrentQuestionIndex(Math.max(0, newList.length - 1));
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questionList.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAll = async () => {
    if (questionList.length === 0) {
      alert("Please add at least one question");
      return;
    }

    setLoading(true);
    try {
      const questionsToSubmit = questionList.map(q => ({
        courseId: config.courseId,
        subjectId: config.subjectId,
        type: config.type,
        examTime: config.type === "exam" ? config.examTime : "",
        isExamLocked: config.type === "exam" ? config.isExamLocked : false,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale,
      }));

      await axios.post("/questions/bulk", { questions: questionsToSubmit });

      alert(`Successfully added ${questionList.length} questions!`);
      
      // Reset everything
      setQuestionList([]);
      setStep(1);
      setConfig({
        courseId: "",
        subjectId: "",
        type: "exam",
        examTime: "",
        isExamLocked: false,
      });
      setCurrentQuestion({
        question: "",
        options: ["", ""],
        correctAnswer: "",
        rationale: "",
      });
      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Failed to submit questions");
    } finally {
      setLoading(false);
    }
  };

  const handleEditExisting = (q) => {
    // Load question into wizard for editing
    setConfig({
      courseId: q.courseId,
      subjectId: q.subjectId,
      type: q.type,
      examTime: q.examTime || "",
      isExamLocked: q.isExamLocked || false,
    });
    setQuestionList([{
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      rationale: q.rationale,
      tempId: q._id,
      _id: q._id
    }]);
    setEditingQuestionId(q._id);
    setCurrentQuestion({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      rationale: q.rationale,
    });
    setStep(2);
  };

  const handleDeleteExisting = async (_id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(`/questions/${_id}`);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

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

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={filter.courseId}
          onChange={(e) =>
            setFilter({ ...filter, courseId: e.target.value, subjectId: "" })
          }
          className="w-full p-3 border rounded"
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
          className="w-full p-3 border rounded"
        >
          <option value="">Filter by Subject</option>
          {filter.courseId &&
            filteredSubjects(filter.courseId).map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
        </select>

        <button
          onClick={() => {
            setStep(1);
            setConfig({
              courseId: "",
              subjectId: "",
              type: "exam",
              examTime: "",
              isExamLocked: false,
            });
            setQuestionList([]);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New Questions
        </button>
      </div>

      {/* Wizard Steps */}
      {(step === 1 || step === 2 || step === 3) && (
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="border-b p-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className={`flex items-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                    1
                  </div>
                  <span className="ml-2">Configure</span>
                </div>
                <div className={`flex items-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                    2
                  </div>
                  <span className="ml-2">Add Questions</span>
                </div>
                <div className={`flex items-center ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                    3
                  </div>
                  <span className="ml-2">Review & Submit</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Configuration */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Exam Configuration</h3>
                
                <select
                  value={config.courseId}
                  onChange={(e) => handleConfigChange("courseId", e.target.value)}
                  className="w-full p-3 border rounded"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={config.subjectId}
                  onChange={(e) => handleConfigChange("subjectId", e.target.value)}
                  className="w-full p-3 border rounded"
                  disabled={!config.courseId}
                  required
                >
                  <option value="">Select Subject</option>
                  {config.courseId &&
                    filteredSubjects(config.courseId).map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                </select>

                <select
                  value={config.type}
                  onChange={(e) => handleConfigChange("type", e.target.value)}
                  className="w-full p-3 border rounded"
                >
                  <option value="trial">Trial (Practice)</option>
                  <option value="exam">Exam (Timed)</option>
                </select>

                {config.type === "exam" && (
                  <>
                    <select
                      value={config.examTime}
                      onChange={(e) => handleConfigChange("examTime", e.target.value)}
                      className="w-full p-3 border rounded"
                    >
                      <option value="">Select Exam Duration (minutes)</option>
                      {examTimes.map((t) => (
                        <option key={t} value={t}>
                          {t} minutes
                        </option>
                      ))}
                    </select>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.isExamLocked}
                        onChange={(e) =>
                          handleConfigChange("isExamLocked", e.target.checked)
                        }
                      />
                      Lock Exam (prevent retake)
                    </label>
                  </>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      if (!config.courseId || !config.subjectId) {
                        alert("Please select course and subject");
                        return;
                      }
                      if (config.type === "exam" && !config.examTime) {
                        alert("Please select exam duration");
                        return;
                      }
                      setStep(2);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Next: Add Questions →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Add Questions */}
            {step === 2 && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Question {questionList.length + 1}
                  </h3>
                  <div className="text-sm text-gray-600">
                    Total: {questionList.length} questions added
                  </div>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => handleQuestionChange("question", e.target.value)}
                    placeholder="Enter question"
                    className="w-full p-3 border rounded"
                    rows="3"
                  />

                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          className="flex-1 p-3 border rounded"
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        />
                        <button
                          onClick={() => removeOption(i)}
                          className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addOption}
                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    + Add Option
                  </button>

                  <select
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => handleQuestionChange("correctAnswer", e.target.value)}
                    className="w-full p-3 border rounded"
                  >
                    <option value="">Select Correct Answer</option>
                    {currentQuestion.options.map((_, i) => (
                      <option key={i} value={String.fromCharCode(65 + i)}>
                        {String.fromCharCode(65 + i)}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={currentQuestion.rationale}
                    onChange={(e) => handleQuestionChange("rationale", e.target.value)}
                    placeholder="Rationale (explanation for correct answer)"
                    className="w-full p-3 border rounded"
                    rows="2"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={addOrUpdateQuestion}
                      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                      {editingQuestionId !== null ? "Update Question" : "Add Question"}
                    </button>
                    
                    {editingQuestionId !== null && (
                      <button
                        onClick={() => {
                          setEditingQuestionId(null);
                          setCurrentQuestion({
                            question: "",
                            options: ["", ""],
                            correctAnswer: "",
                            rationale: "",
                          });
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Question List Preview */}
                {questionList.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold mb-3">Added Questions ({questionList.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {questionList.map((q, idx) => (
                        <div key={idx} className="border p-3 rounded flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-bold mr-2">{idx + 1}.</span>
                            {q.question.substring(0, 100)}...
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => editQuestion(idx)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteQuestion(idx)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6 pt-4 border-t">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      if (questionList.length === 0) {
                        alert("Please add at least one question");
                        return;
                      }
                      setStep(3);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Review & Submit →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Review Questions</h3>
                
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <p><strong>Course:</strong> {courses.find(c => c._id === config.courseId)?.name}</p>
                  <p><strong>Subject:</strong> {subjects.find(s => s._id === config.subjectId)?.name}</p>
                  <p><strong>Type:</strong> {config.type === "exam" ? "Exam" : "Trial"}</p>
                  {config.type === "exam" && (
                    <>
                      <p><strong>Duration:</strong> {config.examTime} minutes</p>
                      <p><strong>Locked:</strong> {config.isExamLocked ? "Yes" : "No"}</p>
                    </>
                  )}
                  <p><strong>Total Questions:</strong> {questionList.length}</p>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questionList.map((q, idx) => (
                    <div key={idx} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">
                            {idx + 1}. {q.question}
                          </h4>
                          <div className="space-y-1 ml-4">
                            {q.options.map((opt, i) => (
                              <p key={i} className={String.fromCharCode(65 + i) === q.correctAnswer ? "text-green-600 font-semibold" : ""}>
                                {String.fromCharCode(65 + i)}. {opt}
                                {String.fromCharCode(65 + i) === q.correctAnswer && " ✓"}
                              </p>
                            ))}
                          </div>
                          {q.rationale && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Rationale:</strong> {q.rationale}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setStep(2);
                            editQuestion(idx);
                          }}
                          className="text-blue-600 ml-4"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    onClick={handleSubmitAll}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : `Submit ${questionList.length} Questions`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing Questions List */}
      <div className="bg-white p-6 rounded-xl shadow mt-6">
        <h3 className="font-bold text-lg mb-4">Existing Questions</h3>
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div key={q._id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold break-words">{q.question}</h4>
                  <div className="text-sm text-gray-500 mt-1">
                    Type: {q.type} | Subject: {subjects.find(s => s._id === q.subjectId)?.name || "N/A"}
                    {q.type === "exam" && q.examTime && ` | Timer: ${q.examTime}min`}
                  </div>
                </div>
                <div className="flex gap-3 ml-4">
                  <button onClick={() => handleEditExisting(q)} className="text-blue-600">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteExisting(q._id)} className="text-red-600">
                    <FaTrash />
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

export default AdminQuestions;