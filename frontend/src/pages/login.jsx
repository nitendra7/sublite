import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = 'https://sublite-wmu2.onrender.com';

function SubliteLogo() {
  // Simple stylized S logo SVG
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#2bb6c4" />
      <path d="M14 28c0 2.5 2.5 4 6 4s6-1.5 6-4-2.5-3-6-3-6-1-6-4 2.5-4 6-4 6 1.5 6 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="2" fill="#fff"/>
    </svg>
  );
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-2">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in">
        {/* Left: Login Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <SubliteLogo />
            <span className="text-2xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Please enter your details</p>
          <div className="flex mb-6">
            <button className="flex-1 py-2 rounded-l-xl bg-[#f4f8fa] text-[#2bb6c4] font-semibold shadow-inner">Sign In</button>
            <Link to="/register" className="flex-1 py-2 rounded-r-xl bg-white text-gray-400 font-semibold border border-l-0 border-gray-200 shadow-inner hover:text-[#2bb6c4] transition">Signup</Link>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-600 mb-1 font-medium">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1 font-medium">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold text-lg shadow transition-all duration-200"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Continue'}
            </button>
          </form>
          <div className="my-6 flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">Or Continue With</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex gap-4 justify-center mb-2">
            <button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
              <img src="https://www.svgrepo.com/show/452234/apple.svg" alt="Apple" className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
              <img src="https://www.svgrepo.com/show/475700/facebook-color.svg" alt="Facebook" className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-4 text-center text-gray-400 text-xs">
            Join the millions of smart users who trust us to manage their subscriptions. Log in to access your personalized dashboard, track your portfolio, and make informed decisions.
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#81d4fa] items-center justify-center relative">
          <img
            src="https://cdn3d.iconscout.com/3d/premium/thumb/safe-box-6770327-5587972.png"
            alt="Sublite Safe"
            className="w-80 h-80 object-contain drop-shadow-xl animate-float"
            draggable="false"
          />
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.7s ease both;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-18px);}
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}

export default LoginPage;
