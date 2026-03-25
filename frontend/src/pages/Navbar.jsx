// src/components/Navbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center px-4 md:px-10 py-4 bg-white shadow-md fixed w-full z-50">
      <div className="flex items-center gap-2">
        <img src={logo} alt="logo" className="h-10 w-10" />
        <h1 className="font-bold text-lg text-blue-600">Alveoly ApexPrep</h1>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-5">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/features" className="hover:text-blue-600">Features</Link>
        <Link to="/subjects" className="hover:text-blue-600">Subjects</Link>
        <Link to="/pricing" className="hover:text-blue-600">Pricing</Link>
        <Link to="/testimonials" className="hover:text-blue-600">Testimonials</Link>
        <Link to="/about" className="hover:text-blue-600">About</Link>
        <Link to="/contact" className="hover:text-blue-600">Contact Us</Link>
      </div>

      {/* Hamburger Mobile */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white flex flex-col gap-4 p-6 shadow-md md:hidden">
          {["/", "/features", "/subjects", "/pricing", "/testimonials", "/about", "/contact"].map((path, i) => (
            <Link key={i} to={path} className="hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              {path === "/" ? "Home" : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;