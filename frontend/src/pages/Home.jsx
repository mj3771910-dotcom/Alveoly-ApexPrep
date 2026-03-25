import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import hero1 from "../assets/nursing-student.jpeg";
import hero2 from "../assets/nursing-student2.png";
import hero3 from "../assets/nursing-student3.png";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatDoesStudentSays from "./WhatDoesStudentSays";

const Home = () => {
  const [currentHero, setCurrentHero] = useState(0);
  const heroImages = [hero1, hero2, hero3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 text-gray-800 overflow-x-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-between px-4 md:px-16 pt-28 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="max-w-xl text-center md:text-left z-10">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-6xl font-bold mb-4"
          >
            Alveoly ApexPrep
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-sm md:text-lg"
          >
            50K+ nursing questions, AI tutor, rationales, mock exams & real exam explanations.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link
              to="/signup"
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow hover:scale-105 transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-700 transition"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="w-full md:w-[500px] mt-10 md:mt-0 relative h-[350px] md:h-[450px] overflow-hidden rounded-xl shadow-2xl">
          <AnimatePresence initial={false}>
            <motion.img
              key={currentHero}
              src={heroImages[currentHero]}
              alt="hero"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 1 }}
              className="absolute w-full h-full object-cover rounded-xl"
            />
          </AnimatePresence>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-white grid grid-cols-2 md:grid-cols-4 text-center gap-6">
        {[{ number: "50K+", label: "Questions" }, { number: "10K+", label: "Students" }, { number: "100+", label: "Subjects" }, { number: "AI", label: "Tutor Support" }]
          .map((item, i) => (
            <motion.div key={i} whileInView={{ scale: 1.1 }} className="p-4">
              <h2 className="text-2xl md:text-4xl font-bold text-blue-600">{item.number}</h2>
              <p>{item.label}</p>
            </motion.div>
          ))}
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {[{ title: "AI Tutor Assistance", desc: "Get instant AI-powered explanations." }, { title: "Detailed Rationales", desc: "Understand why every answer is correct." }, { title: "Mock Exams", desc: "Practice under real exam conditions." }]
          .map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="font-bold text-blue-600">{item.title}</h3>
              <p className="mt-2">{item.desc}</p>
            </motion.div>
          ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-100 py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-10">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {["Sign Up", "Choose Subject", "Practice Questions", "Learn with AI"].map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}
              className="bg-white p-6 rounded shadow">{step}</motion.div>
          ))}
        </div>
      </section>

      {/* SUBJECTS */}
      <section id="subjects" className="bg-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">Popular Subjects</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {["Anatomy", "Pharmacology", "Med-Surg", "Pediatrics"].map((sub, i) => (
            <div key={i} className="bg-blue-50 p-4 rounded shadow hover:bg-blue-100 cursor-pointer">{sub}</div>
          ))}
        </div>
      </section>

     {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">What Students Say</h2>
        <WhatDoesStudentSays/>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-gray-100 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">Flexible Access</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="border p-6 rounded bg-white">Free Plan - Limited Questions</div>
          <div className="border p-6 rounded bg-blue-600 text-white">Premium Plan - All Subjects & AI Features</div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700 text-white py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Start Learning Today</h2>
        <Link to="/signup" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold">Join Now</Link>
      </section>

     <Footer />
    </div>
  );
};

export default Home;