import React, { useState } from 'react';
import { FaBell, FaBook, FaCog, FaCreditCard, FaLifeRing, FaMoon, FaStar, FaSun, FaTags, FaThList, FaWallet } from 'react-icons/fa';
import { Navigate, Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import BookingList from './components/BookingList';
import CategoryList from './components/CategoryList';
import NotificationList from './components/NotificationList';
import PaymentList from './components/PaymentList';
import ReviewList from './components/ReviewList';
import ServiceList from './components/ServiceList';
import SettingList from './components/SettingList';
import SupportTicketList from './components/SupportTicketList';
import WalletTransactionList from './components/WalletTransactionList';

const tabs = [
  { name: 'Services', icon: <FaThList className="me-2" />, component: <ServiceList /> },
  { name: 'Bookings', icon: <FaBook className="me-2" />, component: <BookingList /> },
  { name: 'Payments', icon: <FaCreditCard className="me-2" />, component: <PaymentList /> },
  { name: 'Reviews', icon: <FaStar className="me-2" />, component: <ReviewList /> },
  { name: 'Categories', icon: <FaTags className="me-2" />, component: <CategoryList /> },
  { name: 'Notifications', icon: <FaBell className="me-2" />, component: <NotificationList /> },
  { name: 'Support Tickets', icon: <FaLifeRing className="me-2" />, component: <SupportTicketList /> },
  { name: 'Wallet Transactions', icon: <FaWallet className="me-2" />, component: <WalletTransactionList /> },
  { name: 'Settings', icon: <FaCog className="me-2" />, component: <SettingList /> },
];

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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.accessToken);
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
      const res = await fetch('/api/auth/register', {
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

function MainApp() {
  const [tab, setTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const mainBg = darkMode ? '#181a1b' : '#f8fafc';
  const cardBg = darkMode ? '#23272b' : '#fff';
  const textColor = darkMode ? '#f3f4f6' : '#222';
  const accent = darkMode ? '#60a5fa' : '#2563eb';
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <div className={`container-fluid p-4${darkMode ? ' dark-mode' : ''}`} style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: mainBg, color: textColor }}>
      <div className="mb-4" style={{
        background: darkMode ? 'linear-gradient(90deg, #23272b 0%, #2563eb 100%)' : 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
        borderRadius: '1rem',
        padding: '2rem 2rem 1.5rem 2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
        color: darkMode ? '#f3f4f6' : '#fff'
      }}>
        <div className="d-flex align-items-center mb-3 justify-content-between">
          <div className="d-flex align-items-center">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="logo" style={{ width: 56, height: 56, marginRight: 16, borderRadius: '50%', background: '#fff', padding: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
            <h1 className="display-3 fw-bold mb-0" style={{ color: 'inherit', letterSpacing: '2px' }}>SubLite</h1>
          </div>
          <div>
            <button
              className="btn btn-outline-light ms-2"
              style={{ borderRadius: 24, fontSize: 24, background: darkMode ? '#23272b' : 'rgba(255,255,255,0.15)', color: darkMode ? '#f3f4f6' : '#fff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
              onClick={() => setDarkMode(dm => !dm)}
              aria-label="Toggle dark mode"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            {isAuthenticated ? (
              <button className="btn btn-outline-light ms-2" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Logout</button>
            ) : (
              <>
                <button className="btn btn-outline-light ms-2" onClick={() => navigate('/login')}>Login</button>
                <button className="btn btn-outline-light ms-2" onClick={() => navigate('/register')}>Register</button>
              </>
            )}
          </div>
        </div>
        <div className="btn-group flex-wrap" role="group" aria-label="Tabs">
          {tabs.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setTab(i)}
              className={`btn btn-outline-light mb-2 me-2 ${tab === i ? 'active' : ''}`}
              style={{
                fontWeight: tab === i ? 'bold' : 'normal',
                borderWidth: tab === i ? 2 : 1,
                background: tab === i ? '#fff' : 'transparent',
                color: tab === i ? accent : '#fff',
                boxShadow: tab === i ? '0 2px 8px rgba(37,99,235,0.08)' : 'none',
                transition: 'all 0.2s',
                borderRadius: 8
              }}
            >
              {t.icon}{t.name}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 rounded shadow-sm border" style={{ background: cardBg, color: textColor }}>
        {tabs[tab].component}
      </div>
      <style>{`
        .card {
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .card:hover {
          box-shadow: 0 8px 32px rgba(37,99,235,0.15);
          transform: translateY(-4px) scale(1.02);
        }
        .btn-outline-light.active, .btn-outline-light:active {
          background: #fff !important;
          color: #2563eb !important;
          border-color: #fff !important;
        }
        .btn-outline-light:hover {
          background: #e0e7ff !important;
          color: #2563eb !important;
        }
        .dark-mode .btn-outline-light.active, .dark-mode .btn-outline-light:active {
          background: #23272b !important;
          color: #60a5fa !important;
          border-color: #23272b !important;
        }
        .dark-mode .btn-outline-light:hover {
          background: #181a1b !important;
          color: #60a5fa !important;
        }
        .dark-mode .card {
          background: #23272b !important;
          color: #f3f4f6 !important;
          border: none !important;
        }
        .dark-mode .card-title {
          color: #60a5fa !important;
        }
        .dark-mode .bg-success {
          background-color: #22c55e !important;
        }
        .dark-mode .bg-secondary {
          background-color: #64748b !important;
        }
        .dark-mode .bg-warning {
          background-color: #facc15 !important;
        }
        .dark-mode .bg-info {
          background-color: #38bdf8 !important;
        }
        .dark-mode .bg-danger {
          background-color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}

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
