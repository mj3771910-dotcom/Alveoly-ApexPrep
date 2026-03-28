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

  if (loading) return <p>Loading lessons...</p>;

  if (contents.length === 0) return <p>No lessons available</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8">Lessons</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden relative"
          >
            {/* THUMBNAIL / MEDIA */}
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              {c.isPaid ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                  <FaLock className="text-3xl mb-2 text-gray-600" />
                  <p className="text-sm mb-3">Locked Content</p>
                  <button
                    onClick={() => handleUnlock(c)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Unlock ₵{c.price}
                  </button>
                </div>
              ) : (
                <>
                  {c.type === "video" && (
                    <video
                      src={c.fileUrl}
                      controls
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  )}

                  {c.type === "image" && (
                    <img
                      src={c.thumbnailUrl || c.fileUrl}
                      alt={c.title}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  )}

                  {c.type === "pdf" && (
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      className="absolute inset-0 flex items-center justify-center text-blue-600 font-semibold gap-2"
                    >
                      <FaFilePdf /> Open PDF
                    </a>
                  )}
                </>
              )}
            </div>

            {/* TITLE */}
            <div className="p-4">
              <h3 className="font-bold text-lg">{c.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{c.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentLessons;