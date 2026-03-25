import { useState, useEffect } from "react";
import API from "../api/axios";
import { FaStar } from "react-icons/fa";

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await API.get("/testimonials/pending");
      setTestimonials(res.data);
    } catch (err) {
      console.error("Error fetching pending testimonials:", err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, status) => {
    try {
      if (status === "approved") {
        await API.patch(`/testimonials/${id}/approve`);
      } else if (status === "rejected") {
        await API.patch(`/testimonials/${id}/reject`);
      }
      fetchPending();
    } catch (err) {
      console.error("Error updating testimonial:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Pending Testimonials
        </h2>
        <p className="text-gray-500 mt-1">
          Review and manage student feedback submissions
        </p>
      </div>

      {/* Empty State */}
      {testimonials.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center shadow-sm">
          <p className="text-gray-500 text-lg">
            No pending testimonials at the moment 🎉
          </p>
        </div>
      )}

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div
            key={t._id}
            className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300"
          >
            
            {/* Top Section */}
            <div className="flex items-center gap-4 mb-4">
              
              {/* Avatar */}
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
                {t.name?.charAt(0).toUpperCase()}
              </div>

              {/* Name & Course */}
              <div>
                <p className="font-semibold text-gray-800">
                  {t.name}
                </p>
                <p className="text-sm text-gray-500">
                  {t.course}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-sm ${
                    i < t.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-500">
                ({t.rating}/5)
              </span>
            </div>

            {/* Feedback */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {t.feedback}
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
                onClick={() => handleAction(t._id, "approved")}
              >
                Approve
              </button>
              <button
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
                onClick={() => handleAction(t._id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;