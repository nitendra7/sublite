 import React, { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useUser } from '../context/UserContext';
 import AuthPage from './AuthPage';
 import { exchangeGoogleTokenForFirebaseToken } from '../firebase/config';

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
  * Exchanges Google OAuth token for Firebase ID token and onboards user.
  * @param {object} tokenResponse The response object containing the Google access token.
  */
  const handleGoogleLoginSuccess = async (tokenResponse) => {
  setLoading(true);
  setError('');
  setAuthError(null);

  try {
    console.log('Google OAuth Success:', tokenResponse);
    
    // Exchange Google access token for Firebase ID token
    const { idToken, user } = await exchangeGoogleTokenForFirebaseToken(tokenResponse.access_token);
    
    console.log('Firebase user:', user);
    
    // Store Firebase ID token for authentication
    localStorage.setItem('token', idToken);
    localStorage.setItem('userId', user.uid);
    localStorage.setItem('userName', user.displayName || user.email);
    
    // Onboard user profile to MongoDB
    const onboardRes = await fetch(`${API_BASE}/api/users/onboard-profile`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        username: user.email.split('@')[0] // Generate username from email
      })
    });

    if (!onboardRes.ok) {
      const onboardData = await onboardRes.json();
      throw new Error(onboardData.message || 'Failed to sync user profile');
    }

    // Fetch user profile and navigate to dashboard
    fetchUserProfile();
    navigate('/dashboard');
  } catch (err) {
    console.error('Google login error:', err);
    setError(err.message || 'Google login failed. Please try again.');
    if (setAuthError) {
      setAuthError(err.message);
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
 