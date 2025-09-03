import React, { useState, useEffect } from "react";
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // For password visibility icons

import api, { API_BASE } from '../utils/api';
// API_BASE comes from api.js and always includes /api/v1, so append /auth/login only

import { useUser } from '../context/UserContext';
export default function AuthPage({ isLogin = true }) {
  const navigate = useNavigate();
  const { rehydrateUserContext } = useUser();
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

  // Modals and their states
  const [showAccountNotFoundModal, setShowAccountNotFoundModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false); // For signup OTP verification
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp, 3=reset

  // OTP for Signup Verification
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');

  // Forgot Password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpLoading, setForgotOtpLoading] = useState(false);
  const [forgotOtpError, setForgotOtpError] = useState("");
  const [forgotOtpSuccess, setForgotOtpSuccess] = useState("");
  const [forgotOtpTimer, setForgotOtpTimer] = useState(30);
  const [forgotResendLoading, setForgotResendLoading] = useState(false);
  const [forgotResendError, setForgotResendError] = useState("");
  const [forgotResendSuccess, setForgotResendSuccess] = useState("");

  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotResetLoading, setForgotResetLoading] = useState(false);
  const [forgotResetError, setForgotResetError] = useState("");
  const [forgotResetSuccess, setForgotResetSuccess] = useState("");

  // Handler for form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Main form submission (Login/Signup)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Debug: check what API_BASE and env is before sending login
        console.log('Login REQUEST — API_BASE:', API_BASE, 'VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
        // Login API call
        const res = await api.post(`/auth/login`, { emailOrUsername: formData.email, password: formData.password });
        const data = res.data;

        // If there's an error, axios throws; catch will handle

        // Store token and user info upon successful login
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('userName', data.user?.name || '');
        localStorage.setItem('userId', data.user?.id || data.user?._id || '');
        console.log('Login successful. Stored:', {
          token: localStorage.getItem('token'),
          userId: localStorage.getItem('userId'),
          userName: localStorage.getItem('userName')
        });
        console.log('Login response data:', data); // Add this debug line
        if (data.user) {
          rehydrateUserContext(data.user, true);
        }
        setSuccess('Login successful!');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 400);
      } else {
        // Signup: simple email validation
        if (!formData.email.includes('@') || !formData.email.includes('.')) {
          setError('Invalid email format.');
          setLoading(false);
          return;
        }
        // Signup API call
        const res = await api.post(`/auth/register`, {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        const data = res.data;

        // If registration is successful, show OTP modal
        setShowOtpModal(true);
        setSuccess(''); // Clear main success message for OTP flow
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification for Signup
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await api.post(`/auth/verify-otp`, {
        email: formData.email,
        otp
      });
      const data = res.data;

      // If backend returns token after OTP verification, store it and navigate
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('userName', data.user?.name || '');
        localStorage.setItem('userId', data.user?.id || data.user?._id || '');
        setOtpSuccess('Email verified! Logging you in...');
        setTimeout(() => { setShowOtpModal(false); navigate('/dashboard'); }, 1500);
      } else {
        // If backend doesn't return token, user needs to log in manually
        setOtpSuccess('Email verified! You can now log in.');
        setTimeout(() => { setShowOtpModal(false); navigate('/login'); }, 1500);
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to connect to the server.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP for Signup
  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendError('');
    setResendSuccess('');
    try {
      // Re-trigger the registration endpoint to send a new OTP
      const res = await api.post(`/auth/register`, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setResendSuccess('OTP resent! Check your email.');
      setOtpTimer(30); // Reset timer
    } catch (err) {
      setResendError(err.message || 'Failed to connect to the server.');
    } finally {
      setResendLoading(false);
    }
  };

  // Forgot Password - Step 1: Send OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");
    try {
      await api.post(`/auth/forgot-password`, { email: forgotEmail });
      setForgotSuccess('OTP sent! Check your email.');
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password - Step 2: Verify OTP
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotOtpLoading(true);
    setForgotOtpError("");
    setForgotOtpSuccess("");
    try {
      await api.post(`/auth/verify-reset-otp`, { email: forgotEmail, otp: forgotOtp });
      setForgotOtpSuccess('OTP verified!');
      setTimeout(() => setForgotStep(3), 500);
    } catch (err) {
      setForgotOtpError(err.message);
    } finally {
      setForgotOtpLoading(false);
    }
  };

  // Forgot Password - Step 2: Resend OTP
  const handleForgotResendOtp = async () => {
    setForgotResendLoading(true);
    setForgotResendError("");
    setForgotResendSuccess("");
    try {
      await api.post(`/auth/forgot-password`, { email: forgotEmail });
      setForgotResendSuccess('OTP resent! Check your email.');
      setForgotOtpTimer(30);
    } catch (err) {
      setForgotResendError(err.message || 'Failed to connect to the server.');
    } finally {
      setForgotResendLoading(false);
    }
  };

  // Forgot Password - Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotResetLoading(true);
    setForgotResetError("");
    setForgotResetSuccess("");
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotResetError('Passwords do not match.');
      setForgotResetLoading(false);
      return;
    }
    try {
      await api.post(`/auth/reset-password`, {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword
      });
      setForgotResetSuccess('Password reset successful! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1); // Reset forgot password flow
        // Clear all forgot password states
        setForgotEmail(""); setForgotOtp(""); setForgotNewPassword(""); setForgotConfirmPassword("");
        setForgotError(""); setForgotSuccess(""); setForgotOtpError(""); setForgotOtpSuccess(""); setForgotResendError(""); setForgotResendSuccess("");
        setForgotResetError(""); setForgotResetSuccess("");
        navigate('/login');
      }, 1500);
    } catch (err) {
      setForgotResetError(err.message);
    } finally {
      setForgotResetLoading(false);
    }
  };

  // OTP timer effect for Signup
  useEffect(() => {
    if (!showOtpModal) return;
    if (otpTimer === 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  // Reset signup OTP timer and errors when OTP modal is shown
  useEffect(() => {
    if (showOtpModal) {
      setOtpTimer(30);
      setResendError('');
      setResendSuccess('');
      setOtpError('');
      setOtpSuccess('');
      setOtp(''); // Clear OTP input on modal open
    }
  }, [showOtpModal]);

  // OTP timer effect for Forgot Password
  useEffect(() => {
    if (!showForgotModal || forgotStep !== 2) return;
    if (forgotOtpTimer === 0) return;
    const interval = setInterval(() => {
      setForgotOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showForgotModal, forgotStep, forgotOtpTimer]);

  // Reset forgot password states on step/modal change
  useEffect(() => {
    if (showForgotModal) {
      if (forgotStep === 1) {
        setForgotEmail("");
        setForgotError("");
        setForgotSuccess("");
      } else if (forgotStep === 2) {
        setForgotOtpTimer(30);
        setForgotResendError("");
        setForgotResendSuccess("");
        setForgotOtpError("");
        setForgotOtpSuccess("");
        setForgotOtp(""); // Clear OTP input on step change
      } else if (forgotStep === 3) {
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotResetError("");
        setForgotResetSuccess("");
      }
    }
  }, [showForgotModal, forgotStep]);


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4 font-inter">
      <div className="w-full max-w-md sm:max-w-md md:max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-6">
          <img
            src="/logos/logo.png"
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
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Full Name</label>
                <Input
                  id="fullName"
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="px-4 py-3 rounded-xl border border-gray-400 dark:border-gray-500 outline-none transition-all duration-200 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Username</label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="px-4 py-3 rounded-xl border border-gray-400 dark:border-gray-500 outline-none transition-all duration-200 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          <div>
            <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{isLogin ? 'Email or Username' : 'Email Address'}</label>
            <Input
              id="emailOrUsername"
              type={isLogin ? 'text' : 'email'}
              name="email"
              placeholder={isLogin ? 'Email or Username' : 'Email Address'}
              className="px-4 py-3 rounded-xl border border-gray-400 dark:border-gray-500 outline-none transition-all duration-200 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                className="px-4 py-3 rounded-xl border border-gray-400 dark:border-gray-500 outline-none transition-all duration-200 pr-10 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 top-0 h-full bg-transparent border-none cursor-pointer px-4 py-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
        <div className="text-center text-gray-400 text-xs mt-4">
          {isLogin ? (
            <>Don't have an account? <Link to="/register" className="text-[#2bb6c4] hover:underline font-semibold">Sign Up</Link></>
          ) : (
            <>Already have an account? <Link to="/login" className="text-[#2bb6c4] hover:underline font-semibold">Sign In</Link></>
          )}
        </div>
      </div>

      {/* Account Not Found Modal */}
      {showAccountNotFoundModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" aria-modal="true" role="dialog">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">No Account Found</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Would you like to sign up instead?</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  setShowAccountNotFoundModal(false);
                  navigate('/register');
                }}
                className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white rounded-xl px-4 py-2"
              >
                Sign Up
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAccountNotFoundModal(false)}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl px-4 py-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" aria-modal="true" role="dialog">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-sm">
            {forgotStep === 1 && (
              <>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Forgot Password</h2>
                <form onSubmit={handleForgotSendOtp}>
                  <div className="mb-4">
                    <label htmlFor="forgotEmail" className="block mb-1 text-gray-600 dark:text-gray-300">Email</label>
                    <Input id="forgotEmail" type="email" className="w-full border rounded-xl px-3 py-2 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                  </div>
                  {forgotError && <div className="text-red-500 mb-2 text-sm">{forgotError}</div>}
                  {forgotSuccess && <div className="text-green-500 mb-2 text-sm">{forgotSuccess}</div>}
                  <div className="flex justify-between items-center">
                    <Button type="button" variant="outline" className="text-gray-500 hover:underline border-none" onClick={() => { setShowForgotModal(false); setForgotStep(1); }} disabled={forgotLoading}>Cancel</Button>
                    <Button type="submit" className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-2 rounded-xl" disabled={forgotLoading}>
                      {forgotLoading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {forgotStep === 2 && (
              <>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Verify OTP</h2>
                <form onSubmit={handleForgotVerifyOtp}>
                  <div className="mb-4">
                    <label htmlFor="forgotOtp" className="block mb-1 text-gray-600 dark:text-gray-300">OTP</label>
                    <Input id="forgotOtp" type="text" className="w-full border rounded-xl px-3 py-2 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]" value={forgotOtp} onChange={e => setForgotOtp(e.target.value)} required maxLength={6} />
                  </div>
                  {forgotOtpError && <div className="text-red-500 mb-2 text-sm">{forgotOtpError}</div>}
                  {forgotOtpSuccess && <div className="text-green-500 mb-2 text-sm">{forgotOtpSuccess}</div>}
                  {forgotResendError && <div className="text-red-500 mb-2 text-sm">{forgotResendError}</div>}
                  {forgotResendSuccess && <div className="text-green-500 mb-2 text-sm">{forgotResendSuccess}</div>}
                  <div className="flex justify-between items-center mb-4">
                    <button
                      type="button"
                      className={`text-[#2bb6c4] font-semibold text-sm ${forgotOtpTimer > 0 || forgotResendLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={forgotOtpTimer > 0 || forgotResendLoading}
                      onClick={handleForgotResendOtp}
                    >
                      Resend OTP {forgotOtpTimer > 0 && `(${forgotOtpTimer}s)`}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button type="button" variant="outline" className="text-gray-500 hover:underline border-none" onClick={() => { setShowForgotModal(false); setForgotStep(1); }} disabled={forgotOtpLoading}>Cancel</Button>
                    <Button type="submit" className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-2 rounded-xl" disabled={forgotOtpLoading}>
                      {forgotOtpLoading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {forgotStep === 3 && (
              <>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Reset Password</h2>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block mb-1 text-gray-600 dark:text-gray-300">New Password</label>
                    <Input id="newPassword" type="password" className="w-full border rounded-xl px-3 py-2 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block mb-1 text-gray-600 dark:text-gray-300">Confirm Password</label>
                    <Input id="confirmPassword" type="password" className="w-full border rounded-xl px-3 py-2 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]" value={forgotConfirmPassword} onChange={e => setForgotConfirmPassword(e.target.value)} required />
                  </div>
                  {forgotResetError && <div className="text-red-500 mb-2 text-sm">{forgotResetError}</div>}
                  {forgotResetSuccess && <div className="text-green-500 mb-2 text-sm">{forgotResetSuccess}</div>}
                  <div className="flex justify-between items-center">
                    <Button type="button" variant="outline" className="text-gray-500 hover:underline border-none" onClick={() => { setShowForgotModal(false); setForgotStep(1); }} disabled={forgotResetLoading}>Cancel</Button>
                    <Button type="submit" className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-2 rounded-xl" disabled={forgotResetLoading}>
                      {forgotResetLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Signup OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" aria-modal="true" role="dialog">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Verify Email</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Enter the OTP sent to your email address: <span className="font-semibold">{formData.email}</span></p>
            <form onSubmit={handleOtpVerification}>
              <div className="mb-4">
                <label htmlFor="signupOtp" className="block mb-1 text-gray-600 dark:text-gray-300">OTP</label>
                <Input id="signupOtp" type="text" className="w-full border rounded-xl px-3 py-2 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} />
              </div>
              {otpError && <div className="text-red-500 mb-2 text-sm">{otpError}</div>}
              {otpSuccess && <div className="text-green-500 mb-2 text-sm">{otpSuccess}</div>}
              {resendError && <div className="text-red-500 mb-2 text-sm">{resendError}</div>}
              {resendSuccess && <div className="text-green-500 mb-2 text-sm">{resendSuccess}</div>}
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  className={`text-[#2bb6c4] font-semibold text-sm ${otpTimer > 0 || resendLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={otpTimer > 0 || resendLoading}
                  onClick={handleResendOtp}
                >
                  Resend OTP {otpTimer > 0 && `(${otpTimer}s)`}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <Button type="button" variant="outline" className="text-gray-500 hover:underline border-none" onClick={() => setShowOtpModal(false)} disabled={otpLoading}>Cancel</Button>
                <Button type="submit" className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-2 rounded-xl" disabled={otpLoading}>
                  {otpLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
