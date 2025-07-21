import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

// 1. Create the Context
const UserContext = createContext({
  user: null, // The fetched user data object (e.g., { _id, name, username, email, image })
  loading: true, // Indicates if user data is currently being loaded
  error: null, // Stores any error message related to user context
  fetchUserProfile: () => {}, // Function to manually trigger a profile fetch
  updateUserContext: () => {}, // Function to update the user object in context
  setAuthError: () => {}, // Function to set a global authentication error message
  clearAuthData: () => {}, // Function to clear user data and token from localStorage and context
  userId: null, // Convenience property for the user's ID
  token: null, // Convenience property for the authentication token
});

// Helper hook to consume the context, ensuring it's used within a Provider
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// 2. Create the Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For errors during initial fetch or authentication issues

  const API_BASE = 'https://sublite-wmu2.onrender.com';

  // Function to clear all authentication-related data
  const clearAuthData = useCallback(() => {
    console.log("UserContext: Clearing authentication data.");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userName"); // Also clear userName from Dashboard
    setUser(null);
    setError(null);
    setLoading(false); // No longer loading user if no auth data
  }, []);

  // Function to fetch the user profile from the backend
  // It now reads userId and token directly inside the function when called
  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors before a new fetch

    const userIdToFetch = localStorage.getItem("userId"); // Read inside useCallback
    const tokenToFetch = localStorage.getItem("token");   // Read inside useCallback

    if (!userIdToFetch || !tokenToFetch) {
      console.warn("UserContext: User ID or Token not found in localStorage during fetch attempt. Cannot fetch profile.");
      // No need to clearAuthData here, as there's nothing to clear or it was just cleared.
      setError("Please log in to view your profile.");
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/${userIdToFetch}`, {
        headers: { Authorization: `Bearer ${tokenToFetch}` }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.error(`UserContext: Authentication error (${res.status}). Clearing data.`);
          clearAuthData(); // Clear invalid credentials
          throw new Error("Authentication failed. Please log in again.");
        }
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("UserContext: Fetched user data successfully:", data);
      setUser(data);
    } catch (err) {
      console.error("UserContext: Error fetching user profile:", err.message);
      setError(`Failed to load user profile: ${err.message}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]); // Dependencies for useCallback: only clearAuthData

  // Effect to trigger fetching the user profile when the component mounts
  // or when the token/userId *in localStorage* might have changed (indirectly via a re-render)
  // We'll use a simple check for localStorage existence.
  useEffect(() => {
    const initialUserId = localStorage.getItem("userId");
    const initialToken = localStorage.getItem("token");

    if (initialUserId && initialToken) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setUser(null);
      setError("Please log in to view your profile.");
    }
  }, [fetchUserProfile]); // fetchUserProfile is stable due to useCallback, so it won't re-run endlessly

  // Function to update the user object within the context directly.
  const updateUserContext = useCallback((updatedUserData) => {
    setUser(prevUser => {
      if (!prevUser) return updatedUserData;
      return { ...prevUser, ...updatedUserData };
    });
    if (updatedUserData.name) {
      localStorage.setItem('userName', updatedUserData.name);
    }
  }, []);

  // Function to allow other components (e.g., Login) to set an authentication-related error.
  const setAuthError = useCallback((message) => {
    setError(message);
  }, []);

  // Memoize the context value
  const contextValue = useMemo(() => {
    // Read userId and token for contextValue only, they are not dependencies of fetchUserProfile itself anymore
    const userIdInContext = localStorage.getItem("userId");
    const tokenInContext = localStorage.getItem("token");

    return {
      user,
      loading,
      error,
      userId: user?._id || userIdInContext, // Prefer user._id if available, fallback to localStorage
      token: tokenInContext, // Token comes directly from localStorage
      fetchUserProfile,
      updateUserContext,
      setAuthError,
      clearAuthData,
    };
  }, [user, loading, error, fetchUserProfile, updateUserContext, setAuthError, clearAuthData]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};