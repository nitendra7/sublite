import React, { useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Categories from './pages/Categories';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Reviews from './pages/Reviews';
import Services from './pages/Services';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Users from './pages/Users';
import Wallet from './pages/Wallet';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <Router>
      <div className={`admin-container${darkMode ? ' dark' : ''}`}>
        <aside className="admin-sidebar">
          <div className="admin-logo">SL</div>
          <nav className="admin-nav">
            <Link to="/" className="active">Dashboard</Link>
            <Link to="/users">Users</Link>
            <Link to="/services">Services</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/payments">Payments</Link>
            <Link to="/reviews">Reviews</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/support">Support</Link>
            <Link to="/wallet">Wallet</Link>
          </nav>
        </aside>
        <div className="admin-main">
          <header className="admin-header">
            <span className="admin-title">Sublite Admin</span>
            <div className="admin-actions">
              <button className="admin-action-btn" title="Toggle Dark Mode" onClick={handleToggleDarkMode}>🌙</button>
              <button className="admin-action-btn" title="Logout">⎋</button>
            </div>
          </header>
          <main className="admin-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/services" element={<Services />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
              <Route path="/wallet" element={<Wallet />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
