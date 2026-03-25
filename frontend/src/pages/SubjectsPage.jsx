import { useState, useEffect } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import API from "../api/axios";
import { FaBookOpen, FaLock } from "react-icons/fa";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await API.get("/subjects");
        setSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const categories = [
    "All",
    ...new Set(subjects.map((s) => s.courseName || "General")),
  ];

  const filteredSubjects =
    activeCategory === "All"
      ? subjects
      : subjects.filter(
          (sub) => (sub.courseName || "General") === activeCategory
        );

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_white,_transparent)]"></div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Explore Subjects
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-100">
          Discover nursing subjects, practice smarter, and pass your exams with confidence
        </p>
      </section>

      {/* CATEGORY FILTER */}
      <section className="py-12 px-6">
        <div className="flex justify-center flex-wrap gap-3">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border text-gray-600 hover:bg-blue-600 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* SUBJECT GRID */}
      <section className="max-w-7xl mx-auto py-12 px-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* LOADING */}
        {loading &&
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow animate-pulse"
            >
              <div className="h-5 bg-gray-200 mb-3 rounded"></div>
              <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
            </div>
          ))}

        {/* EMPTY */}
        {!loading && filteredSubjects.length === 0 && (
          <p className="text-center col-span-full text-gray-500">
            No subjects found
          </p>
        )}

        {/* SUBJECTS */}
        {!loading &&
          filteredSubjects.map((sub) => (
            <div
              key={sub._id}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition duration-300 cursor-pointer flex flex-col justify-between"
            >
              
              {/* TOP */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FaBookOpen />
                  </div>

                  <h3 className="font-semibold text-gray-800">
                    {sub.name}
                  </h3>
                </div>

                <p className="text-sm text-gray-500 mb-3">
                  {sub.courseName || "General"}
                </p>
              </div>

              {/* STATUS */}
              <div className="flex items-center justify-between mt-4">
                
                {/* Free/Paid */}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    sub.isPaid
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {sub.isPaid ? "Paid" : "Free"}
                </span>

                {/* Locked */}
                {sub.isPaid && !sub.isUnlocked && (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <FaLock /> Locked
                  </span>
                )}
              </div>
            </div>
          ))}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Ready to Start Learning?
        </h2>

        <p className="mb-6 text-lg text-blue-100">
          Unlock subjects and begin your AI-powered study journey today
        </p>

        <a
          href="/signup"
          className="inline-block bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition"
        >
          Get Started
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default SubjectsPage;