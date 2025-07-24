// src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

// Create the Context with default values.
const UserContext = createContext({
  user: null, // Fetched user data
  loading: true, // Data loading state
  error: null, // Error message
  fetchUserProfile: () => {}, // Function to trigger profile fetch
  updateUserContext: () => {}, // Function to update user data in context
  setAuthError: () => {}, // Function to set authentication errors
  clearAuthData: () => {}, // Function to clear user data and token
  userId: null, // User's ID
  token: null, // Authentication token
});

// Helper hook to consume the context, ensuring it's used within a Provider.
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// UserProvider Component: Provides user authentication and profile data to its children.
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://sublite-wmu2.onrender.com';

  // Clears all authentication-related data from localStorage and context.
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  // Fetches the user profile from the backend.
  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    const userIdToFetch = localStorage.getItem("userId");
    const tokenToFetch = localStorage.getItem("token");

    if (!userIdToFetch || !tokenToFetch) {
      setError("Please log in to view your profile.");
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${tokenToFetch}` }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearAuthData();
          throw new Error("Authentication failed. Please log in again.");
        }
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError(`Failed to load user profile: ${err.message}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);

  // Effect to trigger fetching the user profile when the component mounts.
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
  }, [fetchUserProfile]);

  // Updates the user object within the context directly.
  const updateUserContext = useCallback((updatedUserData) => {
    setUser(prevUser => {
      if (!prevUser) return updatedUserData;
      return { ...prevUser, ...updatedUserData };
    });
    if (updatedUserData.name) {
      localStorage.setItem('userName', updatedUserData.name);
    }
  }, []);

  // Allows other components to set an authentication-related error.
  const setAuthError = useCallback((message) => {
    setError(message);
  }, []);

  // Memoizes the context value to prevent unnecessary re-renders.
  const contextValue = useMemo(() => {
    const userIdInContext = localStorage.getItem("userId");
    const tokenInContext = localStorage.getItem("token");

    return {
      user,
      loading,
      error,
      userId: user?._id || userIdInContext,
      token: tokenInContext,
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