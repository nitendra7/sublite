import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://sublite-wmu2.onrender.com';

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
    if (setAuthError) setAuthError(null);

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
      const userId = decoded.userId || decoded.id;

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
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <img
            src="/logo.jpg"
            alt="Sublite Logo"
            className="w-12 h-12 rounded-full"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/48x48/2bb6c4/ffffff?text=SL'; }}
          />
          <span className="text-2xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Please enter your details</p>

        <div className="flex mb-5 rounded-xl overflow-hidden border border-gray-200">
          <Link
            to="/login"
            className="flex-1 py-2 font-semibold text-center bg-[#2bb6c4] text-white shadow-md"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="flex-1 py-2 font-semibold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
          >
            Signup
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg mt-4">
            {error}
          </div>
        )}

        <div className="text-center text-gray-400 text-xs mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#2bb6c4] hover:underline font-semibold">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
 