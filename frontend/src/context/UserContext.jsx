import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

// 1. Create the Context
const UserContext = createContext({
  user: null,
  loading: true,
  error: null,
  fetchUserProfile: (userId, token) => {}, // Define that the function expects arguments
  updateUserContext: () => {},
  setAuthError: () => {},
  clearAuthData: () => {},
  userId: null,
  token: null,
});

// Helper hook to consume the context
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
  const [error, setError] = useState(null);

  const API_BASE = 'https://sublite-wmu2.onrender.com';

  // Function to clear all authentication-related data
  const clearAuthData = useCallback(() => {
    console.log("UserContext: Clearing authentication data.");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  // This function now accepts userId and token as arguments to avoid stale state issues.
  const fetchUserProfile = useCallback(async (userId, token) => {
    // If the required arguments aren't provided, we can't proceed.
    if (!userId || !token) {
      console.warn("UserContext: User ID or Token not provided to fetchUserProfile.");
      setError("Please log in to view your profile.");
      setLoading(false);
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the passed-in arguments directly for the API call
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.error(`UserContext: Authentication error (${res.status}). Clearing data.`);
          clearAuthData();
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
  }, [clearAuthData]);

  // This effect handles the initial load when the app starts or the page is refreshed.
  useEffect(() => {
    const currentUserId = localStorage.getItem("userId");
    const currentToken = localStorage.getItem("token");

    if (currentUserId && currentToken) {
      // On initial load, call fetchUserProfile with the values found in localStorage.
      fetchUserProfile(currentUserId, currentToken);
    } else {
      // If no auth data is found on load, stop loading and set an appropriate message.
      setLoading(false);
      setUser(null);
      setError("Please log in to view your profile.");
    }
  }, [fetchUserProfile]); // Runs once on initial component mount

  const updateUserContext = useCallback((updatedUserData) => {
    setUser(prevUser => {
      if (!prevUser) return updatedUserData;
      return { ...prevUser, ...updatedUserData };
    });
    if (updatedUserData.name) {
      localStorage.setItem('userName', updatedUserData.name);
    }
  }, []);

  const setAuthError = useCallback((message) => {
    setError(message);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    userId: user?._id || localStorage.getItem("userId"),
    token: localStorage.getItem("token"),
    fetchUserProfile,
    updateUserContext,
    setAuthError,
    clearAuthData,
  }), [user, loading, error, fetchUserProfile, updateUserContext, setAuthError, clearAuthData]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};