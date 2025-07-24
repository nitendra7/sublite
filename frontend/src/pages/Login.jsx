 import React, { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useUser } from '../context/UserContext';
 import AuthPage from './AuthPage'; // Ensure correct import

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

  /**
  * Handles successful Google login.
  * Receives the credential response from Google, sends it to the backend for verification,
  * and then processes the backend's JWT.
  * @param {object} credentialResponse The response object containing the Google JWT.
  */
  const handleGoogleLoginSuccess = async (credentialResponse) => {
  setLoading(true);
  setError('');
  setAuthError(null);

  try {
  // Send the Google credential (JWT) to your backend for verification
  const res = await fetch(`${API_BASE}/api/auth/google-login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: credentialResponse.credential }),
  });

  const data = await res.json();

  if (!res.ok) {
  throw new Error(data.error || 'Google login failed.');
  }

  // Your backend returns its own JWT, which you save and use for your app's session
  const token = data.accessToken;
  const decoded = jwtDecode(token);
  const userId = decoded.userId || decoded.id || decoded.sub;

  if (!userId) {
  console.error('Decoded token payload:', decoded);
  throw new Error('Google login failed: User ID missing from authentication token.');
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

  /**
  * Handles errors during Google login.
  */
  const handleGoogleLoginError = () => {
  setError('Google login failed. Please try again.');
  setLoading(false);
  };

  // --- Placeholder Functions for other Social Logins ---
  const handleAppleLogin = () => {
  console.log('Initiating Apple Login...');
  setError('Apple login is not implemented yet.');
  };

  const handleFacebookLogin = () => {
  console.log('Initiating Facebook Login...');
  setError('Facebook login is not implemented yet.');
  };

  return (
  <AuthPage // Using AuthPage
  pageTitle="Welcome Back"
  pageSubtitle="Please enter your details"
  activeTab="signin"
  error={error}
  loading={loading}
  handleGoogleSuccess={handleGoogleLoginSuccess}
  handleGoogleError={handleGoogleLoginError}
  handleFacebookLogin={handleFacebookLogin}
  handleAppleLogin={handleAppleLogin}
  >
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
  </AuthPage>
  );
 }

 export default LoginPage;
 