import { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import {
  FaBook, FaMoon, FaStar, FaSun, FaHome,
  FaWallet, FaSignOutAlt, FaBell, FaCog, FaListAlt, FaPlus, FaQuestionCircle
} from 'react-icons/fa';
import { FaBars } from 'react-icons/fa';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import Sidebar from '../components/dashboard/Sidebar';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const fontFamily = 'Inter, Roboto, Arial, sans-serif';

const coreNavigationItems = [
  { name: 'Dashboard', icon: <FaHome />, route: '/dashboard' },
  { name: 'My Subscriptions', icon: <FaBook />, route: '/dashboard/subscriptions' },
  { name: 'Available Plans', icon: <FaListAlt />, route: '/dashboard/available-plans' },
  { name: 'Add Service', icon: <FaPlus />, route: '/dashboard/add-service' },
  { name: 'Wallet', icon: <FaWallet />, route: '/dashboard/wallet' },
];

const secondaryNavigationItems = [
  { name: 'Reviews', icon: <FaStar />, route: '/dashboard/reviews' },
  { name: 'Notifications', icon: <FaBell />, route: '/dashboard/notifications' },
];

// Keep original for desktop compatibility
const sidebarItems = [...coreNavigationItems, ...secondaryNavigationItems, { name: 'Help', icon: <FaQuestionCircle />, route: '/dashboard/help' }];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        
        const response = await api.get(`/notifications`);
        const notifications = response.data;
        const unreadCount = notifications.filter(n => !n.isRead).length;
        setUnreadNotifications(unreadCount);
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
      {/* Desktop/Tablet Sidebar - Hidden on Mobile */}
      <div className="hidden md:flex">
        <Sidebar
          sidebarOpen={sidebarOpen}
          active={active}
          onSidebarClick={handleSidebarClick}
          handleSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header
          className="relative z-10 flex items-center justify-between px-4 py-3 shadow-sm bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 min-h-[60px] backdrop-blur-sm -ml-px"
        >
          {/* Left Section - Mobile Menu Button + Logo and Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu button - Only visible on mobile */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              onClick={() => setMobileMenuOpen(true)}
              title="Open Navigation Menu"
            >
              <FaBars className="text-lg" />
            </button>

            <Link to="/dashboard" className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                <img src="/logos/logo.png" alt="logo" className="w-10 h-10 rounded-full object-cover" />
              </div>
                              <div className="hidden sm:block">
                  <h2 className="font-bold text-xl text-[#2bb6c4] dark:text-[#5ed1dc] tracking-wide">Sublite</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Subscription Management</p>
                </div>
            </Link>
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
          {isBaseDashboard ? <DashboardOverview /> : <Outlet />}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start md:hidden">
          {/* Mobile Sidebar Drawer */}
          <div className="w-72 sm:w-80 bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col">
            {/* Header - Logo + Close */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              {/* Logo Section */}
              <div className="flex items-center space-x-3 -ml-2">
                <img src="/logos/logo.png" alt="logo" className="w-10 h-10 object-cover rounded-full" />
                <div>
                  <h2 className="font-bold text-lg text-[#2bb6c4] dark:text-[#5ed1dc]">Sublite</h2>
                </div>
              </div>

              {/* Close Button */}
              <button
                className="p-2 rounded-lg text-gray-500 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Section - At Top */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {/* User Avatar + Info */}
                <div className="flex items-center space-x-3">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2bb6c4] to-[#1ea1b0] flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(userName)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">User</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation Section */}
            <div className="flex-1 overflow-y-auto">
              {/* Navigation Links */}
              <div className="px-4 py-6">
                <ul className="space-y-2">
                  {coreNavigationItems.map((item, idx) => {
                    const itemIndex = idx; // Core items: 0-4
                    return (
                      <li key={item.name}>
                        <button
                          className={`flex items-center w-full py-2 px-4 rounded-xl text-left transition-all duration-200 group min-h-[44px]
                            ${active === itemIndex
                              ? 'bg-[#2bb6c4] text-white shadow-lg'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#2bb6c4] dark:hover:text-[#5ed1dc]'
                            }
                          `}
                          onClick={() => {
                            handleSidebarClick(itemIndex, item.route);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <div className="w-5 h-5 flex items-center justify-center mr-3">
                            {item.icon}
                          </div>
                          <span className={`text-base ${active === itemIndex ? 'font-semibold' : 'font-medium'}`}>
                            {item.name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {secondaryNavigationItems.map((item, idx) => {
                    const secondaryIndex = coreNavigationItems.length + idx; // Secondary items: 5-6
                    return (
                      <li key={item.name}>
                        <button
                          className={`flex items-center w-full py-2 px-4 rounded-xl text-left transition-all duration-200 group min-h-[44px]
                            ${active === secondaryIndex
                              ? 'bg-[#2bb6c4] text-white shadow-lg'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#2bb6c4] dark:hover:text-[#5ed1dc]'
                            }
                          `}
                          onClick={() => {
                            handleSidebarClick(secondaryIndex, item.route);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <div className="w-5 h-5 flex items-center justify-center mr-3">
                            {item.icon}
                          </div>
                          <span className={`text-base ${active === secondaryIndex ? 'font-semibold' : 'font-medium'}`}>
                            {item.name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Separator Divider */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></div>

            {/* Sticky Footer */}
            <div className="p-4 space-y-3">
              {/* Logout Button */}
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to log out?")) {
                    clearAuthData();
                    navigate('/login');
                  }
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full py-2 px-4 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200 font-medium min-h-[44px]"
              >
                <FaSignOutAlt className="w-5 h-5 mr-3" />
                <span className="text-base">Logout</span>
              </button>

              {/* Help Link */}
              <button
                className="flex items-center w-full py-2 px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 min-h-[44px]"
                onClick={() => {
                  window.location.href = 'mailto:sublite.app@gmail.com?subject=Help and Support Request';
                }}
              >
                <FaQuestionCircle className="w-5 h-5 mr-3" />
                <span className="text-base font-medium">Help & Support</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

