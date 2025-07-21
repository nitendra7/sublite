import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Facebook } from 'lucide-react';
import { useUser } from '../context/UserContext';

// Inline jwtDecode function (remains)
const jwtDecode = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT:", e);
    return {};
  }
};

const API_BASE = 'https://sublite-wmu2.onrender.com';

function LoginPage() {
  const navigate = useNavigate();
  const { setAuthError, fetchUserProfile } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const token = data.accessToken;
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id || decoded.sub;

      if (!userId) {
        console.error("Decoded token payload:", decoded);
        throw new Error('Login failed: User ID missing from authentication token.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      if (decoded.name) localStorage.setItem('userName', decoded.name);

      fetchUserProfile();

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      if (setAuthError) {
        setAuthError(err.message);
      } else {
        console.error("setAuthError not available to set:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-2">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in">
        {/* Left: Login Form Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            {/* Logo remains <img> */}
            <img
              src="/logo.jpg"
              alt="Sublite Logo"
              style={{ width: '48px', height: '48px', borderRadius: '50%' }}
            />
            <span className="text-2xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Please enter your details</p>
          {/* REVERTED: Segmented Control Container Styling to previous desired state */}
          <div className="flex mb-6">
            {/* ACTIVE Sign In button (matching Signup.jsx's active state, but for 'Sign In') */}
            <button className="flex-1 py-2 rounded-l-xl bg-[#2bb6c4] text-white font-semibold shadow-md text-center transition-colors">Sign In</button>
            {/* INACTIVE Signup link (matching Signup.jsx's inactive state, but for 'Signup') */}
            <Link to="/register" className="flex-1 py-2 rounded-r-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-center">Signup</Link>
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
              <Apple size={24} className="text-gray-700" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
              <Facebook size={24} className="text-blue-600" />
            </button>
          </div>
        </div>
        {/* Right: Illustration Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#81d4fa] items-center justify-center relative">
          <img
            src="/sub.png"
            alt="Sublite Logo Illustration"
            className="w-full h-auto object-contain drop-shadow-xl animate-float"
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;