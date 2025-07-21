import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="w-full bg-white/90 backdrop-blur-sm shadow-md fixed top-0 left-0 right-0 z-50 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="Sublite Logo"
          style={{ width: '48px', height: '48px', borderRadius: '50%' }}
        />
        <span className="text-2xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
      </div>
      <nav>
        <ul className="flex items-center gap-4">
          <li>
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-center"
            >
              Sign In
            </Link>
          </li>
          <li>
            <Link
              to="/register"
              className="px-5 py-2 rounded-lg bg-[#2bb6c4] text-white font-semibold shadow-md hover:bg-[#1ea1b0] transition-colors text-center"
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