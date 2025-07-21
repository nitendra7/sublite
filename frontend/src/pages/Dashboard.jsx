import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import {
  FaBars, FaBook, FaMoon, FaStar, FaSun, FaThLarge,
  FaWallet, FaSignOutAlt, FaBell, FaCog
} from 'react-icons/fa';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const brandColor = '#2bb6c4';
const fontFamily = 'Inter, Roboto, Arial, sans-serif';

const sidebarItems = [
  { name: 'Dashboard', icon: <FaThLarge />, route: '/dashboard' },
  { name: 'My Subscriptions', icon: <FaBook />, route: '/dashboard/subscriptions' },
  { name: 'Available Plans', icon: <FaThLarge />, route: '/dashboard/available-plans' },
  { name: 'Wallet', icon: <FaWallet />, route: '/dashboard/wallet' },
  { name: 'Reviews', icon: <FaStar />, route: '/dashboard/reviews' },
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // State for profile menu visibility
  const profileMenuRef = useRef(null); // Ref for the profile menu container
  const profileButtonRef = useRef(null); // Ref for the profile button

  const navigate = useNavigate();
  const location = useLocation();

  const { darkMode, toggleDarkMode } = useTheme();
  const { user, loading, clearAuthData } = useUser();
  const userName = user?.name || localStorage.getItem('userName') || 'User';
  const firstName = userName.split(' ')[0];
  const isAuthenticated = !!user || !!localStorage.getItem('token');

  const handleSidebarClick = (idx, route) => {
    setActive(idx);
    navigate(route);
  };

  useEffect(() => {
    const currentPath = location.pathname;
    let activeIndex = 0;
    let longestMatch = 0;

    sidebarItems.forEach((item, idx) => {
      if (item.route === '/dashboard' && currentPath === '/dashboard') {
        activeIndex = idx;
        longestMatch = item.route.length;
      } else if (currentPath.startsWith(item.route) && item.route.length > longestMatch) {
        longestMatch = item.route.length;
        activeIndex = idx;
      }
    });
    setActive(activeIndex);
  }, [location.pathname]);

  // Effect to close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target) &&
          profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Show a confirmation dialog before logging out
    if (window.confirm("Are you sure you want to log out?")) { // Using window.confirm for simplicity
      clearAuthData();
      navigate('/login');
    }
    setIsProfileMenuOpen(false); // Close menu after action
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(prevState => !prevState); // Toggle profile menu
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200" style={{ fontFamily }}>
        Loading dashboard...
      </div>
    );
  }

  if (!isAuthenticated && !loading) {
      navigate('/login');
      return null;
  }

  const isBaseDashboard = location.pathname === '/dashboard';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200" style={{ fontFamily }}>
      {/* Sidebar navigation */}
      <nav
        className="z-50 flex flex-col items-center md:items-stretch shadow-sm bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 overflow-hidden" 
        style={{
          minWidth: sidebarOpen ? 200 : 64,
          width: sidebarOpen ? 200 : 64,
        }}
      >
        <div className="flex flex-col items-center py-4 min-h-[72px]">
          <img
            src="/logo.jpg"
            alt="logo"
            className="w-10 h-10 rounded-full mb-2 cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <button
            className="p-0 text-2xl text-[#2bb6c4] hover:text-[#1ea1b0] dark:text-[#5ed1dc] dark:hover:text-[#80e5ee]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
        </div>
        <ul className="flex flex-col w-full mt-6">
          {sidebarItems.map((item, idx) => (
            <li key={item.name}>
              <button
                className={`flex items-center w-full text-left text-base transition-all duration-200 rounded-lg my-1 p-2
                  ${active === idx
                    ? 'bg-[#2bb6c4] text-white font-semibold shadow px-4 justify-start'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  ${sidebarOpen ? 'justify-start px-4' : 'justify-center'}
                `}
                onClick={() => handleSidebarClick(idx, item.route)}
              >
                <span className={`${active === idx ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="ms-2">{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header
          className="flex items-center justify-between px-4 py-3 shadow-sm flex-wrap gap-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 min-h-[72px]"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center">
              <img src="/logo.jpg" alt="logo" className="w-10 h-10 rounded-full mr-3" />
              <h2 className="font-bold mb-0 text-[#2bb6c4] tracking-wider">Sublite</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 relative"> {/* Added relative for popover positioning */}
            {/* Settings Icon */}
            <button
              className="p-2 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              title="Settings"
            >
              <FaCog /> 
            </button>
            {/* Dark Mode Toggle Button */}
            <button
              className="p-2 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              onClick={toggleDarkMode}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            {/* Notification Icon */}
            <button
              className="p-2 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              title="Notifications"
              onClick={() => navigate('/dashboard/notifications')}
            >
              <FaBell />
            </button>
            {userName && (
              <button
                ref={profileButtonRef} // Attach ref to profile button
                className="flex items-center ml-2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
                onClick={handleProfileClick} // Toggle menu on click
                title="View Profile"
              >
                <span className="w-9 h-9 rounded-full bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 flex items-center justify-center font-bold text-lg mr-2">
                  {getInitials(userName)}
                </span>
                <span className="ms-1">{firstName}</span>
              </button>
            )}
            
            {/* Profile Dropdown/Popover Menu */}
            {isProfileMenuOpen && (
              <div
                ref={profileMenuRef} // Attach ref to menu
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-1 z-1000 border border-gray-200 dark:border-gray-600"
                style={{ top: profileButtonRef.current ? profileButtonRef.current.offsetHeight + 8 : 'auto' }} // Position below button
              >
                <Link
                  to="/dashboard/profile"
                  onClick={() => setIsProfileMenuOpen(false)} // Close menu on navigation
                  className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 hover:text-red-800 dark:text-red-400 dark:hover:bg-gray-600 dark:hover:text-red-300 transition-colors"
                >
                  <FaSignOutAlt size={16} className="inline-block mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic main content area */}
        <main className="flex-grow p-4 bg-gray-50 dark:bg-gray-900">
          <div className="w-full h-full">
            {isBaseDashboard ? (
              <DashboardOverview />
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;