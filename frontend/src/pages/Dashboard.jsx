import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import {
  FaBook, FaMoon, FaStar, FaSun, FaHome,
  FaWallet, FaSignOutAlt, FaBell, FaCog, FaListAlt, FaPlus, FaQuestionCircle
} from 'react-icons/fa';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import Sidebar from '../components/dashboard/Sidebar';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const fontFamily = 'Inter, Roboto, Arial, sans-serif';

const sidebarItems = [
  { name: 'Dashboard', icon: <FaHome />, route: '/dashboard' },
  { name: 'My Subscriptions', icon: <FaBook />, route: '/dashboard/subscriptions' },
  { name: 'Available Plans', icon: <FaListAlt />, route: '/dashboard/available-plans' },
  { name: 'Add Service', icon: <FaPlus />, route: '/dashboard/add-service' },
  { name: 'Wallet', icon: <FaWallet />, route: '/dashboard/wallet' },
  { name: 'Reviews', icon: <FaStar />, route: '/dashboard/reviews' },
  { name: 'Notifications', icon: <FaBell />, route: '/dashboard/notifications' },
  { name: 'Help', icon: <FaQuestionCircle />, route: '/dashboard/help' },
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);

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

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const notifications = await response.json();
          const unreadCount = notifications.filter(n => !n.isRead).length;
          setUnreadNotifications(unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      clearAuthData();
      navigate('/login');
    }
    setIsProfileMenuOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(prevState => !prevState);
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden" style={{ fontFamily }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        active={active}
        onSidebarClick={handleSidebarClick}
        handleSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header
          className="relative z-10 flex items-center justify-between px-4 py-3 shadow-sm bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 min-h-[60px] backdrop-blur-sm -ml-px"
        >
          {/* Left Section - Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                <img src="/logos/logo.png" alt="logo" className="w-10 h-10 rounded-full object-cover" />
              </div>
                              <div className="hidden sm:block">
                  <h2 className="font-bold text-xl text-[#2bb6c4] dark:text-[#5ed1dc] tracking-wide">Sublite</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Subscription Management</p>
                </div>
            </div>
          </div>

          {/* Right Section - Actions and User */}
          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Settings button - only show for admin users */}
              {user?.isAdmin && (
                <button
                  className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group relative"
                  title="Admin Settings"
                  onClick={() => navigate('/admin')}
                >
                  <FaCog className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                </button>
              )}
              
              {/* Theme Toggle */}
              <button
                className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                onClick={toggleDarkMode}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <FaSun className="text-lg group-hover:rotate-12 transition-transform duration-300" />
                ) : (
                  <FaMoon className="text-lg group-hover:rotate-12 transition-transform duration-300" />
                )}
              </button>
              
              {/* Notifications */}
              <button
                className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group relative"
                title="Notifications"
                onClick={() => navigate('/dashboard/notifications')}
              >
                <FaBell className="text-lg group-hover:scale-110 transition-transform duration-200" />
                {/* Notification indicator - only show if there are unread notifications */}
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </button>
            </div>

            {/* User Profile */}
            {userName && (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                  onClick={handleProfileClick}
                  title="View Profile"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-[#2bb6c4] transition-all duration-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2bb6c4] to-[#1ea1b0] flex items-center justify-center text-white font-bold text-lg ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-[#2bb6c4] transition-all duration-200">
                      {getInitials(userName)}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{firstName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">User</p>
                  </div>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div
                    ref={profileMenuRef}
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                    style={{ top: profileButtonRef.current ? profileButtonRef.current.offsetHeight + 8 : 'auto' }}
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">sublite.app@gmail.com</p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                        <span className="text-sm">👤</span>
                      </div>
                      <span className="text-sm font-medium">View Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                        <FaSignOutAlt size={14} />
                      </div>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 w-full">
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
