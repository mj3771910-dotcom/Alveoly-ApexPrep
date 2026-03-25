import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

const jobs = [
  {
    title: "Frontend Developer",
    location: "Remote",
    type: "Full-time",
    description:
      "Build modern, responsive UI using React and Tailwind. Work closely with our design and backend teams."
  },
  {
    title: "Backend Developer",
    location: "Remote",
    type: "Full-time",
    description:
      "Develop scalable APIs and manage databases using Node.js and MongoDB."
  },
  {
    title: "UI/UX Designer",
    location: "Remote",
    type: "Contract",
    description:
      "Design clean and engaging user experiences for our learning platform."
  }
];

const benefits = [
  "Flexible working hours",
  "Remote-friendly culture",
  "Learning and development support",
  "Work with cutting-edge AI technology",
  "Collaborative and innovative team"
];

const CareersPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Join Our Team
        </h1>
        <p className="max-w-2xl mx-auto text-lg">
          Help us transform education with technology. We’re building the future of learning at Alveoly AI.
        </p>
      </section>

      {/* WHY WORK WITH US */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-10">
          Why Work With Us
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-xl shadow text-center"
            >
              <p className="font-medium">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* JOB LISTINGS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-10">
            Open Positions
          </h2>

          <div className="space-y-6">
            {jobs.map((job, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="border rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <p className="text-gray-500 text-sm">
                      {job.location} • {job.type}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CULTURE SECTION */}
      <section className="py-20 px-6 text-center bg-gray-100">
        <h2 className="text-3xl font-bold mb-4">Our Culture</h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          At Alveoly AI, we foster a culture of innovation, collaboration, and continuous learning. 
          We believe in empowering our team to grow while making a real impact in education worldwide.
        </p>
      </section>

      {/* APPLY MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-gray-500 text-xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4">
              Apply for {selectedJob.title}
            </h2>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="file"
                className="w-full p-2 border rounded-lg"
              />
              <textarea
                placeholder="Cover Letter"
                rows={4}
                className="w-full p-3 border rounded-lg"
              ></textarea>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Don’t See Your Role?
        </h2>
        <p className="text-gray-600 mb-6">
          We’re always looking for talented people. Send us your CV!
        </p>
        <a
          href="/contact"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Contact Us
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default CareersPage;