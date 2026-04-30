import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { FaLock, FaFilePdf, FaPlayCircle, FaTimes } from "react-icons/fa";

const StudentLessons = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasQuiz, setHasQuiz] = useState(false);

  // Viewer state
  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
    lessonId: null,
  });

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await axios.get(`/content?subjectId=${subjectId}`);
        setContents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, [subjectId]);

  // Check if lesson has quiz
  const checkLessonQuiz = async (lessonId) => {
    try {
      const res = await axios.get(`/lesson-quiz/lesson/${lessonId}`);
      setHasQuiz(res.data && res.data.length > 0);
    } catch (err) {
      console.error("Error checking quiz:", err);
      setHasQuiz(false);
    }
  };

  // Content protection effects
  useEffect(() => {
    let blurTimeout;
    let devToolsInterval;

    const getViewer = () => document.getElementById("secure-viewer");

    // Disable right click
    const handleContextMenu = (e) => {
      if (getViewer()) {
        e.preventDefault();
        return false;
      }
    };

    // Blur function
    const triggerBlur = (duration = 2000) => {
      const viewerEl = getViewer();
      if (!viewerEl) return;

      viewerEl.style.filter = "blur(25px)";
      viewerEl.style.transition = "0.3s";

      clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        if (viewerEl) {
          viewerEl.style.filter = "none";
        }
      }, duration);
    };

    // Detect keys (screenshots + dev tools + save)
    const handleKeyDown = (e) => {
      if (!getViewer()) return;

      if (e.key === "PrintScreen") {
        e.preventDefault();
        triggerBlur(3000);
        alert("⚠️ Screenshot is blocked");
      }

      if (
        (e.ctrlKey && ["s", "u", "c", "p"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        triggerBlur(2000);
        alert("⚠️ Action not allowed");
      }
    };

    // Blur when tab hidden
    const handleVisibilityChange = () => {
      if (getViewer() && document.hidden) {
        triggerBlur(5000);
      }
    };

    // Blur when user leaves screen
    const handleMouseLeave = () => {
      if (getViewer()) {
        triggerBlur(3000);
      }
    };

    // Blur when window loses focus
    const handleBlur = () => {
      if (getViewer()) {
        triggerBlur(4000);
      }
    };

    // DevTools detection
    const detectDevTools = () => {
      if (!getViewer()) return;
      
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
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

  const handleUnlock = async (c) => {
    try {
      const res = await axios.post("/content-payments/pay", {
        contentId: c._id,
      });
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  // Handle open viewer
  const openViewer = async (c) => {
    if (c.isPaid) return;
    
    await checkLessonQuiz(c._id);
    
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
    setHasQuiz(false);
  };

  const handleTakeQuiz = () => {
    closeViewer();
    navigate(`/student/lessons/${viewer.lessonId}/quiz`);
  };

  // Loading state
  if (loading) {
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

  // No content state
  if (contents.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-600">
          No lessons available yet 📭
        </h2>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">📚 Lessons</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border group cursor-pointer"
              onClick={() => openViewer(c)}
            >
              {/* THUMBNAIL */}
              <div className="relative w-full h-48 bg-gray-100">
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

                {/* PLAY BUTTON (VIDEO) */}
                {c.type === "video" && !c.isPaid && (
                  <FaPlayCircle className="absolute inset-0 m-auto text-white text-6xl opacity-90" />
                )}

                {/* PDF ICON */}
                {c.type === "pdf" && !c.isPaid && (
                  <FaFilePdf className="absolute inset-0 m-auto text-red-600 text-5xl" />
                )}

                {/* LOCK OVERLAY FOR PAID CONTENT */}
                {c.isPaid && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                    <FaLock className="text-3xl mb-2" />
                    <p className="text-sm mb-2">Premium Content</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlock(c);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition"
                    >
                      Unlock ₵{c.price}
                    </button>
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="p-4">
                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition">
                  {c.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL VIEWER WITH QUIZ BUTTON */}
      {viewer.open && (
        <div 
          id="secure-viewer" 
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center p-4 text-white bg-black/50">
            <h3 className="font-semibold text-lg truncate flex-1">
              {viewer.title}
            </h3>
            <div className="flex gap-3">
              {hasQuiz && (
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

          {/* CONTENT AREA */}
          <div className="flex-1 flex items-center justify-center p-4">
            {/* VIDEO PLAYER */}
            {viewer.type === "video" && (
              <video
                src={viewer.url}
                controls
                controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                disablePictureInPicture
                autoPlay
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-h-full max-w-full rounded-lg shadow-2xl"
              />
            )}

            {/* IMAGE VIEWER */}
            {viewer.type === "image" && (
              <img
                src={viewer.url}
                alt={viewer.title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-h-full max-w-full rounded-lg select-none shadow-2xl"
              />
            )}

            {/* PDF VIEWER */}
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

          {/* WATERMARK OVERLAY */}
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