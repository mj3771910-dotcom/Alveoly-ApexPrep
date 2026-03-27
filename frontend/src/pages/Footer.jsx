// src/components/Footer.jsx
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-14 px-6 mt-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        
        {/* BRAND */}
        <div>
          <h3 className="text-white font-bold text-xl mb-3">
            Alveoly ApexPrep
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            AI-powered licensure prep platform helping nursing students succeed
            through smart learning, mock exams, and personalized guidance.
          </p>

          <p className="text-gray-500 text-sm mt-4">
            Accra, Ghana
          </p>
        </div>

        {/* COMPANY */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
            <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li className="text-gray-400">alveolyapexprep@gmail.com</li>
          </ul>
        </div>

        {/* LEGAL + NEWSLETTER */}
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm mb-6">
            <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            <li><Link to="/cookies" className="hover:text-white">Cookie Policy</Link></li>
            <li><Link to="/refund" className="hover:text-white">Refund Policy</Link></li>
          </ul>

          {/* NEWSLETTER */}
          <div>
            <p className="text-sm mb-2 text-gray-400">
              Subscribe to updates
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="w-full p-2 rounded-l bg-gray-800 border border-gray-700 text-sm outline-none"
              />
              <button className="bg-blue-600 px-4 rounded-r text-white text-sm hover:bg-blue-700">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SOCIALS */}
      <div className="max-w-7xl mx-auto mt-10 flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-6">
        
        <p className="text-sm text-gray-500 mb-4 md:mb-0">
          © {new Date().getFullYear()} Alveoly AI. All rights reserved.
        </p>

        <div className="flex gap-4 text-gray-400">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
            <FaFacebookF />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
            <FaLinkedinIn />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;