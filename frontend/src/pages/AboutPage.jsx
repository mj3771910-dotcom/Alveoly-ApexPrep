import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaLightbulb, FaUsers, FaAward, FaBrain } from "react-icons/fa";

const teamMembers = [
  { name: "Bofah Emmanuel", role: "Founder & CEO", avatar: "https://i.pravatar.cc/150?img=5" },
  { name: "Ama Mensah", role: "Head of AI Content", avatar: "https://i.pravatar.cc/150?img=6" },
  { name: "Kojo Appiah", role: "Lead Developer", avatar: "https://i.pravatar.cc/150?img=7" },
  { name: "Efua Ofori", role: "Education Specialist", avatar: "https://i.pravatar.cc/150?img=8" },
];

const aboutFeatures = [
  {
    icon: <FaBrain className="text-blue-600 text-4xl" />,
    title: "AI-Powered Learning",
    desc: "Smart AI explanations, rationales, and personalized study paths tailored to each student.",
  },
  {
    icon: <FaUsers className="text-blue-600 text-4xl" />,
    title: "Community Support",
    desc: "Collaborate with fellow learners, ask questions, and participate in discussions.",
  },
  {
    icon: <FaLightbulb className="text-blue-600 text-4xl" />,
    title: "Expert-Designed Content",
    desc: "All questions, courses, and explanations are curated by experienced educators.",
  },
  {
    icon: <FaAward className="text-blue-600 text-4xl" />,
    title: "Achievements & Certificates",
    desc: "Earn badges and certificates to showcase your accomplishments and growth.",
  },
];

const AboutPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">About Alveoly AI</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          We empower nursing students to achieve exam success through AI-driven learning, comprehensive explanations, and a supportive community.
        </p>
      </section>

      {/* MISSION & VISION */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            To provide a personalized, AI-powered learning experience that helps nursing students master their subjects efficiently and confidently.
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Vision</h2>
          <p className="text-gray-700">
            To be the most trusted and effective online platform for exam preparation, helping students worldwide achieve success and growth.
          </p>
        </div>
        <div>
          <img
            src="http://localhost:5173/src/assets/nursing-student.jpeg"
            alt="Education Success"
            className="rounded-xl shadow-lg w-full"
          />
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 px-6 bg-gray-100">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Alveoly AI</h2>
          <p className="text-gray-700 text-lg md:text-xl">
            Combining AI technology, expert content, and a collaborative learning environment to ensure every student reaches their full potential.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
          {aboutFeatures.map((feature, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow text-center flex flex-col items-center hover:scale-105 transition transform"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-bold text-xl text-blue-600 mb-2">{feature.title}</h3>
              <p className="text-gray-700">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA */}
      <section className="bg-blue-700 text-white py-20 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Start Your Learning Journey Today</h2>
        <p className="mb-6 text-lg md:text-xl">Join thousands of students achieving success with Alveoly AI.</p>
        <a
          href="/signup"
          className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 transition"
        >
          Sign Up Now
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;