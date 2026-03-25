import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaStar } from "react-icons/fa";
import API from "../api/axios";

const WhatDoesStudentSays = () => {
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
    </div>
  );
};

export default WhatDoesStudentSays;