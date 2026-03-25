import { motion } from "framer-motion";
import { FaRobot, FaBook, FaClipboardList, FaChartLine, FaUsers, FaAward } from "react-icons/fa";
import Footer from "./Footer";
import Navbar from "./Navbar";

const featuresList = [
  {
    icon: <FaRobot className="text-blue-600 text-4xl" />,
    title: "AI Tutor Assistance",
    desc: "Get instant AI-powered explanations tailored to your learning style."
  },
  {
    icon: <FaBook className="text-blue-600 text-4xl" />,
    title: "Detailed Rationales",
    desc: "Understand why every answer is correct and build strong knowledge foundations."
  },
  {
    icon: <FaClipboardList className="text-blue-600 text-4xl" />,
    title: "Mock Exams",
    desc: "Practice under realistic exam conditions to gain confidence."
  },
  {
    icon: <FaChartLine className="text-blue-600 text-4xl" />,
    title: "Progress Tracking",
    desc: "Visualize your progress, performance, and areas to improve with interactive dashboards."
  },
  {
    icon: <FaUsers className="text-blue-600 text-4xl" />,
    title: "Community Support",
    desc: "Join discussions, ask questions, and learn collaboratively with fellow students."
  },
  {
    icon: <FaAward className="text-blue-600 text-4xl" />,
    title: "Certifications & Achievements",
    desc: "Earn badges and certificates for completed courses and milestones."
  }
];

const steps = [
  { number: "01", title: "Sign Up", desc: "Create your account and choose your desired subjects." },
  { number: "02", title: "Select Course", desc: "Pick the topic or exam you want to practice." },
  { number: "03", title: "Practice & Learn", desc: "Answer questions with AI explanations to deepen understanding." },
  { number: "04", title: "Track Progress", desc: "Monitor performance, strengths, and weaknesses." },
  { number: "05", title: "Achieve Mastery", desc: "Complete courses and get recognized with certificates." }
];

const FeaturesPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      <Navbar/>
      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Features of Alveoly AI</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">Everything you need to succeed in your nursing exams with AI-powered tools and interactive learning.</p>
      </section>

      {/* FEATURE GRID */}
      <section className="max-w-6xl mx-auto py-20 px-6 grid md:grid-cols-3 gap-10">
        {featuresList.map((feature, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(0,0,0,0.1)" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-xl shadow flex flex-col items-center text-center"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="font-bold text-xl text-blue-600 mb-2">{feature.title}</h3>
            <p className="text-gray-700">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* STEP-BY-STEP PROCESS */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg md:text-xl">Step-by-step guidance to maximize your learning experience</p>
        </div>

        <div className="grid md:grid-cols-steps md:gap-12 gap-10 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:scale-105 transition transform"
            >
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">{step.number}</div>
              <h3 className="font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-gray-700">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700 text-white py-20 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="mb-6 text-lg md:text-xl">Join thousands of students using Alveoly AI to pass their exams faster and smarter.</p>
        <a href="/signup" className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 transition">Sign Up Now</a>
      </section>

      <Footer/>
    </div>
  );
};

export default FeaturesPage;