import React, { useState, createContext, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Facebook } from 'lucide-react'; // Import Lucide icons

// Inline jwtDecode function to avoid external dependency
const jwtDecode = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT:", e);
    return {};
  }
};

// SubliteLogo SVG component (re-introduced)
function SubliteLogo() {
  // Simple stylized S logo SVG
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#2bb6c4" />
      <path d="M14 28c0 2.5 2.5 4 6 4s6-1.5 6-4-2.5-3-6-3-6-1-6-4 2.5-4 6-4 6 1.5 6 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="2" fill="#fff"/>
    </svg>
  );
}

// UserContext definition (moved inline)
const UserContext = createContext(null);

// UserProvider component (moved inline)
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // This function would typically fetch user profile from an API
  // For this example, it simulates fetching and setting user data
  const fetchUserProfile = async (userId, token) => {
    setLoadingUser(true);
    try {
      // Simulate API call to get user profile
      // In a real app, you would fetch from `${API_BASE}/api/users/${userId}`
      const response = await new Promise(resolve => setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve({
            userId: userId,
            email: "user@example.com", // Placeholder
            name: "Test User" // Placeholder
          })
        });
      }, 500));

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Store user data
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setAuthError(err.message);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    // On component mount, try to load user from localStorage
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUserId) {
      // Re-fetch user profile to validate token and get fresh data
      fetchUserProfile(storedUserId, storedToken);
    } else {
      setLoadingUser(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, authError, setAuthError, fetchUserProfile, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext (moved inline)
const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const API_BASE = 'https://sublite-wmu2.onrender.com';

function LoginPage() {
  const navigate = useNavigate();
  // Destructure setAuthError and fetchUserProfile from the UserContext
  const { setAuthError, fetchUserProfile } = useUser();

  // State variables for email, password, error messages, and loading status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Local error for login form
  const [loading, setLoading] = useState(false);

  // Handles the form submission for user login
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state to true
    setError(''); // Clear any previous local errors
    setAuthError(null); // Clear any previous authentication errors from context

    try {
      // Make a POST request to the login API endpoint
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) // Send email and password in the request body
      });

      // Parse the JSON response
      const data = await res.json();

      // If the response is not OK (e.g., status code 4xx or 5xx), throw an error
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Extract the accessToken from the successful response
      const token = data.accessToken;
      // Decode the JWT token to get its payload
      const decoded = jwtDecode(token);

      // Extract the userId from the decoded token payload
      // It might be named 'userId', 'id', or 'sub' depending on your token structure
      const userId = decoded.userId || decoded.id || decoded.sub;

      // If userId is not found in the decoded token, log an error and throw
      if (!userId) {
        console.error("Decoded token payload:", decoded);
        throw new Error('Login failed: User ID missing from authentication token.');
      }

      // Store the token and userId in localStorage for persistence
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      // Store userName if available in the decoded token
      if (decoded.name) localStorage.setItem('userName', decoded.name);

      // Call fetchUserProfile from UserContext to update global user state
      // Pass the new userId and token directly to ensure the context updates correctly
      await fetchUserProfile(userId, token);

      // Navigate to the dashboard page after successful login and profile fetch
      navigate('/dashboard');
    } catch (err) {
      // Catch any errors during the login process
      setError(err.message); // Set local error message
      setAuthError(err.message); // Set authentication error in context
    } finally {
      setLoading(false); // Reset loading state to false
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-2">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in">
        {/* Left: Login Form Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            {/* Re-using the SubliteLogo SVG component */}
            <SubliteLogo />
            <span className="text-2xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Please enter your details</p>
          <div className="flex mb-6">
            {/* Active 'Sign In' button */}
            <button className="flex-1 py-2 rounded-l-xl bg-[#2bb6c4] text-white font-semibold shadow-md text-center transition-colors">Sign In</button>
            {/* Inactive 'Signup' link */}
            <Link to="/register" className="flex-1 py-2 rounded-r-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-center">Signup</Link>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-600 mb-1 font-medium">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1 font-medium">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold text-lg shadow transition-all duration-200"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Continue'}
            </button>
          </form>
          <div className="my-6 flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">Or Continue With</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex gap-4 justify-center mb-2">
            {/* Social login buttons with Lucide icons */}
            <button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
              <Apple size={24} className="text-gray-700" /> {/* Apple icon from Lucide */}
            </button>
            <button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:scale-105 transition">
              <Facebook size={24} className="text-blue-600" /> {/* Facebook icon from Lucide */}
            </button>
          </div>
        </div>
        {/* Right: Illustration Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#81d4fa] items-center justify-center relative">
          {/* Using /sub.png directly from the public folder for the illustration */}
          <img
            src="/sub.png"
            alt="Sublite Logo Illustration"
            className="w-full h-auto object-contain drop-shadow-xl animate-float"
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
}

// Main App component to render LoginPage with UserProvider
const App = () => {
  return (
    <UserProvider>
      <LoginPage />
    </UserProvider>
  );
};

export default App;