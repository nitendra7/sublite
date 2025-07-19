import { jwtDecode } from 'jwt-decode';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Signup';
import ProfilePage from './pages/ProfilePage';
import AvailablePlans from './pages/Availableplans';
import Subscriptions from './pages/SubscriptionsPage';
import WalletPage from './pages/WalletPage';
import ReviewPage from './pages/ReviewPage';
import Notifications from './pages/NotificationsPage.jsx';


function LogoutPage() {
  const navigate = useNavigate();
  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  }, [navigate]);
  return <div>Logging out...</div>;
}

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/reviews" element={
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        } />
        <Route path="/subscriptions" element={
          <ProtectedRoute>
            <Subscriptions />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/availableplans" element={
          <ProtectedRoute>
            <AvailablePlans />
          </ProtectedRoute>
        } />
        {/* fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}