// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AuthPage from './AuthPage'; 

// Firebase imports for Google Login
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../App';

// Helper to decode custom JWT (from your backend)
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
  const { fetchUserProfile, setAuthError } = useUser(); // useUser context still useful for fetching user profile after login

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Manual Email/Password Login Handler ---
  const handleEmailPasswordLogin = async (e) => {
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

      // Store custom JWTs from your backend
      localStorage.setItem('customToken', data.accessToken); // Use a distinct name like 'customToken'
      localStorage.setItem('refreshToken', data.refreshToken); // Store refresh token
      localStorage.setItem('userId', data.user.id); // Store your backend's user ID

      // Optionally set user name for display
      if (data.user.name) localStorage.setItem('userName', data.user.name);

      // Now fetch the user's profile which UserContext will handle
      await fetchUserProfile(data.user.id, data.accessToken, 'custom_jwt'); // Pass custom token type

      navigate('/dashboard');

    } catch (err) {
      setError(err.message || 'Failed to connect to server for login.');
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Google Sign-in Handler (using Firebase) ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setAuthError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Firebase User object

      console.log('Logged in with Google (Firebase):', user);

      // Firebase automatically manages the user session and token.
      // UserContext will detect this change via onAuthStateChanged.
      // You don't need to manually store tokens from Firebase here.

      // If you need to sync Google user's name/profile to your backend DB,
      // you could make another API call here, passing user.uid and user.getIdToken()
      // e.g., await fetch(`${API_BASE}/api/users/sync-profile`, { ... })

      navigate('/dashboard');

    } catch (err) {
      console.error('Google login error (Firebase):', err.code, err.message);
      let errorMessage = 'Google login failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google login popup closed.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another Google login popup is open.';
      }
      setError(errorMessage);
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
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
    <AuthPage
      pageTitle="Welcome Back"
      pageSubtitle="Please enter your details"
      activeTab="signin"
      error={error}
      loading={loading}
      onEmailPasswordSubmit={handleEmailPasswordLogin} // Pass the email/password handler
      onGoogleClick={handleGoogleLogin} // Pass the Firebase Google handler
      handleFacebookLogin={handleFacebookLogin}
      handleAppleLogin={handleAppleLogin}
    >
      <form className="space-y-4"> {/* onSubmit is now handled by AuthPage */}
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