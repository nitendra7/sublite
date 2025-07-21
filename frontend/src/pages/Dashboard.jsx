import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import {
  FaBars, FaBook, FaMoon, FaQuestionCircle, FaStar, FaSun, FaThLarge,
  FaUser, FaWallet, FaSignOutAlt, FaBell
} from 'react-icons/fa';
import { CreditCard } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import AvailablePlansCard from '../components/dashboard/AvailablePlansCard';

const brandColor = '#2bb6c4';
const fontFamily = 'Inter, Roboto, Arial, sans-serif';

const mySubscriptionsSummary = {
  active: 2,
  owned: 1,
  borrowed: 1,
};

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

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900" style={{ fontFamily }}>
      {/* Sidebar */}
      <nav
        className="flex flex-col items-center md:items-stretch shadow-sm bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200"
        style={{
          minWidth: sidebarOpen ? 200 : 64,
          width: sidebarOpen ? 200 : 64,
          zIndex: 1000,
        }}
      >
        {/* Logo and Toggle */}
        <div className="flex flex-col items-center py-4" style={{ minHeight: 80 }}>
          <img
            src="/logo.jpg"
            alt="logo"
            style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: 8, cursor: 'pointer' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <button
            className="p-0 text-2xl text-[#2bb6c4] hover:text-[#1ea1b0] dark:text-[#5ed1dc] dark:hover:text-[#80e5ee]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
        </div>
        {/* Navigation Items */}
        <ul className="flex flex-col w-full mt-6">
          {sidebarItems.map((item, idx) => (
            <li key={item.name}>
              <button
                className={`flex items-center w-full text-left text-base transition-all duration-200 rounded-lg mx-2 my-1 p-2
                  ${active === idx
                    ? 'bg-[#2bb6c4] text-white font-semibold shadow' // Active state: Teal background, white text
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' // Inactive state: Text visible in both modes
                  }
                  ${sidebarOpen ? 'justify-start px-4' : 'justify-center'}
                `}
                onClick={() => handleSidebarClick(idx, item.route)}
              >
                {/* Icon color adjusted for both modes */}
                <span className={`${active === idx ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.icon}
                </span>
                {/* Text color for sidebar items */}
                {sidebarOpen && <span className="ms-2">{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header
          className="flex items-center justify-between px-4 py-3 shadow-sm flex-wrap gap-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700"
          style={{ minHeight: 72 }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center">
              <img src="/logo.jpg" alt="logo" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }} />
              <h2 className="font-bold mb-0 text-[#2bb6c4] tracking-wider">Sublite</h2>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="max-w-[250px] min-w-[180px] rounded-full px-4 py-1.5 border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-[#2bb6c4] outline-none
                         text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="flex items-center">
            <button
              className="p-2 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              onClick={toggleDarkMode}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              className="p-2 rounded-full text-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              title="Notifications"
              onClick={() => navigate('/dashboard/notifications')}
            >
              <FaBell />
            </button>
            {userName && (
              <button
                className="flex items-center ml-2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                onClick={() => navigate('/dashboard/profile')}
                title="View Profile"
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: brandColor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 18,
                    marginRight: 8,
                  }}
                >{getInitials(userName)}</span>
                <span className="ms-1">{firstName}</span>
              </button>
            )}
            {isAuthenticated && (
              <button
                className="ml-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Logout"
                onClick={handleLogout}
              >
                <FaSignOutAlt size={22} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-grow p-4 bg-gray-50 dark:bg-gray-900">
          <div className="container-fluid">
            {isBaseDashboard ? (
              <div className="p-6 md:p-10 min-h-full animate-fade-in">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-300 mb-8">Welcome back! Here's an overview of your account.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* My Subscriptions Card */}
                  <Link
                    to="subscriptions"
                    className="lg:col-span-1 bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-transform duration-300"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Subscriptions</h2>
                        <CreditCard size={32} className="opacity-70 text-gray-500 dark:text-gray-300" />
                      </div>
                      <p className="opacity-90 mb-6 text-gray-700 dark:text-gray-300">View and manage all your owned and borrowed subscriptions.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{mySubscriptionsSummary.active}</p>
                        <p className="text-xs opacity-80 text-gray-500 dark:text-gray-400">Active</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{mySubscriptionsSummary.owned}</p>
                        <p className="text-xs opacity-80 text-gray-500 dark:text-gray-400">Owned</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{mySubscriptionsSummary.borrowed}</p>
                        <p className="text-xs opacity-80 text-gray-500 dark:text-gray-400">Borrowed</p>
                      </div>
                    </div>
                  </Link>

                  {/* Available Plans Card (Conceptual - ensure its own file has similar dark mode logic) */}
                  <AvailablePlansCard />
                </div>
              </div>
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