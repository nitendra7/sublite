// src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
    console.error('Error decoding custom JWT:', e);
    return {};
  }
};

const UserContext = createContext({
  user: null,
  profileData: null,
  loading: true,
  error: null,
  fetchUserProfile: () => {},
  updateUserContext: () => {},
  setAuthError: () => {},
  logout: () => {},
  userId: null,
  tokenType: null, // To indicate if it's 'firebase' or 'custom_jwt'
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase User object OR decoded custom JWT payload
  const [profileData, setProfileData] = useState(null); // Custom profile data from your backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenType, setTokenType] = useState(null); // 'firebase' or 'custom_jwt'

  const API_BASE = 'https://sublite-wmu2.onrender.com';

  // --- Hybrid Authentication State Listener ---
  useEffect(() => {
    let firebaseUnsubscribe;

    const initializeAuth = async () => {
      setLoading(true);
      setError(null);

      // 1. Listen for Firebase Auth state changes
      firebaseUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Firebase user is logged in (Google/social)
          setUser(firebaseUser);
          setTokenType('firebase');
          await fetchUserProfile(firebaseUser.uid, await firebaseUser.getIdToken(), 'firebase');
        } else {
          // Firebase user is logged out, now check for custom JWT
          const customToken = localStorage.getItem('customToken');
          if (customToken) {
            try {
              const decodedCustom = jwtDecode(customToken);
              // Ensure token is not expired (basic check)
              if (decodedCustom.exp * 1000 > Date.now()) {
                setUser(decodedCustom); // Use decoded custom JWT as user info
                setTokenType('custom_jwt');
                await fetchUserProfile(decodedCustom.id, customToken, 'custom_jwt'); // Pass custom token
              } else {
                // Custom token expired
                clearCustomAuthData();
              }
            } catch (e) {
              console.error("Error decoding stored custom token:", e);
              clearCustomAuthData();
            }
          } else {
            // No Firebase user and no custom token, truly logged out
            setUser(null);
            setProfileData(null);
            setTokenType(null);
          }
        }
        setLoading(false);
      });
    };

    initializeAuth();

    // Cleanup the Firebase subscription on component unmount
    return () => {
      if (firebaseUnsubscribe) firebaseUnsubscribe();
    };
  }, []);

  // Helper to clear custom JWT data
  const clearCustomAuthData = useCallback(() => {
    localStorage.removeItem("userId");
    localStorage.removeItem("customToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    setUser(null);
    setProfileData(null);
    setTokenType(null);
  }, []);


  // Logout function for both types of users
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (auth.currentUser) { // If there's a Firebase user, sign them out
        await signOut(auth);
      }
      clearCustomAuthData(); // Always clear custom JWT data
      console.log("User logged out.");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [clearCustomAuthData]);


  // Fetches the user profile from your backend using the appropriate token.
  const fetchUserProfile = useCallback(async (id, token, type) => {
    if (!id || !token || !type) {
      setError("Not authenticated to fetch profile.");
      setProfileData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { // Assuming your user API uses either Firebase UID or custom ID
        headers: { Authorization: `Bearer ${token}` } // Send the appropriate token
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.warn("Token expired or invalid during profile fetch. Attempting re-authentication.");
          if (type === 'firebase') {
             await signOut(auth); // Force Firebase sign out
          } else { // custom_jwt
             clearCustomAuthData();
          }
          throw new Error("Session expired. Please log in again.");
        }
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setProfileData(data);
      if (data.name) {
        localStorage.setItem('userName', data.name);
      }

    } catch (err) {
      console.error(`Failed to load user profile: ${err.message}`);
      setError(`Failed to load profile: ${err.message}`);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [clearCustomAuthData]); // Include clearCustomAuthData in dependencies


  const updateUserContext = useCallback((updatedUserData) => {
    setProfileData(prevData => {
      if (!prevData) return updatedUserData;
      return { ...prevData, ...updatedUserData };
    });
  }, []);

  const setAuthError = useCallback((message) => {
    setError(message);
  }, []);

  const contextValue = useMemo(() => {
    let currentUserId = null;
    if (tokenType === 'firebase' && user) {
      currentUserId = user.uid;
    } else if (tokenType === 'custom_jwt' && user) {
      currentUserId = user.id; // Assuming 'id' is in your custom JWT payload
    }

    return {
      user, // Firebase User object OR decoded custom JWT payload
      profileData, // Custom profile data from your backend
      loading,
      error,
      userId: currentUserId,
      tokenType, // Which type of token is active
      fetchUserProfile,
      updateUserContext,
      setAuthError,
      logout,
    };
  }, [user, profileData, loading, error, tokenType, fetchUserProfile, updateUserContext, setAuthError, logout]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};