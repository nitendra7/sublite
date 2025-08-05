import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // useTheme is needed here if the header includes theme toggle or needs theme-aware logic.

const Header = () => {
  // Consume dark mode state if needed for header logic/styling.
  const { darkMode } = useTheme(); 
  const location = useLocation();
  const hideAuthLinks = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500/90 backdrop-blur-sm shadow-lg fixed top-0 left-0 right-0 z-50 py-3 px-4 sm:px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="relative">
          <img
            src="/logo.png"
            alt="Sublite Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-200"
          />
        
        </div>
        <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent tracking-tight drop-shadow group-hover:scale-105 transition-transform duration-200">
          Sublite
        </span>
      </Link>
      {!hideAuthLinks && (
        <nav>
          <ul className="flex items-center gap-2 sm:gap-4">
            <li>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-white/80 text-cyan-700 font-semibold hover:bg-cyan-100 hover:text-cyan-900 transition text-sm sm:text-base shadow"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold shadow-md hover:bg-cyan-700 transition-colors text-sm sm:text-base"
              >
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};
//ho
export default Header;