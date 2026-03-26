import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaLightbulb, FaUsers, FaAward, FaBrain } from "react-icons/fa";

// ✅ FIX IMAGE (Option B)
import nursingImg from "../assets/nursing-student.jpeg";

const teamMembers = [
  { name: "Bofah Emmanuel", role: "Founder & CEO", avatar: "https://i.pravatar.cc/150?img=5" },
  { name: "Ama Mensah", role: "Head of AI Content", avatar: "https://i.pravatar.cc/150?img=6" },
  { name: "Kojo Appiah", role: "Lead Developer", avatar: "https://i.pravatar.cc/150?img=7" },
  { name: "Efua Ofori", role: "Education Specialist", avatar: "https://i.pravatar.cc/150?img=8" },
];

const aboutFeatures = [
  {
    icon: <FaBrain className="text-blue-600 text-3xl" />,
    title: "AI-Powered Learning",
    desc: "Smart AI explanations and personalized study paths tailored to each student.",
  },
  {
    icon: <FaUsers className="text-blue-600 text-3xl" />,
    title: "Community Support",
    desc: "Collaborate, ask questions, and grow with other learners.",
  },
  {
    icon: <FaLightbulb className="text-blue-600 text-3xl" />,
    title: "Expert Content",
    desc: "Carefully curated by experienced educators.",
  },
  {
    icon: <FaAward className="text-blue-600 text-3xl" />,
    title: "Achievements",
    desc: "Earn badges and certificates as you progress.",
  },
];

const AboutPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">
          About Alveoly ApexPrep
        </h1>
        <p className="text-sm sm:text-lg max-w-2xl mx-auto opacity-90">
          Empowering nursing students with AI-driven learning,
          smart explanations, and real exam success.
        </p>
      </section>

      {/* MISSION & IMAGE */}
      <section className="py-16 px-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        
        {/* TEXT */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Our Mission</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            To deliver a powerful AI learning experience that helps students
            master nursing concepts faster and with confidence.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Our Vision</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            To become the leading AI-powered exam preparation platform for
            healthcare students worldwide.
          </p>
        </div>

        {/* IMAGE */}
        <div className="relative">
          <img
            src={nursingImg}
            alt="Nursing student"
            className="rounded-2xl shadow-lg w-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-600/10 rounded-2xl"></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Why Choose Us
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Built with powerful AI, expert knowledge, and a student-first approach.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {aboutFeatures.map((feature, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <div className="mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-blue-600 text-sm mb-1">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM (NEW PROFESSIONAL TOUCH) */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          Meet Our Team
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((member, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl shadow-sm text-center hover:shadow-md transition"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-16 h-16 mx-auto rounded-full mb-3"
              />
              <h4 className="font-semibold text-sm">{member.name}</h4>
              <p className="text-gray-500 text-xs">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700 text-white py-16 text-center px-4">
        <h2 className="text-2xl sm:text-4xl font-bold mb-4">
          Start Your Journey Today
        </h2>
        <p className="mb-6 text-sm sm:text-lg">
          Join students already succeeding with Alveoly AI.
        </p>

        <a
          href="/signup"
          className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold text-sm sm:text-base hover:scale-105 transition inline-block"
        >
          Get Started
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;