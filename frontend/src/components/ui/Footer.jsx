import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme if needed for dark mode awareness

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // const { darkMode } = useTheme(); // You can consume here if the footer needs dark mode specific logic

  return (
    <footer className="w-full bg-gray-800 text-white py-8 text-center dark:bg-gray-900 dark:text-gray-300">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {currentYear} Sublite. All rights reserved.
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <Link to="/privacy" className="text-gray-300 hover:text-[#2bb6c4] transition dark:text-gray-400 dark:hover:text-[#5ed1dc]">Privacy Policy</Link>
          <Link to="/terms" className="text-gray-300 hover:text-[#2bb6c4] transition dark:text-gray-400 dark:hover:text-[#5ed1dc]">Terms of Service</Link>
          <Link to="/contact" className="text-gray-300 hover:text-[#2bb6c4] transition dark:text-gray-400 dark:hover:text-[#5ed1dc]">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;