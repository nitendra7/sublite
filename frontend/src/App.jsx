import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';

// Page components
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
      <UserProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            {/* Dashboard Layout Routes */}
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Availableplans />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="reviews" element={<ReviewPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Standalone protected page */}
            <Route path="/subscription-details" element={<SubscriptionDetails />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
