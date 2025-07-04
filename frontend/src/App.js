import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import { FaBars, FaBell, FaBook, FaMoon, FaQuestionCircle, FaSearch, FaSignOutAlt, FaStar, FaSun, FaThLarge, FaUser, FaWallet } from 'react-icons/fa';
import { Link, Navigate, Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';

const API_BASE = 'https://sublite-wmu2.onrender.com';

// Helper for authenticated API requests
function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.accessToken);
      // Decode token to get user info
      try {
        const decoded = jwtDecode(data.accessToken);
        if (decoded && decoded.name) {
          localStorage.setItem('userName', decoded.name);
        } else {
          localStorage.removeItem('userName');
        }
      } catch (e) {
        localStorage.removeItem('userName');
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ minWidth: 320, background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 className="mb-4">Login</h2>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <div className="mt-3 text-center">
          <span>New user? </span>
          <Link to="/register">Sign up</Link>
        </div>
      </form>
    </div>
  );
}

function LogoutPage() {
  const navigate = useNavigate();
  useState(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, []);
  return <div>Logging out...</div>;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, userType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ minWidth: 320, background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 className="mb-4">Register</h2>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">User Type</label>
          <select className="form-select" value={userType} onChange={e => setUserType(e.target.value)} required>
            <option value="client">Client</option>
            <option value="provider">Provider</option>
          </select>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const brandColor = '#2bb6c4';
const fontFamily = 'Inter, Roboto, Arial, sans-serif';

const sidebarItems = [
  { name: 'Dashboard', icon: <FaThLarge /> },
  { name: 'My Subscriptions', icon: <FaBook /> },
  { name: 'Wallet', icon: <FaWallet /> },
  { name: 'Profile', icon: <FaUser /> },
  { name: 'Reviews', icon: <FaStar /> },
  { name: 'Support', icon: <FaQuestionCircle /> },
  { name: 'Search', icon: <FaSearch /> },
];

function MainApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const mainBg = darkMode ? '#f4f6f8' : '#f8fafc';
  const accent = '#2bb6c4'; // Brand color from logo
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  // Theme colors
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily, background: colors.mainBg }}>
      {/* Sidebar */}
      <nav className="d-flex flex-column align-items-center align-items-md-stretch shadow-sm" style={{ minWidth: sidebarOpen ? 200 : 64, width: sidebarOpen ? 200 : 64, transition: 'width 0.2s', zIndex: 1000, background: colors.sidebarBg, color: colors.sidebarText, borderRight: `1px solid ${colors.border}` }}>
        <div className="d-flex flex-column align-items-center py-4" style={{ minHeight: 80 }}>
          <img src="/logo.jpg" alt="logo" style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: 8, cursor: 'pointer' }} onClick={() => setSidebarOpen(!sidebarOpen)} />
          <button className="btn btn-link p-0" style={{ color: brandColor, fontSize: 24 }} onClick={() => setSidebarOpen(!sidebarOpen)}><FaBars /></button>
        </div>
        <ul className="nav flex-column w-100" style={{ marginTop: 24 }}>
          {sidebarItems.map((item, idx) => (
            <li key={item.name} className="nav-item">
              <button
                className={`nav-link d-flex align-items-center w-100 ${active === idx ? 'active' : ''}`}
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
                  justifyContent: sidebarOpen ? 'flex-start' : 'center'
                }}
                onClick={() => setActive(idx)}
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
        {/* Header */}
        <header className="d-flex align-items-center justify-content-between px-4 py-3 shadow-sm" style={{ minHeight: 72, background: colors.headerBg, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>
          <div className="d-flex align-items-center">
            <img src="/logo.jpg" alt="logo" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }} />
            <h2 className="fw-bold mb-0" style={{ color: brandColor, letterSpacing: 1 }}>Sublite</h2>
          </div>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-secondary me-2"
              style={{ borderRadius: 24, fontSize: 20 }}
              onClick={() => setDarkMode(dm => !dm)}
              aria-label="Toggle dark mode"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            {userName && (
              <span className="d-flex align-items-center ms-2">
                <span style={{
                  width: 36, height: 36, borderRadius: '50%', background: brandColor, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18, marginRight: 8
                }}>{getInitials(userName)}</span>
                <span style={{ fontWeight: 500 }}>{userName}</span>
              </span>
            )}
            {isAuthenticated && (
              <button className="btn btn-link ms-3 text-danger" title="Logout" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('userName'); navigate('/login'); }}><FaSignOutAlt size={22} /></button>
            )}
          </div>
        </header>
        {/* Main Content Area */}
        <main className="flex-grow-1 p-4" style={{ background: colors.mainBg, color: colors.text, minHeight: 0 }}>
          <div className="container-fluid">
            {active === 0 && <Dashboard colors={colors} />}
            {active === 1 && <MySubscriptions />}
            {active === 2 && <Wallet />}
            {active === 3 && <Profile />}
            {active === 4 && <Reviews />}
            {active === 5 && <Support />}
            {active === 6 && <Search />}
          </div>
        </main>
      </div>
    </div>
  );
}

// Placeholder components for each page
function Dashboard({ colors }) {
  return (
    <div className="row g-4">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-sm border-0 rounded-4 p-4" style={{ background: colors.cardBg, color: colors.text }}>
          <div className="mb-3" style={{ fontSize: 32, color: brandColor }}><FaThLarge /></div>
          <h5 className="card-title fw-bold mb-2" style={{ color: brandColor }}>Available Plans</h5>
          <div>Browse and book shared subscriptions from providers. (Filters, ratings, price, slots, etc.)</div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-sm border-0 rounded-4 p-4" style={{ background: colors.cardBg, color: colors.text }}>
          <div className="mb-3" style={{ fontSize: 32, color: brandColor }}><FaBook /></div>
          <h5 className="card-title fw-bold mb-2" style={{ color: brandColor }}>My Subscriptions</h5>
          <div>View your active and past bookings, status, dates, and access info.</div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-sm border-0 rounded-4 p-4" style={{ background: colors.cardBg, color: colors.text }}>
          <div className="mb-3" style={{ fontSize: 32, color: brandColor }}><FaWallet /></div>
          <h5 className="card-title fw-bold mb-2" style={{ color: brandColor }}>Wallet</h5>
          <div>Check your balance, top up, and view transaction history.</div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-sm border-0 rounded-4 p-4" style={{ background: colors.cardBg, color: colors.text }}>
          <div className="mb-3" style={{ fontSize: 32, color: brandColor }}><FaBell /></div>
          <h5 className="card-title fw-bold mb-2" style={{ color: brandColor }}>Notifications</h5>
          <div>Booking confirmations, reminders, and messages.</div>
        </div>
      </div>
    </div>
  );
}
function MySubscriptions() { return <div>My Subscriptions (active/past bookings, status, dates, access info)</div>; }
function Wallet() { return <div>Wallet (balance, top up, transaction history, refunds)</div>; }
function Profile() { return <div>Profile (edit info, upload pic, view reviews)</div>; }
function Reviews() { return <div>Reviews (leave/view reviews for providers)</div>; }
function Support() { return <div>Support (FAQs, contact, report provider)</div>; }
function Search() { return <div>Search (by platform, price, rating, etc.)</div>; }

export { API_BASE, apiFetch };

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
