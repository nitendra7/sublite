import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Eye, EyeOff } from 'lucide-react';

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

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function LoginPage() {
  const navigate = useNavigate();
  const { setAuthError, fetchUserProfile } = useUser();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (setAuthError) setAuthError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setError('Unexpected server response. Please try again later.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          setError('Invalid credentials. Please check your email/username and password.');
        } else if (res.status === 403) {
          setError('Your account has been deactivated.');
        } else {
          setError(data.message || 'Login failed');
        }
        setLoading(false);
        return;
      }

      const token = data.accessToken;
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id;
      if (!userId) {
        setError('Login failed: User ID missing from authentication token.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', data.user?.name || '');
      if (fetchUserProfile) fetchUserProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      if (forgotStep === 1) {
        const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail })
        });
        let data;
        try {
          data = await res.json();
        } catch {
          setForgotError('Unexpected server response. Please try again later.');
          setForgotLoading(false);
          return;
        }
        if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
        setForgotSuccess('OTP sent to your email.');
        setForgotStep(2);
      } else if (forgotStep === 2) {
        const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail, otp: forgotOtp })
        });
        let data;
        try {
          data = await res.json();
        } catch {
          setForgotError('Unexpected server response. Please try again later.');
          setForgotLoading(false);
          return;
        }
        if (!res.ok) throw new Error(data.message || 'OTP verification failed.');
        setForgotSuccess('OTP verified. Please enter your new password.');
        setForgotStep(3);
      } else if (forgotStep === 3) {
        const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword: forgotNewPassword })
        });
        let data;
        try {
          data = await res.json();
        } catch {
          setForgotError('Unexpected server response. Please try again later.');
          setForgotLoading(false);
          return;
        }
        if (!res.ok) throw new Error(data.message || 'Password reset failed.');
        setForgotSuccess('Password reset successful! You can now log in.');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotEmail('');
          setForgotOtp('');
          setForgotNewPassword('');
          setForgotError('');
          setForgotSuccess('');
        }, 2000);
      }
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <img
            src="/logo.jpg"
            alt="Sublite Logo"
            className="w-12 h-12 rounded-full"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/48x48/2bb6c4/ffffff?text=SL'; }}
          />
          <span className="text-2xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-1">Welcome Back</h2>
        <p className="text-center text-gray-500 dark:text-gray-300 mb-6 text-sm">Please enter your details</p>

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
              type="text"
              placeholder="Email or Username"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-all duration-200"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 top-0 h-full bg-transparent border-none cursor-pointer px-4 py-3 flex items-center"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end mb-4 mt-1">
            <button
              type="button"
              className="text-sm font-semibold focus:outline-none transition-colors duration-150 text-[#2bb6c4] hover:text-[#1ea1b0] dark:text-[#5ed1dc] dark:hover:text-[#2bb6c4] underline"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        {error && <div className="text-red-500 text-center mt-4">{error}</div>}

        {showSignupDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg text-center">
              <h2 className="text-lg font-semibold mb-2">No account found</h2>
              <p className="mb-4">Would you like to sign up?</p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => setShowSignupDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-gray-400 text-xs mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#2bb6c4] hover:underline font-semibold">Sign Up</Link>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
              {forgotStep === 1 && (
                <div className="mb-4">
                  <label className="block mb-1">Email</label>
                  <input type="email" className="w-full border rounded px-3 py-2" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                </div>
              )}
              {forgotStep === 2 && (
                <div className="mb-4">
                  <label className="block mb-1">Enter OTP sent to your email</label>
                  <input type="text" className="w-full border rounded px-3 py-2" value={forgotOtp} onChange={e => setForgotOtp(e.target.value)} required />
                </div>
              )}
              {forgotStep === 3 && (
                <div className="mb-4">
                  <label className="block mb-1">New Password</label>
                  <input type="password" className="w-full border rounded px-3 py-2" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} required />
                </div>
              )}
              {forgotError && <div className="text-red-500 mb-2">{forgotError}</div>}
              {forgotSuccess && <div className="text-green-500 mb-2">{forgotSuccess}</div>}
              <div className="flex justify-between items-center">
                <button type="button" className="text-gray-500 hover:underline" onClick={() => setShowForgotModal(false)} disabled={forgotLoading}>Cancel</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={forgotLoading}>
                  {forgotStep === 1 ? 'Send OTP' : forgotStep === 2 ? 'Verify OTP' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
 