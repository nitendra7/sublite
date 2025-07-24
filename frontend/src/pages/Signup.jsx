import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage'; // Correctly importing AuthPage

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
   * Receives the credential response from Google, sends it to the backend for verification,
   * and then processes the backend's JWT.
   * Note: This assumes your backend's `/api/auth/google-login` endpoint
   * handles both creating a new user if they don't exist and logging them in.
   * @param {object} credentialResponse The response object containing the Google JWT.
   */
  const handleGoogleSignupSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      // Send the Google credential (JWT) to your backend for verification
      const res = await fetch(`${API_BASE}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Google signup/login failed.');
      }

      // Your backend returns its own JWT, which you save and use for your app's session
      const token = data.accessToken;
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id || decoded.sub;

      if (!userId) {
        console.error('Decoded token payload:', decoded);
        throw new Error('Google signup/login failed: User ID missing from authentication token.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      if (decoded.name) localStorage.setItem('userName', decoded.name);

      // After successful signup/login via Google, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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