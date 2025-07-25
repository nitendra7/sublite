import React, { useState } from "react";
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function AuthPage({ isLogin = true }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAccountNotFoundModal, setShowAccountNotFoundModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const { darkMode, toggleDarkMode } = useTheme();
  // Add state for OTP modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Login API call
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrUsername: formData.email, password: formData.password })
        });
        let data;
        try { data = await res.json(); } catch { setError('Unexpected server response.'); setLoading(false); return; }
        if (!res.ok) {
          if (res.status === 401) {
            setShowAccountNotFoundModal(true);
          } else {
            setError(data.message || 'Login failed');
          }
          setLoading(false);
          return;
        }
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('userName', data.user?.name || '');
        setSuccess('Login successful!');
        setTimeout(() => { navigate('/dashboard'); }, 1000);
      } else {
        // Signup: simple email validation
        if (!formData.email.includes('@') || !formData.email.includes('.')) {
          setError('Invalid email format.');
          setLoading(false);
          return;
        }
        // Signup API call
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, username: formData.username, email: formData.email, password: formData.password })
        });
        let data;
        try { data = await res.json(); } catch { setError('Unexpected server response.'); setLoading(false); return; }
        if (!res.ok) {
          setError(data.message || 'Registration failed');
          setLoading(false);
          return;
        }
        setShowOtpModal(true);
        setSuccess('');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // OTP timer effect
  React.useEffect(() => {
    if (!showOtpModal) return;
    if (otpTimer === 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  // When OTP modal is shown, reset timer
  React.useEffect(() => {
    if (showOtpModal) {
      setOtpTimer(30);
      setResendError('');
      setResendSuccess('');
    }
  }, [showOtpModal]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md sm:max-w-md md:max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-6">
          <img
            src="/logo.jpg"
            alt="Sublite Logo"
            className="w-12 h-12 rounded-full"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/48x48/2bb6c4/ffffff?text=SL'; }}
          />
          <span className="text-2xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-1">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-gray-500 dark:text-gray-300 mb-6 text-sm">{isLogin ? 'Please enter your details' : 'Sign up to get started'}</p>
        <div className="flex mb-5 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <Button
            asChild
            className={`flex-1 py-2 font-semibold text-center rounded-none ${isLogin ? 'bg-[#2bb6c4] text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'} shadow-none border-none`}
          >
            <Link to="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className={`flex-1 py-2 font-semibold text-center rounded-none ${!isLogin ? 'bg-[#2bb6c4] text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'} shadow-none border-none`}
          >
            <Link to="/register">Signup</Link>
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Full Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="px-4 py-3 rounded-xl border border-gray-400 dark:border-gray-500 outline-none transition-all duration-200"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Username</label>
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="px-4 py-3 rounded-xl border border-gray-400 dark:border-gray-500 outline-none transition-all duration-200"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{isLogin ? 'Email or Username' : 'Email Address'}</label>
            <Input
              type={isLogin ? 'text' : 'email'}
              name="email"
              placeholder={isLogin ? 'Email or Username' : 'Email Address'}
              className="px-4 py-3 rounded-xl border border-gray-400 dark:border-gray-500 outline-none transition-all duration-200"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Password</label>
            <div style={{ position: 'relative' }}>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                className="px-4 py-3 rounded-xl border border-gray-400 dark:border-gray-500 outline-none transition-all duration-200 pr-10"
                value={formData.password}
                onChange={handleChange}
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
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.02c2.64 4.663 7.03 7.477 10.066 7.477 1.523 0 3.06-.457 4.534-1.254M21.07 15.977A10.45 10.45 0 0022.066 12.02c-2.64-4.663-7.03-7.477-10.066-7.477-1.523 0-3.06.457-4.534 1.254M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75L18 12m0 0l-2.25 2.25M18 12H6" /></svg>
                )}
              </button>
            </div>
          </div>
          {isLogin && (
            <div className="flex justify-end mb-2">
              <button type="button" className="text-sm text-[#2bb6c4] hover:underline font-semibold focus:outline-none" onClick={() => setShowForgotModal(true)}>
                Forgot Password?
              </button>
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white py-2 rounded-xl font-semibold shadow-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (isLogin ? 'Logging in...' : 'Signing Up...') : (isLogin ? 'Continue' : 'Sign Up')}
          </Button>
        </form>
        {success && <div className="text-green-600 text-center mt-4">{success}</div>}
        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
        <div className="text-center text-gray-400 text-xs mt-4">
          {isLogin ? (
            <>Don't have an account? <Link to="/register" className="text-[#2bb6c4] hover:underline font-semibold">Sign Up</Link></>
          ) : (
            <>Already have an account? <Link to="/login" className="text-[#2bb6c4] hover:underline font-semibold">Sign In</Link></>
          )}
        </div>
      </div>
      {showAccountNotFoundModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg text-center w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">No Account Found</h2>
            <p className="mb-4">Would you like to sign up instead?</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  setShowAccountNotFoundModal(false);
                  navigate('/register');
                }}
                className="bg-[#2bb6c4] text-white"
              >
                Sign Up
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAccountNotFoundModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Forgot Password</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setForgotLoading(true);
              setForgotError("");
              setForgotSuccess("");
              try {
                const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: forgotEmail })
                });
                let data;
                try { data = await res.json(); } catch { setForgotError('Unexpected server response.'); setForgotLoading(false); return; }
                if (!res.ok) throw new Error(data.message || 'Failed to send reset email.');
                setForgotSuccess('OTP sent! Check your email.');
                setResetEmail(forgotEmail);
                setShowResetModal(true);
              } catch (err) {
                setForgotError(err.message);
              } finally {
                setForgotLoading(false);
              }
            }}>
              <div className="mb-4">
                <label className="block mb-1">Email</label>
                <Input type="email" className="w-full border rounded px-3 py-2" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
              </div>
              {forgotError && <div className="text-red-500 mb-2">{forgotError}</div>}
              {forgotSuccess && <div className="text-green-500 mb-2">{forgotSuccess}</div>}
              <div className="flex justify-between items-center">
                <button type="button" className="text-gray-500 hover:underline" onClick={() => setShowForgotModal(false)} disabled={forgotLoading}>Cancel</button>
                <button type="submit" className="bg-[#2bb6c4] text-white px-4 py-2 rounded" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showResetModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Reset Password</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setResetLoading(true);
              setResetError("");
              setResetSuccess("");
              try {
                const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword: resetPassword })
                });
                let data;
                try { data = await res.json(); } catch { setResetError('Unexpected server response.'); setResetLoading(false); return; }
                if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
                setResetSuccess('Password reset successful! You can now log in.');
                setTimeout(() => {
                  setShowResetModal(false);
                  setShowForgotModal(false);
                  setResetEmail(""); setResetOtp(""); setResetPassword("");
                  setForgotEmail(""); setForgotSuccess(""); setForgotError("");
                  navigate('/login');
                }, 1500);
              } catch (err) {
                setResetError(err.message);
              } finally {
                setResetLoading(false);
              }
            }}>
              <div className="mb-4">
                <label className="block mb-1">Email</label>
                <Input type="email" className="w-full border rounded px-3 py-2" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
              </div>
              <div className="mb-4">
                <label className="block mb-1">OTP</label>
                <Input type="text" className="w-full border rounded px-3 py-2" value={resetOtp} onChange={e => setResetOtp(e.target.value)} required maxLength={6} />
              </div>
              <div className="mb-4">
                <label className="block mb-1">New Password</label>
                <Input type="password" className="w-full border rounded px-3 py-2" value={resetPassword} onChange={e => setResetPassword(e.target.value)} required />
              </div>
              {resetError && <div className="text-red-500 mb-2">{resetError}</div>}
              {resetSuccess && <div className="text-green-500 mb-2">{resetSuccess}</div>}
              <div className="flex justify-between items-center">
                <button type="button" className="text-gray-500 hover:underline" onClick={() => setShowResetModal(false)} disabled={resetLoading}>Cancel</button>
                <button type="submit" className="bg-[#2bb6c4] text-white px-4 py-2 rounded" disabled={resetLoading}>
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg text-center w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Verify Email</h2>
            <p className="mb-4">Enter the OTP sent to your email address.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setOtpLoading(true);
              setOtpError('');
              setOtpSuccess('');
              try {
                const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: formData.email, otp })
                });
                let data;
                try { data = await res.json(); } catch { setOtpError('Unexpected server response.'); setOtpLoading(false); return; }
                if (!res.ok) {
                  setOtpError(data.message || 'OTP verification failed');
                  setOtpLoading(false);
                  return;
                }
                setOtpSuccess('Email verified! You can now log in.');
                setTimeout(() => { setShowOtpModal(false); navigate('/login'); }, 1500);
              } catch (err) {
                setOtpError(err.message || 'Failed to connect to the server.');
              } finally {
                setOtpLoading(false);
              }
            }}>
              <div className="mb-4">
                <label className="block mb-1">OTP</label>
                <Input type="text" className="w-full border rounded px-3 py-2" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} />
              </div>
              {otpError && <div className="text-red-500 mb-2">{otpError}</div>}
              {otpSuccess && <div className="text-green-500 mb-2">{otpSuccess}</div>}
              {resendError && <div className="text-red-500 mb-2">{resendError}</div>}
              {resendSuccess && <div className="text-green-500 mb-2">{resendSuccess}</div>}
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  className={`text-[#2bb6c4] font-semibold ${otpTimer > 0 || resendLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={otpTimer > 0 || resendLoading}
                  onClick={async () => {
                    setResendLoading(true);
                    setResendError('');
                    setResendSuccess('');
                    try {
                      const res = await fetch(`${API_BASE}/api/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: formData.name, username: formData.username, email: formData.email, password: formData.password })
                      });
                      let data;
                      try { data = await res.json(); } catch { setResendError('Unexpected server response.'); setResendLoading(false); return; }
                      if (!res.ok) {
                        setResendError(data.message || 'Failed to resend OTP');
                        setResendLoading(false);
                        return;
                      }
                      setResendSuccess('OTP resent! Check your email.');
                      setOtpTimer(30);
                    } catch (err) {
                      setResendError(err.message || 'Failed to connect to the server.');
                    } finally {
                      setResendLoading(false);
                    }
                  }}
                >
                  Resend OTP {otpTimer > 0 && `(${otpTimer}s)`}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <button type="button" className="text-gray-500 hover:underline" onClick={() => setShowOtpModal(false)} disabled={otpLoading}>Cancel</button>
                <button type="submit" className="bg-[#2bb6c4] text-white px-4 py-2 rounded" disabled={otpLoading}>
                  {otpLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
