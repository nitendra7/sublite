import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Facebook } from 'lucide-react';

const API_BASE = 'https://sublite-wmu2.onrender.com';

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <img
            src="/logo.jpg"
            alt="Sublite Logo"
            className="w-12 h-12 rounded-full"
          />
          <span className="text-2xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Create Account</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Sign up to get started</p>

        <div className="flex mb-5 rounded-xl overflow-hidden">
          <Link
            to="/login"
            className="flex-1 py-2 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 text-center transition"
          >
            Sign In
          </Link>
          <button className="flex-1 py-2 bg-[#2bb6c4] text-white font-semibold text-center shadow-md">
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold shadow transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">Or Continue With</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex gap-4 justify-center mb-4">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
            <Apple size={20} className="text-gray-700" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
            <Facebook size={20} className="text-blue-600" />
          </button>
        </div>

        <div className="text-center text-gray-400 text-xs">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2bb6c4] hover:underline">Sign In</Link>
        </div>
      </div>

      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.7s ease both;
          }
        `}
      </style>
    </div>
  );
}

export default Signup;
