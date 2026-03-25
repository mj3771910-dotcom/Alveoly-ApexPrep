import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaStar } from "react-icons/fa";
import API from "../api/axios";

const TestimonialPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    API.get("/testimonials").then((res) => setTestimonials(res.data));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        testimonials.length ? (prev + 1) % testimonials.length : 0
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials]);

  if (!testimonials.length)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading testimonials...
      </div>
    );

  const t = testimonials[current];

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_white,_transparent)]"></div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          What Our Students Say
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-100">
          Real experiences from learners who transformed their future with
          <span className="font-semibold text-white"> Alveoly AI</span>
        </p>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="bg-white p-10 md:p-14 rounded-2xl shadow-lg text-center transition duration-500 hover:shadow-xl">
          
          {/* Avatar */}
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
            {t.name?.charAt(0).toUpperCase()}
          </div>

          {/* Name */}
          <h3 className="font-bold text-xl text-gray-800">
            {t.name}
          </h3>

          {/* Course */}
          <p className="text-gray-500 mb-4">{t.course}</p>

          {/* Stars */}
          <div className="flex justify-center mb-5">
            {Array.from({ length: 5 }, (_, i) => (
              <FaStar
                key={i}
                className={`text-lg transition ${
                  i < t.rating
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Feedback */}
          <p className="text-gray-600 italic text-lg leading-relaxed max-w-2xl mx-auto">
            “{t.feedback}”
          </p>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`h-3 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 bg-blue-600"
                    : "w-3 bg-gray-300"
                }`}
                onClick={() => setCurrent(i)}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* OPTIONAL GRID PREVIEW (EXTRA PREMIUM FEEL) */}
      <section className="pb-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">
          More Student Stories
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((item) => (
            <div
              key={item._id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                  {item.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.course}</p>
                </div>
              </div>

              <div className="flex mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <FaStar
                    key={i}
                    className={`text-xs ${
                      i < item.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-gray-600 line-clamp-3">
                {item.feedback}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TestimonialPage;