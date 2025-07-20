import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';

// Import your page components
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import Availableplans from './pages/Availableplans';
import NotificationsPage from './pages/NotificationsPage';
import ReviewPage from './pages/ReviewPage';
import WalletPage from './pages/WalletPage';
import Home from './pages/HomePage';

// A PrivateRoute component designed for React Router v6 layout routes
const PrivateRoute = () => {
  const { user, loading } = useUser(); // Get user and loading state from context
  const token = localStorage.getItem('token'); // Check for token as a fallback

  if (loading) {
    // Show a loading indicator while user authentication is being verified
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Authenticating...</div>;
  }

  // If the user is authenticated (or a token exists), render the nested content.
  // The <Outlet /> is the placeholder where child routes (Dashboard, Profile, etc.) will be rendered.
  // If not authenticated, redirect the user to the login page.
  return user || token ? <Outlet /> : <Navigate to="/login" replace />;
};


function App() {
  return (
    <Router>
      <UserProvider> {/* Wrap your entire application with UserProvider */}
        <Routes>
          {/* Public Routes - accessible to anyone */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          {/* Protected Routes Wrapper */}
          <Route element={<PrivateRoute />}>
            {/* All routes nested inside this route will be protected */}
            <Route path="/dashboard" element={<Dashboard />}>
              {/* Default content for /dashboard */}
              <Route index element={<Availableplans />} />
              {/* Other nested routes within the Dashboard */}
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="reviews" element={<ReviewPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* Fallback Route - redirects to home for any unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;