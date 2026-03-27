import { useState } from "react";
import emailjs from "@emailjs/browser";
import API from "../api/axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    // ✅ Save to database
    await API.post("/messages", formData);

    // ✅ Send email via EmailJS
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      formData,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    setSuccess("Message sent successfully!");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

  } catch (err) {
    console.error(err);
    setError("Failed to send message. Try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Have questions or need support? Reach out to us and we’ll get back to you as soon as possible.
        </p>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-600"
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-600"
            />

            {/* STATUS MESSAGES */}
            {success && <p className="text-green-600">{success}</p>}
            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">
              Our Contact Info
            </h2>

            <div className="flex items-center gap-3">
              <FaPhone className="text-blue-600" />
              <span>+233 54 955 6116</span>
            </div>

            <div className="flex items-center gap-3">
              <FaEnvelope className="text-blue-600" />
              <span>alveolyapexprep@gmail.com</span>
            </div>

            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-blue-600" />
              <span>Accra, Ghana</span>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">
              Follow Us
            </h2>

            <div className="flex justify-center gap-6">
              <a href="#" className="hover:text-blue-600">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-blue-600">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-blue-600">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-blue-600">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
            Our Location
          </h2>

          <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
            <iframe
              title="Accra Location"
              src="https://www.google.com/maps/embed?pb=!1m18..."
              width="100%"
              height="100%"
              className="border-0"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;