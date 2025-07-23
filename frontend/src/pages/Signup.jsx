// Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage'; 

// Import the 'auth' object we exported from App.jsx
import { auth } from '../App';
// Import Firebase Auth methods and Google Provider
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile // Optional: to set display name on signup
} from 'firebase/auth';


// Removed: const jwtDecode = ...
// Removed: const API_BASE = ...

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState(''); // Firebase allows setting displayName
  const [username, setUsername] = useState(''); // Firebase doesn't have a direct 'username' field, you might store this in Firestore/RTDB
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Signed up with email/password:', user);

      // Optional: Set the user's display name after creation
      if (name) {
        await updateProfile(user, {
          displayName: name
        });
        console.log('User display name set:', name);
      }
      // Note: 'username' is not directly supported by Firebase Auth.
      // If you need to store 'username', you'd typically save it to Firestore or Realtime Database
      // after the user signs up. For example:
      // await setDoc(doc(db, "users", user.uid), { username: username, email: user.email, name: user.displayName });

      // Firebase automatically manages the user session.
      // No need to manually set tokens in localStorage here.
      // The UserContext will observe Firebase's onAuthStateChanged.

      navigate('/dashboard'); // Redirect to dashboard after successful registration and auto-login

    } catch (err) {
      console.error('Email/Password signup error:', err.code, err.message);
      let errorMessage = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handles Google Sign-in/Signup using Firebase Auth
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Firebase User object
      console.log('Signed up/in with Google:', user);

      // Firebase handles if the user is new or existing.
      // If new, it creates the account. If existing, it logs them in.
      // You can check `result.additionalUserInfo.isNewUser` if you need to differentiate.

      // Firebase automatically manages the user session.
      // No need to manually set tokens in localStorage here.
      // The UserContext will observe Firebase's onAuthStateChanged.

      navigate('/dashboard'); // Redirect to dashboard after successful signup/login

    } catch (err) {
      console.error('Google signup/login error:', err.code, err.message);
      let errorMessage = 'Google signup/login failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google popup closed by user.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another Google popup is already open.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google login is not enabled in Firebase. Contact support.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // --- Placeholder Functions for other Social Logins ---
  const handleAppleLogin = () => {
    console.log('Initiating Apple Signup...');
    setError('Apple signup is not implemented yet with Firebase.');
  };

  const handleFacebookLogin = () => {
    console.log('Initiating Facebook Signup...');
    setError('Facebook signup is not implemented yet with Firebase.');
  };

  return (
    <AuthPage 
      pageTitle="Create Account"
      pageSubtitle="Sign up to get started"
      activeTab="signup"
      error={error}
      loading={loading}
      onGoogleClick={handleGoogleAuth} // Pass the new Firebase Google handler
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