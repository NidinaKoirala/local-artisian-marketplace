import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { FaInstagram, FaFacebook, FaTwitter, FaArrowUp } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white text-gray-600 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img 
              src={assets.logo} 
              className="w-10 h-10 object-contain" 
              alt="Hastakala Logo" 
            />
            <span className="text-xl font-bold text-gray-800">Hastakala</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-500">
            Celebrating local artisans, preserving traditions, and promoting sustainability. 
            Discover unique, handcrafted creations that make a difference.
          </p>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
              <FaFacebook className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
              <FaInstagram className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
              <FaTwitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 uppercase">Company</h3>
          <nav className="flex flex-col space-y-2">
            <Link to="/" onClick={scrollToTop} className="text-sm hover:text-gray-800 transition-colors">
              Home
            </Link>
            <Link to="/collection" onClick={scrollToTop} className="text-sm hover:text-gray-800 transition-colors">
              Collection
            </Link>
            <Link to="/about" onClick={scrollToTop} className="text-sm hover:text-gray-800 transition-colors">
              About Us
            </Link>
            <Link to="/contact" onClick={scrollToTop} className="text-sm hover:text-gray-800 transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 uppercase">Contact</h3>
          <div className="space-y-2">
            <p className="text-sm">Kamaladi Marg, Kathmandu</p>
            <a href="tel:9800000000" className="block text-sm hover:text-gray-800 transition-colors">
              +977 980 000 0000
            </a>
            <a href="mailto:hastakala@gmail.com" className="block text-sm hover:text-gray-800 transition-colors">
              hastakala@gmail.com
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 uppercase">Newsletter</h3>
          <form className="flex flex-col space-y-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
            />
            <button 
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-gray-100 pt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-gray-500">
            © 2025 नेपाली हस्त कला. All rights reserved.
          </p>
          <div className="flex justify-end">
          <button 
            onClick={scrollToTop}
            className="flex text-gray-500 hover:text-gray-800 transition-colors text-sm"
          >
            Back to Top
            <FaArrowUp className="ml-2 w-3 h-3" />
          </button>
        </div>      
        </div>        
      </div>      
    </footer>
  );
};
export default Footer;
