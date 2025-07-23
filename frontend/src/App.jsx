// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { useTheme } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider

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


// PrivateRoute component: Guards routes, redirecting unauthenticated users to the login page.
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

// ProtectedLayout component: A layout component for protected routes.
// It receives theme state from the top-level App component and passes it down.
const ProtectedLayout = ({ darkMode, toggleDarkMode }) => {
  return <Outlet />;
};


function App() {
  // Consume ThemeContext at the top level to provide theme state globally.
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    // Wrap the entire application with GoogleOAuthProvider.
    // Replace "YOUR_GOOGLE_CLIENT_ID" with your actual Client ID from Google Cloud Console.
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        {/* UserProvider wraps the application to provide user authentication context. */}
        <UserProvider>
          {/* Routes define the different paths and their corresponding components. */}
          <Routes>
            {/* Public routes: Accessible without authentication. */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />

            {/* Protected routes group: Access is guarded by PrivateRoute. */}
            {/* ProtectedLayout ensures theme props are passed down to all nested protected components. */}
            <Route element={<PrivateRoute />}>
                <Route element={<ProtectedLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
                    {/* Dashboard layout route: Nested routes render within Dashboard's own Outlet. */}
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

                    {/* Standalone protected pages. */}
                    <Route path="/subscription-details" element={<SubscriptionDetails />} />
                </Route>
            </Route>

            {/* Fallback route: Redirects to home page for any undefined paths. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </UserProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
