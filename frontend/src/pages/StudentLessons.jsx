import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { FaLock, FaPlayCircle, FaFilePdf } from "react-icons/fa";

const StudentLessons = () => {
  const { subjectId } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/content?subjectId=${subjectId}`);
        setContents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8">Lessons</h2>

      {contents.length === 0 ? (
        <p>No lessons available</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((c) => (
            <div
              key={c._id}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition relative"
            >
              <h3 className="font-bold mb-3">{c.title}</h3>

              {/* LOCKED */}
              {c.isPaid ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <FaLock className="text-2xl mb-2 text-gray-600" />
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
                  {/* VIDEO */}
                  {c.type === "video" && (
                    <video
                      src={c.fileUrl}
                      controls
                      className="w-full rounded"
                    />
                  )}

                  {/* IMAGE */}
                  {c.type === "image" && (
                    <img
                      src={c.fileUrl}
                      alt=""
                      className="rounded"
                    />
                  )}

                  {/* PDF */}
                  {c.type === "pdf" && (
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      className="flex items-center gap-2 text-blue-600"
                    >
                      <FaFilePdf /> Open PDF
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentLessons;