import { useState, useEffect } from "react";
import API from "../api/axios";
import { FaStar } from "react-icons/fa";

const StudentTestimonials = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({
    name: "",
    course: "",
    rating: 5,
    feedback: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMyTestimonials = async () => {
      try {
        const res = await API.get("/testimonials/my");
        setFeedbacks(res.data);
      } catch (err) {
        console.error(err);
        setMessage("Error fetching your testimonials");
      }
    };
    fetchMyTestimonials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/testimonials", form);
      setMessage("Your testimonial has been submitted for review.");
      setForm({ name: "", course: "", rating: 5, feedback: "" });

      const res = await API.get("/testimonials/my");
      setFeedbacks(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error submitting testimonial");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Share Your Experience
        </h2>
        <p className="text-gray-500 mt-1">
          Help others by sharing your learning journey
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border rounded-xl p-6 shadow-sm mb-10">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          
          {/* Name */}
          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Course */}
          <input
            type="text"
            placeholder="Your Course"
            value={form.course}
            required
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Star Rating */}
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mb-1">Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <FaStar
                  key={num}
                  onClick={() => setForm({ ...form, rating: num })}
                  className={`cursor-pointer text-xl transition ${
                    num <= form.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Feedback */}
          <textarea
            placeholder="Your Feedback"
            value={form.feedback}
            required
            onChange={(e) =>
              setForm({ ...form, feedback: e.target.value })
            }
            className="col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
          />

          {/* Button */}
          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Submit Testimonial
          </button>
        </form>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      {/* Submissions */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Your Submissions
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {feedbacks.map((f) => (
            <div
              key={f._id}
              className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {f.course}
                  </p>
                  <p className="text-sm text-gray-500">
                    {f.name}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    f.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : f.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {f.status}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-sm ${
                      i < f.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Feedback */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {f.feedback}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentTestimonials;