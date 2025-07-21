import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-gray-800 text-white py-8 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {currentYear} Sublite. All rights reserved.
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <Link to="/privacy" className="text-gray-300 hover:text-[#2bb6c4] transition">Privacy Policy</Link>
          <Link to="/terms" className="text-gray-300 hover:text-[#2bb6c4] transition">Terms of Service</Link>
          <Link to="/contact" className="text-gray-300 hover:text-[#2bb6c4] transition">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;