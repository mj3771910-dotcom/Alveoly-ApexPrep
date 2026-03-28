import { useEffect, useState } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import socket from "../api/socket";
import { useAuth } from "../context/AuthContext";
import {
  FaLock,
  FaCheckCircle,
  FaPlay,
  FaBookOpen,
} from "react-icons/fa";

const StudentSubjects = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [courseId, setCourseId] = useState(null);

  const [payments, setPayments] = useState([]);
  const [now, setNow] = useState(new Date());
  const [manualAccess, setManualAccess] = useState([]);

  // ================= LIVE TIMER =================
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const fetchManualAccess = async () => {
    try {
      const res = await axios.get("/manual-access/mine");
      setManualAccess(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchManualAccess();
}, []);

  // ================= GET COURSE =================
  useEffect(() => {
    const courseFromUrl = new URLSearchParams(search).get("course");

    if (courseFromUrl) return setCourseId(courseFromUrl);

    if (user?.courseId) {
      if (typeof user.courseId === "string") {
        setCourseId(user.courseId);
      } else if (user.courseId._id) {
        setCourseId(user.courseId._id);
      }
    }
  }, [user, search]);

  // ================= FETCH PAYMENTS =================
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("/payments/mine");
        setPayments(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPayments();
  }, []);

  // ================= ACCESS LOGIC =================
  const hasActivePlan = () => {
    return payments.some(
      (p) =>
        p.status === "success" &&
        p.planId &&
        p.expiresAt &&
        new Date(p.expiresAt) > now
    );
  };

 const isSubjectUnlocked = (subject) => {
  if (!subject.isPaid) return true;

  if (hasActivePlan()) return true;

  // existing payment logic
  const subjectPayment = payments.find(
    (p) =>
      p.status === "success" &&
      p.subject === subject.name
  );

  // 🔥 NEW: manual access
  const manual = manualAccess.find(
    (m) => m.subjectId === subject._id
  );

  return !!subjectPayment || !!manual;
};

  // ================= FETCH SUBJECTS =================
  useEffect(() => {
    if (!courseId) {
      setFetching(false);
      return;
    }

    const fetchSubjects = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`/subjects?course=${courseId}`);
        setSubjects(res.data || []);
      } catch (err) {
        console.error(err);
        setSubjects([]);
      } finally {
        setFetching(false);
      }
    };

    fetchSubjects();

    socket.on("subject:created", (subj) => {
      if (subj.courseId?.toString() === courseId) {
        setSubjects((prev) => [subj, ...prev]);
      }
    });

    socket.on("subject:updated", (subj) => {
      setSubjects((prev) =>
        prev.map((s) => (s._id === subj._id ? subj : s))
      );
    });

    socket.on("subject:deleted", (_id) => {
      setSubjects((prev) => prev.filter((s) => s._id !== _id));
    });

    return () => {
      socket.off("subject:created");
      socket.off("subject:updated");
      socket.off("subject:deleted");
    };
  }, [courseId]);

  // ================= PAYMENT =================
  const handleUnlock = async (subject) => {
    try {
      setLoading(true);

      const res = await axios.post("/payments/initiate", {
        subjectId: subject._id,
      });

      if (res.data?.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-2">Your Subjects</h2>

      {user?.courseId?.name && (
        <p className="text-gray-500 mb-6">
          Course: {user.courseId.name}
        </p>
      )}

      {fetching ? (
        <p>Loading subjects...</p>
      ) : subjects.length === 0 ? (
        <p>No subjects available</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {subjects.map((subj) => {
            const unlocked = isSubjectUnlocked(subj);

            return (
              <div
                key={subj._id}
                className={`relative rounded-2xl p-6 shadow transition
                ${
                  unlocked
                    ? "bg-white hover:shadow-xl"
                    : "bg-gray-100"
                }`}
              >
                {/* LOCK OVERLAY */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col justify-center items-center rounded-2xl">
                    <FaLock className="text-2xl text-gray-700 mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      Locked Content
                    </p>

                    <button
                      onClick={() => handleUnlock(subj)}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Unlock ₵{subj.price}
                    </button>

                    <button
                      onClick={() => navigate("/student/plans")}
                      className="mt-2 text-xs text-blue-600 underline"
                    >
                      Or get full access plan
                    </button>
                  </div>
                )}

                {/* CONTENT */}
                <h3 className="text-lg font-bold text-blue-600 mb-3">
                  {subj.name}
                </h3>

                {unlocked && (
                  <>
                    <div className="grid grid-cols-3 gap-3 mt-4">

  <button
    onClick={() =>
      navigate(`/student/lessons/${subj._id}`)
    }
    className="bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-700"
  >
    <FaBookOpen /> Lessons
  </button>

  <button
    onClick={() =>
      navigate(`/student/exams/${courseId}/${subj._id}`)
    }
    className="bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-green-700"
  >
    <FaPlay /> Exam
  </button>

  <button
    onClick={() =>
      navigate(`/student/trial/${courseId}/${subj._id}`)
    }
    className="bg-gray-800 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-black"
  >
    Practice
  </button>

</div>
                    <p className="text-green-600 text-xs mt-3 flex items-center gap-1">
                      <FaCheckCircle /> Unlocked
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSubjects;