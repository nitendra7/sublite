import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
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
        body: JSON.stringify({ name, username, email, password })
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (jsonError) {
          throw new Error(res.statusText || 'Registration request failed');
        }
        throw new Error(errorData.error || 'Registration failed');
      }

      navigate('/login'); // Redirect to login after successful registration

    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles successful Google signup/login.
   * Exchanges Google OAuth token for Firebase ID token and onboards user.
   * @param {object} tokenResponse The response object containing the Google access token.
   */
  const handleGoogleSignupSuccess = async (tokenResponse) => {
    setLoading(true);
    setError('');

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

      // After successful signup/login via Google, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.message || 'Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles errors during Google signup/login.
   */
  const handleGoogleSignupError = () => {
    setError('Google signup/login failed. Please try again.');
    setLoading(false);
  };

  // --- Placeholder Functions for other Social Logins (kept for structure) ---

  const handleAppleLogin = () => {
    console.log('Initiating Apple Signup...');
    setError('Apple signup is not implemented yet.');
  };

  const handleFacebookLogin = () => {
    console.log('Initiating Facebook Signup...');
    setError('Facebook signup is not implemented yet.');
  };

  return (
    <AuthPage // Now using AuthPage to wrap the form
      pageTitle="Create Account"
      pageSubtitle="Sign up to get started"
      activeTab="signup"
      error={error}
      loading={loading}
      handleGoogleSuccess={handleGoogleSignupSuccess}
      handleGoogleError={handleGoogleSignupError}
      handleFacebookLogin={handleFacebookLogin}
      handleAppleLogin={handleAppleLogin}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-all duration-200"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-all duration-200"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-all duration-200"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-all duration-200"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </AuthPage>
  );
}

export default Signup;