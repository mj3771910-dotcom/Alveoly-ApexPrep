// StudentLessons.jsx - COMPLETE FIXED VERSION
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { FaLock, FaFilePdf, FaPlayCircle, FaTimes, FaQuestionCircle, FaCheckCircle } from "react-icons/fa";

const StudentLessons = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lessonQuizzes, setLessonQuizzes] = useState({});
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [unlockedContents, setUnlockedContents] = useState([]);

  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
    lessonId: null,
  });

  // Fetch contents and check for quizzes
  const fetchContentsAndQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching contents for subjectId:", subjectId);
      
      const res = await axios.get(`/content?subjectId=${subjectId}`);
      console.log("Contents fetched:", res.data);
      
      const contentsData = res.data;
      
      // Check which contents are unlocked
      const unlockedIds = [];
      for (const content of contentsData) {
        if (content.isPaid) {
          try {
            const accessRes = await axios.get(`/content-payments/check/${content._id}`);
            if (accessRes.data.hasAccess) {
              unlockedIds.push(content._id);
            }
          } catch (err) {
            console.error(`Error checking access for ${content.title}:`, err);
          }
        }
      }
      setUnlockedContents(unlockedIds);
      
      // Add unlocked status to content objects
      const contentsWithUnlockStatus = contentsData.map(content => ({
        ...content,
        isUnlocked: !content.isPaid || unlockedIds.includes(content._id)
      }));
      
      setContents(contentsWithUnlockStatus);
      
      // Check which lessons have quizzes
      const quizStatus = {};
      for (const lesson of contentsWithUnlockStatus) {
        if (lesson.type === "quiz") {
          quizStatus[lesson._id] = true;
          console.log(`Standalone quiz: ${lesson.title}`);
        } else {
          try {
            const quizRes = await axios.get(`/lesson-quiz/lesson/${lesson._id}`);
            const hasQuiz = quizRes.data && quizRes.data.length > 0;
            quizStatus[lesson._id] = hasQuiz;
            if (hasQuiz) {
              console.log(`Content "${lesson.title}" has attached quiz`);
            }
          } catch (err) {
            console.error(`Error checking quiz for lesson ${lesson._id}:`, err);
            quizStatus[lesson._id] = false;
          }
        }
      }
      setLessonQuizzes(quizStatus);
      
    } catch (err) {
      console.error("Error fetching contents:", err);
      setError("Failed to load lessons. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchContentsAndQuizzes();
    } else {
      setError("No subject selected");
      setLoading(false);
    }
  }, [subjectId]);

  // Check for payment callback on page load
  useEffect(() => {
    const checkPaymentCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');
      const contentId = urlParams.get('contentId');
      const sessionId = localStorage.getItem('payment_session_id');
      
      console.log("Payment callback detected - Reference:", reference, "ContentId:", contentId);
      
      if (reference) {
        setProcessingPayment(true);
        toast.loading("Verifying payment...", { id: "payment-verification" });
        
        try {
          const verifyRes = await axios.post("/content-payments/verify", {
            reference: reference,
            contentId: contentId || sessionId,
          });
          
          if (verifyRes.data.success) {
            toast.success("Payment verified! Content unlocked.", { id: "payment-verification" });
            await fetchContentsAndQuizzes();
          } else {
            toast.error("Payment verification failed. Please contact support.", { id: "payment-verification" });
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          toast.error("Failed to verify payment. Please contact support.", { id: "payment-verification" });
        } finally {
          setProcessingPayment(false);
          window.history.replaceState({}, document.title, window.location.pathname);
          localStorage.removeItem('payment_session_id');
          localStorage.removeItem('current_subject_id');
        }
      }
    };
    
    checkPaymentCallback();
  }, []);

  // Content protection effects
  useEffect(() => {
    let blurTimeout;
    let devToolsInterval;

    const getViewer = () => document.getElementById("secure-viewer");

    const handleContextMenu = (e) => {
      if (getViewer()) {
        e.preventDefault();
        return false;
      }
    };

    const triggerBlur = (duration = 2000) => {
      const viewerEl = getViewer();
      if (!viewerEl) return;
      viewerEl.style.filter = "blur(25px)";
      viewerEl.style.transition = "0.3s";
      clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        if (viewerEl) viewerEl.style.filter = "none";
      }, duration);
    };

    const handleKeyDown = (e) => {
      if (!getViewer()) return;
      if (e.key === "PrintScreen") {
        e.preventDefault();
        triggerBlur(3000);
        alert("⚠️ Screenshot is blocked");
      }
      if ((e.ctrlKey && ["s", "u", "c", "p"].includes(e.key.toLowerCase())) ||
          (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        triggerBlur(2000);
        alert("⚠️ Action not allowed");
      }
    };

    const handleVisibilityChange = () => {
      if (getViewer() && document.hidden) triggerBlur(5000);
    };

    const handleMouseLeave = () => {
      if (getViewer()) triggerBlur(3000);
    };

    const handleBlur = () => {
      if (getViewer()) triggerBlur(4000);
    };

    const detectDevTools = () => {
      if (!getViewer()) return;
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        triggerBlur(5000);
      }
    };

    if (viewer.open) {
      devToolsInterval = setInterval(detectDevTools, 1000);
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (devToolsInterval) clearInterval(devToolsInterval);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (blurTimeout) clearTimeout(blurTimeout);
    };
  }, [viewer.open]);

  // Handle payment unlock
  const handleUnlock = async (c) => {
    try {
      localStorage.setItem('current_subject_id', subjectId);
      localStorage.setItem('payment_session_id', c._id);
      
      const res = await axios.post("/content-payments/initiate", {
        contentId: c._id,
      });
      
      if (res.data.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment failed: " + (err.response?.data?.message || "Please try again"));
      localStorage.removeItem('payment_session_id');
      localStorage.removeItem('current_subject_id');
    }
  };

  // Open viewer with access check
  const openViewer = async (c) => {
    // Check if content is paid and unlocked
    if (c.isPaid && !c.isUnlocked) {
      toast.error("This content is locked. Please purchase to unlock.");
      return;
    }
    
    if (c.type === "quiz") {
      navigate(`/student/lessons/${c._id}/quiz`);
      return;
    }
    
    setViewer({
      open: true,
      type: c.type,
      url: c.fileUrl,
      title: c.title,
      lessonId: c._id,
    });
  };

  const closeViewer = () => {
    setViewer({
      open: false,
      type: "",
      url: "",
      title: "",
      lessonId: null,
    });
  };

  const handleTakeQuiz = () => {
    closeViewer();
    navigate(`/student/lessons/${viewer.lessonId}/quiz`);
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case "video": return "🎥 Video";
      case "pdf": return "📄 PDF";
      case "image": return "🖼 Image";
      case "quiz": return "📝 Quiz";
      default: return type;
    }
  };

  if (loading || processingPayment) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8">Lessons</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-red-600">Error</h2>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-600">
          No lessons available yet 📭
        </h2>
        <p className="text-gray-500 mt-2">Check back later for new content!</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">📚 Lessons</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border group cursor-pointer flex flex-col"
              onClick={() => openViewer(c)}
            >
              <div className="relative w-full h-48 bg-gray-100 flex-shrink-0 overflow-hidden">
                {c.type === "quiz" ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex flex-col items-center justify-center">
                    <FaQuestionCircle className="text-purple-500 text-5xl mb-2" />
                    <span className="text-purple-700 font-semibold text-sm">Quiz</span>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <img
                      src={c.thumbnailUrl || "/placeholder.jpg"}
                      className="w-full h-full object-contain bg-gray-900 group-hover:scale-105 transition-transform duration-300"
                      alt={c.title}
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                    {c.type === "video" && !c.isPaid && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <FaPlayCircle className="text-white text-5xl opacity-90 drop-shadow-lg" />
                      </div>
                    )}
                    {c.type === "pdf" && !c.isPaid && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <FaFilePdf className="text-red-500 text-5xl drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                )}

                {(lessonQuizzes[c._id] || c.type === "quiz") && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    📝 {c.type === "quiz" ? "Quiz" : "Quiz Available"}
                  </div>
                )}

                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  {getTypeLabel(c.type)}
                </div>

                {/* LOCK OVERLAY FOR PAID CONTENT */}
                {c.isPaid && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20">
                    {c.isUnlocked ? (
                      // Unlocked state
                      <>
                        <FaCheckCircle className="text-3xl mb-2 text-green-400" />
                        <p className="text-sm mb-2 font-semibold">Unlocked!</p>
                        <p className="text-xs">Click to view content</p>
                      </>
                    ) : (
                      // Locked state with unlock button
                      <>
                        <FaLock className="text-3xl mb-2" />
                        <p className="text-sm mb-2">Premium Content</p>
                        <p className="text-xs mb-2">Price: ₵{c.price}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlock(c);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition"
                        >
                          Unlock Now
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 flex-1">
                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition line-clamp-2">
                  {c.title}
                </h3>
                {(lessonQuizzes[c._id] || c.type === "quiz") && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> {c.type === "quiz" ? "Interactive quiz" : "Includes assessment"}
                  </p>
                )}
                {c.isPaid && !c.isUnlocked && (
                  <p className="text-xs text-yellow-600 mt-1">
                    💰 Premium content - ₵{c.price}
                  </p>
                )}
                {c.isPaid && c.isUnlocked && (
                  <p className="text-xs text-green-600 mt-1">
                    🔓 Unlocked - Click to view
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL VIEWER FOR VIDEO/IMAGE/PDF */}
      {viewer.open && (
        <div 
          id="secure-viewer" 
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex justify-between items-center p-4 text-white bg-black/50 flex-shrink-0">
            <h3 className="font-semibold text-lg truncate flex-1">
              {viewer.title}
            </h3>
            <div className="flex gap-3">
              {lessonQuizzes[viewer.lessonId] && (
                <button
                  onClick={handleTakeQuiz}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                >
                  📝 Take Quiz
                </button>
              )}
              <button 
                onClick={closeViewer} 
                className="hover:text-gray-300 transition p-2"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            {viewer.type === "video" && (
              <video
                src={viewer.url}
                controls
                controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                disablePictureInPicture
                autoPlay
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
              />
            )}

            {viewer.type === "image" && (
              <img
                src={viewer.url}
                alt={viewer.title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-w-full max-h-full rounded-lg select-none shadow-2xl object-contain"
              />
            )}

            {viewer.type === "pdf" && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(viewer.url)}&embedded=true`}
                title={viewer.title}
                className="w-full h-full rounded-lg shadow-2xl"
                onContextMenu={(e) => e.preventDefault()}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            )}
          </div>

          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-white/5 text-4xl font-bold rotate-[-30deg] select-none whitespace-nowrap">
                PROTECTED • DO NOT RECORD
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentLessons;