import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';

const Header = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const hideAuthLinks = location.pathname === '/login' || location.pathname === '/register';
  const { user: _user } = useUser();

  return (
    <header className="relative z-10 flex items-center justify-between px-4 py-3 shadow-lg bg-white/95 dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700 min-h-[60px] backdrop-blur-md w-full">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="relative">
          <img
            src="/logos/logo.png"
            alt="Sublite Logo"
            className="block w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover m-0"
          />
        </div>
        {/* TEMP: Render "Sublite" unconditionally for debug */}
        <span className="block text-lg sm:text-3xl font-extrabold text-[#2bb6c4] tracking-tight drop-shadow group-hover:scale-105 transition-transform duration-200 ml-2">
          Sublite
        </span>
      </Link>
      {!hideAuthLinks && (
        <nav>
          <ul className="flex flex-row items-center gap-2 sm:gap-4">
            <li>
              <button
                onClick={toggleDarkMode}
                className="px-2 py-2 rounded-lg bg-white/80 dark:bg-gray-700 text-[var(--color-primary-dark)] dark:text-gray-300 hover:bg-[var(--color-primary-light)]/10 hover:text-[var(--color-primary-dark)] dark:hover:bg-gray-600 dark:hover:text-gray-100 transition-all duration-200 text-xs sm:text-base"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
              </button>
            </li>
            <li>
              <Link
                to="/login"
                className="px-2 py-2 rounded-lg bg-white/80 dark:bg-gray-700 text-[var(--color-primary-dark)] dark:text-gray-300 font-semibold hover:bg-[var(--color-primary-light)]/10 hover:text-[var(--color-primary-dark)] dark:hover:bg-gray-600 dark:hover:text-gray-100 transition-all duration-200 text-xs sm:text-base shadow"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="px-2 py-2 rounded-lg bg-[#2bb6c4] text-white font-semibold shadow-md hover:bg-[#1ea1b0] transition-colors duration-200 text-xs sm:text-base"
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
export default Header;