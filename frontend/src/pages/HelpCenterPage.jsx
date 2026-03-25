import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaSearch, FaBook, FaUserGraduate, FaCreditCard, FaCog } from "react-icons/fa";

const faqs = [
  {
    question: "How do I create an account?",
    answer: "Click on the Sign Up button, fill in your details or use Google authentication to get started instantly."
  },
  {
    question: "How do I subscribe to a premium plan?",
    answer: "Go to the pricing page, choose a plan, and complete your payment using Paystack."
  },
  {
    question: "Can I access courses for free?",
    answer: "Yes, we offer a free plan with limited access to selected subjects and features."
  },
  {
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your email."
  },
  {
    question: "Do I get certificates after completing courses?",
    answer: "Yes, premium users receive certificates after completing courses and assessments."
  }
];

const categories = [
  {
    icon: <FaUserGraduate size={28} />,
    title: "Getting Started",
    desc: "Learn how to create an account and begin your journey."
  },
  {
    icon: <FaBook size={28} />,
    title: "Courses & Learning",
    desc: "Everything about courses, quizzes, and learning paths."
  },
  {
    icon: <FaCreditCard size={28} />,
    title: "Payments & Billing",
    desc: "Manage subscriptions and Paystack payments."
  },
  {
    icon: <FaCog size={28} />,
    title: "Account Settings",
    desc: "Update your profile, password, and preferences."
  }
];

const HelpCenterPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
        <p className="text-lg max-w-2xl mx-auto mb-6">
          How can we help you today? Find answers, guides, and support.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full p-4 rounded-full text-gray-700 outline-none shadow-lg"
          />
          <FaSearch className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-xl shadow-md text-center cursor-pointer hover:shadow-xl transition"
          >
            <div className="text-blue-600 mb-4 flex justify-center">{cat.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{cat.title}</h3>
            <p className="text-gray-500 text-sm">{cat.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{faq.question}</h4>
                  <span className="text-blue-600 text-xl">
                    {openFAQ === i ? "-" : "+"}
                  </span>
                </div>

                {openFAQ === i && (
                  <p className="mt-3 text-gray-600">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SUPPORT */}
      <section className="py-20 px-6 text-center bg-gray-100">
        <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
        <p className="text-gray-600 mb-6">
          Our support team is here to assist you anytime.
        </p>
        <a
          href="/contact"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Contact Support
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;