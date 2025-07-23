// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { useTheme } from './context/ThemeContext';

// Firebase SDK Imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Availableplans from './pages/Availableplans';
import SubscriptionsPage from './pages/SubscriptionsPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import ReviewPage from './pages/ReviewPage';
import NotificationsPage from './pages/NotificationsPage';
import SubscriptionDetails from './pages/SubscriptionDetails';
import AddServicePage from './pages/AddServicePage';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAta13wpT4auUMCXRYxb_FYK8lwz5IANI",
  authDomain: "sublite-e474e.firebaseapp.com",
  projectId: "sublite-e474e",
  storageBucket: "sublite-e474e.firebasestorage.app",
  messagingSenderId: "1065232705924",
  appId: "1:1065232705924:web:4cb941286daccb0fb7d5d1",
};

// Initialize Firebase App and Auth Service
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export auth for use in other components

const PrivateRoute = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Authenticating...
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const ProtectedLayout = () => {
  return <Outlet />;
};

function App() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          <Route element={<PrivateRoute />}>
              <Route element={<ProtectedLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
                  <Route path="/dashboard" element={<Dashboard />}>
                    <Route index element={<Availableplans />}/>
                    <Route path="available-plans" element={<Availableplans />} />
                    <Route path="subscriptions" element={<SubscriptionsPage />} />
                    <Route path="wallet" element={<WalletPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="reviews" element={<ReviewPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="/dashboard/add-service" element={<AddServicePage />} />
                  </Route>

                  <Route path="/subscription-details" element={<SubscriptionDetails />} />
              </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;