import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { FaLock, FaFilePdf, FaPlayCircle } from "react-icons/fa";

const StudentLessons = () => {
  const { subjectId } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8">Lessons</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 animate-pulse h-64 rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  // ================= EMPTY =================
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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        📚 Lessons
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border group"
          >
            {/* ================= THUMBNAIL ================= */}
            <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
              
              {/* Thumbnail */}
              <img
                src={c.thumbnailUrl || "/placeholder.jpg"}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />

              {/* Type Badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {c.type.toUpperCase()}
              </div>

              {/* VIDEO PLAY ICON */}
              {c.type === "video" && !c.isPaid && (
                <FaPlayCircle className="absolute inset-0 m-auto text-white text-5xl opacity-80" />
              )}

              {/* ================= LOCKED OVERLAY ================= */}
              {c.isPaid && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                  <FaLock className="text-3xl mb-2" />
                  <p className="text-sm mb-2">Premium Content</p>

                  <button
                    onClick={() => handleUnlock(c)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Unlock ₵{c.price}
                  </button>
                </div>
              )}

              {/* ================= PDF OVERLAY ================= */}
              {!c.isPaid && c.type === "pdf" && (
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-white/70 hover:bg-white/80 transition"
                >
                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                    <FaFilePdf />
                    Open PDF
                  </div>
                </a>
              )}
            </div>

            {/* ================= CONTENT INFO ================= */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition">
                {c.title}
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                {c.type}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentLessons;