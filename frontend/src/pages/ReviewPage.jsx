// Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage'; 

// Firebase imports for Google Signup
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile // Optional: to set display name on signup
} from 'firebase/auth';
import { auth } from '../App';

// Helper to decode custom JWT (from your backend, not strictly needed for signup, but often present for consistency)
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

  // --- Manual Email/Password Registration Handler ---
  const handleEmailPasswordSignup = async (e) => {
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

      console.log('Manual user registered:', email);
      navigate('/login'); // Redirect to login after successful registration

    } catch (err) {
      setError(err.message || 'Failed to connect to server for registration.');
    } finally {
      setLoading(false);
    }
  };

  // --- Google Sign-in/Signup Handler (using Firebase) ---
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Firebase User object

      console.log('Signed up/in with Google (Firebase):', user);

      // Firebase automatically manages the user session and token.
      // UserContext will detect this change via onAuthStateChanged.
      // If user is new (check result.additionalUserInfo.isNewUser), you might
      // make an API call to your backend here to sync custom data like 'username'
      // Example: await fetch(`${API_BASE}/api/users/sync-profile`, {
      //            method: 'POST',
      //            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await user.getIdToken()}` },
      //            body: JSON.stringify({ name: user.displayName, username: user.email.split('@')[0] })
      //          });

      navigate('/dashboard'); // Redirect after successful signup/login

    } catch (err) {
      console.error('Google signup/login error (Firebase):', err.code, err.message);
      let errorMessage = 'Google signup/login failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google popup closed.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another Google popup is open.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Placeholder Functions for other Social Logins ---
  const handleAppleLogin = () => {
    console.log('Initiating Apple Signup...');
    setError('Apple signup is not implemented yet.');
  };

  const handleFacebookLogin = () => {
    console.log('Initiating Facebook Signup...');
    setError('Facebook signup is not implemented yet.');
  };

  return (
    <AuthPage
      pageTitle="Create Account"
      pageSubtitle="Sign up to get started"
      activeTab="signup"
      error={error}
      loading={loading}
      onEmailPasswordSubmit={handleEmailPasswordSignup} // Pass the email/password handler
      onGoogleClick={handleGoogleSignup} // Pass the Firebase Google handler
      handleFacebookLogin={handleFacebookLogin}
      handleAppleLogin={handleAppleLogin}
    >
      <form className="space-y-4"> {/* onSubmit is now handled by AuthPage */}
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