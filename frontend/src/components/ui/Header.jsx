import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // useTheme is needed here if the header includes theme toggle or needs theme-aware logic.

const Header = () => {
  // Consume dark mode state if needed for header logic/styling.
  const { darkMode } = useTheme(); 

  return (
    <header className="w-full bg-white/90 backdrop-blur-sm shadow-md fixed top-0 left-0 right-0 z-50 py-3 px-4 sm:px-6 flex flex-row items-center justify-between gap-2 sm:gap-0 dark:bg-gray-800/90 dark:shadow-lg dark:border-b dark:border-gray-700">
      <div className="flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="Sublite Logo"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
        />
        <span className="hidden sm:inline text-xl sm:text-2xl font-extrabold text-[#2bb6c4] tracking-tight dark:text-[#5ed1dc]">Sublite</span>
      </div>
      <nav className="w-auto">
        <ul className="flex flex-row items-center gap-2 sm:gap-4 w-auto">
          <li>
            <Link
              to="/login"
              className="block px-3 py-2 sm:px-5 sm:py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-center text-sm sm:text-base dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Sign In
            </Link>
          </li>
          <li>
            <Link
              to="/register"
              className="block px-3 py-2 sm:px-5 sm:py-2 rounded-lg bg-[#2bb6c4] text-white font-semibold shadow-md hover:bg-[#1ea1b0] transition-colors text-center text-sm sm:text-base dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4]"
            >
              Get Started
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;