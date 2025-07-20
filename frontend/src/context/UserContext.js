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

  // Read userId and token directly inside the provider.
  // This helps react to localStorage changes if another part of the app modifies it.
  const currentUserId = localStorage.getItem("userId");
  const currentToken = localStorage.getItem("token");

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
  const fetchUserProfile = useCallback(async () => {
    // If no userId or token, immediately set error and stop loading
    if (!currentUserId || !currentToken) {
      console.warn("UserContext: User ID or Token not found in localStorage. Cannot fetch profile.");
      setError("Please log in to view your profile.");
      setLoading(false);
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors before a new fetch

    try {
      const res = await fetch(`${API_BASE}/api/users/${currentUserId}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      if (!res.ok) {
        // Specifically handle 401 (Unauthorized) or 403 (Forbidden) statuses.
        // This implies the token is invalid or the user doesn't have access.
        if (res.status === 401 || res.status === 403) {
          console.error(`UserContext: Authentication error (${res.status}). Clearing data.`);
          clearAuthData(); // Clear invalid credentials
          throw new Error("Authentication failed. Please log in again.");
        }
        // For other HTTP errors, parse and throw
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("UserContext: Fetched user data successfully:", data);
      setUser(data); // Set the full user object received from the API
    } catch (err) {
      console.error("UserContext: Error fetching user profile:", err.message);
      setError(`Failed to load user profile: ${err.message}`);
      setUser(null); // Clear user data on error
    } finally {
      setLoading(false); // Always set loading to false when fetch completes or fails
    }
  }, [currentUserId, currentToken, clearAuthData]); // Dependencies for useCallback

  // Effect to trigger fetching the user profile when the component mounts
  // or when currentUserId/currentToken changes.
  useEffect(() => {
    // Only attempt fetch if auth data exists, otherwise the `if` block in `fetchUserProfile` handles it.
    if (currentUserId && currentToken) {
      fetchUserProfile();
    } else {
      // If no auth data, explicitly set state to non-loading, no user, and set error.
      setLoading(false);
      setUser(null);
      setError("Please log in to view your profile.");
    }
  }, [currentUserId, currentToken, fetchUserProfile]); // Dependencies for useEffect

  // Function to update the user object within the context directly.
  // This is used by components like ProfilePage after a successful update.
  const updateUserContext = useCallback((updatedUserData) => {
    setUser(prevUser => {
      // If there's no previous user, just set the new data. Otherwise, merge.
      if (!prevUser) return updatedUserData;
      return { ...prevUser, ...updatedUserData };
    });
    // Also update userName in localStorage if it's part of the updated data
    if (updatedUserData.name) {
      localStorage.setItem('userName', updatedUserData.name);
    }
  }, []);

  // Function to allow other components (e.g., Login) to set an authentication-related error.
  const setAuthError = useCallback((message) => {
    setError(message);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consuming components.
  // This ensures consumers only re-render when the actual values they depend on change.
  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    userId: user?._id || currentUserId, // Prefer user._id if available, fallback to currentUserId
    token: currentToken, // Token comes directly from localStorage, managed by Login/Logout
    fetchUserProfile,
    updateUserContext,
    setAuthError,
    clearAuthData,
  }), [user, loading, error, currentUserId, currentToken, fetchUserProfile, updateUserContext, setAuthError, clearAuthData]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};