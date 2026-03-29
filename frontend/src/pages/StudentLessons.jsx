import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { FaLock, FaFilePdf, FaPlayCircle, FaTimes } from "react-icons/fa";

const StudentLessons = () => {
  const { subjectId } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 VIEWER STATE
  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
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

  // 🔐 CONTENT PROTECTION
// 🔐 CONTENT PROTECTION
useEffect(() => {
  let blurTimeout;

  const getViewer = () => document.getElementById("secure-viewer");

  // Disable right click
  const handleContextMenu = (e) => e.preventDefault();

  // Blur function
  const triggerBlur = (duration = 2000) => {
    const viewerEl = getViewer();
    if (!viewerEl) return;

    viewerEl.style.filter = "blur(25px)";
    viewerEl.style.transition = "0.3s";

    clearTimeout(blurTimeout);
    blurTimeout = setTimeout(() => {
      viewerEl.style.filter = "none";
    }, duration);
  };

  // Detect keys (screenshots + dev tools + save)
  const handleKeyDown = (e) => {
    if (e.key === "PrintScreen") {
      triggerBlur(3000);
      navigator.clipboard.writeText("⚠️ Screenshot blocked");
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
    if (document.hidden) triggerBlur(5000);
  };

  // Blur when user leaves screen (VERY IMPORTANT)
  const handleMouseLeave = () => {
    triggerBlur(3000);
  };

  // Blur when window loses focus (ALT+TAB / screen tools)
  const handleBlur = () => {
    triggerBlur(4000);
  };

  // DevTools detection trick
  const detectDevTools = () => {
    const threshold = 160;
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      triggerBlur(5000);
    }
  };

  const devToolsInterval = setInterval(detectDevTools, 1000);

  // Mobile screenshot hint (resize spike)
  const handleResize = () => {
    triggerBlur(1500);
  };

  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleBlur);
  window.addEventListener("resize", handleResize);
  document.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    clearInterval(devToolsInterval);
    document.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("mouseleave", handleMouseLeave);
  };
}, []);

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

  // 🔥 HANDLE OPEN VIEWER
  const openViewer = (c) => {
    if (c.isPaid) return;

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

  // ================= LOADING =================
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
                />

                {/* TYPE */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {c.type}
                </div>

                {/* ▶ PLAY BUTTON (VIDEO) */}
                {c.type === "video" && !c.isPaid && (
                  <FaPlayCircle className="absolute inset-0 m-auto text-white text-6xl opacity-90" />
                )}

                {/* 🔒 LOCK */}
                {c.isPaid && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                    <FaLock className="text-3xl mb-2" />
                    <p className="text-sm mb-2">Premium Content</p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlock(c);
                      }}
                      className="bg-blue-600 px-4 py-2 rounded-lg"
                    >
                      Unlock ₵{c.price}
                    </button>
                  </div>
                )}

                {/* PDF ICON */}
                {c.type === "pdf" && !c.isPaid && (
                  <FaFilePdf className="absolute inset-0 m-auto text-red-600 text-5xl" />
                )}
              </div>

              {/* INFO */}
              <div className="p-4">
                <h3 className="font-semibold text-lg group-hover:text-blue-600">
                  {c.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL VIEWER ================= */}
      {viewer.open && (
  <div
    id="secure-viewer"
    className="fixed inset-0 bg-black/90 z-50 flex flex-col"
  >
    {/* HEADER */}
    <div className="flex justify-between items-center p-4 text-white">
      <h3 className="font-semibold">{viewer.title}</h3>
      <button onClick={closeViewer}>
        <FaTimes size={20} />
      </button>
    </div>

    {/* 🔒 PROTECTION OVERLAY */}
    <div className="absolute inset-0 pointer-events-none select-none z-50">
      {/* Optional watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <p className="text-white/10 text-3xl font-bold rotate-[-30deg] select-none">
    PROTECTED • DO NOT RECORD
  </p>
</div>
    </div>

    {/* CONTENT */}
    <div className="flex-1 flex items-center justify-center p-4">
      
      {/* VIDEO */}
      {viewer.type === "video" && (
        <video
  src={viewer.url}
  controls
  controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
  disablePictureInPicture
  autoPlay
  onContextMenu={(e) => e.preventDefault()}
  onDragStart={(e) => e.preventDefault()}
  className="max-h-full max-w-full rounded-lg"
/>
      )}

      {/* IMAGE */}
      {viewer.type === "image" && (
        <img
          src={viewer.url}
          alt="preview"
          draggable={false}
          className="max-h-full max-w-full rounded-lg select-none"
        />
      )}

      {/* PDF */}
      {viewer.type === "pdf" && (
        <iframe
          src={`https://docs.google.com/gview?url=${viewer.url}&embedded=true`}
          className="w-full h-full rounded-lg"
        />
      )}
    </div>
  </div>
)}
    </>
  );
};

export default StudentLessons;