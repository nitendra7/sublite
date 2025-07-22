import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Facebook } from 'lucide-react';
import { useUser } from '../context/UserContext';

const jwtDecode = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT:', e);
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const token = data.accessToken;
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id || decoded.sub;

      if (!userId) {
        console.error('Decoded token payload:', decoded);
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
        console.error('setAuthError not available to set:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <img
            src="/logo.jpg"
            alt="Sublite Logo"
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
          />
          <span className="text-xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Welcome Back</h2>
        <p className="text-gray-500 mb-6 text-center text-sm">Please enter your details</p>

        <div className="flex mb-6">
          <button className="flex-1 py-2 rounded-l-xl bg-[#2bb6c4] text-white font-semibold shadow-md text-center">
            Sign In
          </button>
          <Link
            to="/register"
            className="flex-1 py-2 rounded-r-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 text-center"
          >
            Signup
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1 text-sm font-medium">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold text-base shadow transition-all duration-200"
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

        <div className="flex gap-4 justify-center">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
            <Apple size={20} className="text-gray-700" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
            <Facebook size={20} className="text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
