import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';

import { ThemeProvider } from './context/ThemeContext';
// Page components
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup'; // Your signup page is named Signup.jsx
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import Availableplans from './pages/Availableplans'; // Your available plans page
import NotificationsPage from './pages/NotificationsPage';
import ReviewPage from './pages/ReviewPage';
import WalletPage from './pages/WalletPage';
import HomePage from './pages/HomePage'; // Correctly imported as HomePage
import SubscriptionDetails from './pages/SubscriptionDetails';

// 🔐 Auth-protected wrapper
const PrivateRoute = () => {
  const { user, loading } = useUser();
  const token = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Authenticating...
      </div>
    );
  }

  return user || token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <UserProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} /> {/* Using HomePage component */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} /> {/* Route for SignupPage is /register */}

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              {/* Dashboard Layout Routes */}
              <Route path="/dashboard" element={<Dashboard />}>
                {/* This index route means that if you go to exactly /dashboard, it will render Availableplans as the default content inside Dashboard's Outlet.
                    If you want DashboardApp itself to render the overview (with AvailablePlansCard), and then nested routes for other pages,
                    you would set index element={null} and DashboardApp would handle its own index content.
                    Given previous discussions, I'll assume you want the Dashboard overview to be at /, and Availableplans at /available-plans. */}
                <Route index element={<Availableplans />}/> {/* Default content for /dashboard */}
                <Route path="available-plans" element={<Availableplans />} /> {/* Explicit route for available plans */}
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="reviews" element={<ReviewPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* Standalone protected page */}
              <Route path="/subscription-details" element={<SubscriptionDetails />} />
            </Route>

            {/* Fallback Route: Redirects to home page for any unmatched paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </UserProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;