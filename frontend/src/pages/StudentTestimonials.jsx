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
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyTestimonials = async () => {
      try {
        const res = await API.get("/testimonials/my");
        setFeedbacks(res.data);
      } catch (err) {
        setError("Error fetching your testimonials");
      }
    };
    fetchMyTestimonials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await API.post("/testimonials", form);

      setMessage("✅ Testimonial submitted for review!");
      setForm({ name: "", course: "", rating: 5, feedback: "" });

      const res = await API.get("/testimonials/my");
      setFeedbacks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">

      {/* HEADER */}
      <div className="mb-6 md:mb-10 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Share Your Experience
        </h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Help others by sharing your learning journey
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm mb-8 md:mb-10">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="text"
            placeholder="Your Course"
            value={form.course}
            required
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* RATING */}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-2">Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <FaStar
                  key={num}
                  onClick={() => setForm({ ...form, rating: num })}
                  className={`cursor-pointer text-xl transition transform hover:scale-110 ${
                    num <= form.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <textarea
            placeholder="Your Feedback"
            value={form.feedback}
            required
            onChange={(e) =>
              setForm({ ...form, feedback: e.target.value })
            }
            className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
          />

          <button
            type="submit"
            className="md:col-span-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition w-full"
          >
            Submit Testimonial
          </button>
        </form>
      </div>

      {/* ALERTS */}
      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* SUBMISSIONS */}
      <div>
        <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
          Your Submissions
        </h3>

        {feedbacks.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow text-center text-gray-400">
            No testimonials yet
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 sm:grid-cols-1 md:grid-cols-2">
            {feedbacks.map((f) => (
              <div
                key={f._id}
                className="bg-white border rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition"
              >

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm md:text-base">
                      {f.course}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      {f.name}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium w-fit ${
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

                {/* STARS */}
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

                {/* FEEDBACK */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {f.feedback}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTestimonials;