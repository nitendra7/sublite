import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'; // Added Outlet
import {
  FaBars, FaBook, FaMoon, FaQuestionCircle, FaStar, FaSun, FaThLarge,
  FaUser, FaWallet, FaSignOutAlt, FaBell
} from 'react-icons/fa';
import { useUser } from '../context/UserContext'; // Correct path from src/pages to src/context

const brandColor = '#2bb6c4';
const fontFamily = 'Inter, Roboto, Arial, sans-serif';
// Adjusted routes for nested structure under /dashboard
const sidebarItems = [
  { name: 'Dashboard', icon: <FaThLarge />, route: '/dashboard' },
  { name: 'My Subscriptions', icon: <FaBook />, route: '/dashboard/subscriptions' },
  { name: 'Wallet', icon: <FaWallet />, route: '/dashboard/wallet' },
  { name: 'Profile', icon: <FaUser />, route: '/dashboard/profile' },
  { name: 'Reviews', icon: <FaStar />, route: '/dashboard/reviews' },
  { name: 'Support', icon: <FaQuestionCircle />, route: '/dashboard/support' },
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function DashboardApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState(0); // This state should reflect current active route
  const [darkMode, setDarkMode] = useState(false); // Consider centralizing this with a ThemeContext
  const navigate = useNavigate();
  
  // Get user, loading, and clearAuthData from context
  const { user, loading, clearAuthData } = useUser();
  const userName = user?.name || localStorage.getItem('userName') || 'User'; // Use user.name from context, fallback to localStorage
  const isAuthenticated = !!user || !!localStorage.getItem('token'); // Check if authenticated via context or localStorage

  // Colors for dark/light mode
  const colors = darkMode
    ? {
        mainBg: '#181a1b',
        sidebarBg: '#23272b',
        headerBg: '#23272b',
        cardBg: '#23272b',
        text: '#f3f4f6',
        sidebarText: '#f3f4f6',
        sidebarActive: brandColor,
        border: '#333',
      }
    : {
        mainBg: '#f8fafc',
        sidebarBg: '#fff',
        headerBg: '#fff',
        cardBg: '#fff',
        text: '#222',
        sidebarText: '#222',
        sidebarActive: brandColor,
        border: '#e5e7eb',
      };

  // Handle sidebar navigation
  const handleSidebarClick = (idx, route) => {
    setActive(idx);
    navigate(route);
  };

  // Effect to handle initial sidebar active state based on current route
  useEffect(() => {
    const currentPath = window.location.pathname;
    const activeIndex = sidebarItems.findIndex(item => currentPath.startsWith(item.route));
    if (activeIndex !== -1) {
      setActive(activeIndex);
    }
  }, [sidebarItems]);

  // Logout handler
  const handleLogout = () => {
    clearAuthData(); // Use the context function to clear auth data
    navigate('/login'); // Navigate to login page
  };

  // Display loading state from UserContext
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.mainBg, color: colors.text }}>
        Loading dashboard...
      </div>
    );
  }

  // If not authenticated after loading, redirect to login
  if (!isAuthenticated && !loading) {
      navigate('/login');
      return null; // Return null to prevent rendering until redirection
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily, background: colors.mainBg }}>
      {/* Sidebar */}
      <nav
        className="d-flex flex-column align-items-center align-items-md-stretch shadow-sm"
        style={{
          minWidth: sidebarOpen ? 200 : 64,
          width: sidebarOpen ? 200 : 64,
          transition: 'width 0.2s',
          zIndex: 1000,
          background: colors.sidebarBg,
          color: colors.sidebarText,
          borderRight: `1px solid ${colors.border}`,
        }}
      >
        <div className="d-flex flex-column align-items-center py-4" style={{ minHeight: 80 }}>
          <img
            src="/logo.jpg"
            alt="logo"
            style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: 8, cursor: 'pointer' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <button
            className="btn btn-link p-0"
            style={{ color: brandColor, fontSize: 24 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
        </div>
        <ul className="nav flex-column w-100" style={{ marginTop: 24 }}>
          {sidebarItems.map((item, idx) => (
            <li key={item.name} className="nav-item">
              <button
                className={
                  `nav-link d-flex align-items-center w-100${active === idx ? ' active' : ''}`
                }
                style={{
                  background: active === idx ? colors.sidebarActive : 'transparent',
                  color: active === idx ? '#fff' : colors.sidebarText,
                  fontWeight: active === idx ? 600 : 400,
                  border: 'none',
                  borderRadius: 8,
                  margin: '4px 8px',
                  padding: sidebarOpen ? '10px 16px' : '10px 8px',
                  fontSize: 16,
                  transition: 'all 0.2s',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => handleSidebarClick(idx, item.route)}
              >
                {item.icon}
                {sidebarOpen && <span className="ms-2">{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: '100vh' }}>
        <header
          className="d-flex align-items-center justify-content-between px-4 py-3 shadow-sm flex-wrap gap-3"
          style={{
            minHeight: 72,
            background: colors.headerBg,
            color: colors.text,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="d-flex align-items-center">
              <img src="/logo.jpg" alt="logo" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }} />
              <h2 className="fw-bold mb-0" style={{ color: brandColor, letterSpacing: 1 }}>Sublite</h2>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="form-control"
              style={{
                maxWidth: 250,
                minWidth: 180,
                borderRadius: 24,
                padding: '6px 16px',
                border: `1px solid ${colors.border}`,
                background: darkMode ? '#2a2e33' : '#fff',
                color: colors.text,
              }}
            />
          </div>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-secondary me-2"
              style={{ borderRadius: 24, fontSize: 20 }}
              onClick={() => setDarkMode((dm) => !dm)}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            {/* Notification Icon */}
            <button
              className="btn btn-outline-secondary me-2"
              style={{ borderRadius: 24, fontSize: 20 }}
              title="Notifications"
              onClick={() => navigate('/dashboard/notifications')} // Adjusted for nested route
            >
              <FaBell />
            </button>
            {userName && (
              <span className="d-flex align-items-center ms-2">
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: brandColor,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 18,
                    marginRight: 8,
                  }}
                >
                  {getInitials(userName)}
                </span>
                <span style={{ fontWeight: 500 }}>{userName}</span>
              </span>
            )}
            {isAuthenticated && (
              <button
                className="btn btn-link ms-3 text-danger"
                title="Logout"
                onClick={handleLogout}
              >
                <FaSignOutAlt size={22} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-grow-1 p-4" style={{ background: colors.mainBg, color: colors.text }}>
          <div className="container-fluid">
            {/* THIS IS CRUCIAL FOR NESTED ROUTES: Renders child routes */}
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardApp;