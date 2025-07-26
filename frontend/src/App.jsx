// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { useTheme } from './context/ThemeContext';

// Page components
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import Availableplans from './pages/Availableplans';
import SubscriptionsPage from './pages/SubscriptionsPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import ReviewPage from './pages/ReviewPage';
import NotificationsPage from './pages/NotificationsPage';
import AddServicePage from './pages/AddServicePage';
import EditServicePage from './pages/EditServicePage';
import HelpPage from './pages/HelpPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';


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

// AdminRoute component: Guards admin routes, redirecting non-admins to home or login.
const AdminRoute = () => {
  const { user, loading } = useUser();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Authenticating...
      </div>
    );
  }
  // Adjust this check if your user object uses a different property for admin
  return user && user.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};


function App() {
  // Consume ThemeContext at the top level to provide theme state globally.
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Router>
      {/* UserProvider wraps the application to provide user authentication context. */}
      <UserProvider>
        {/* Routes define the different paths and their corresponding components. */}
        <Routes>
          {/* Public routes: Accessible without authentication. */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage isLogin={true} />} />
          <Route path="/register" element={<AuthPage isLogin={false} />} />

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
                    <Route path="add-service" element={<AddServicePage />} />
                    <Route path="edit-service/:serviceId" element={<EditServicePage />} />
                    <Route path="help" element={<HelpPage />} />
                  </Route>

                  {/* Standalone protected pages. */}
              </Route>
          </Route>

          {/* Admin routes: Only accessible to admin users. */}
          <Route element={<PrivateRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                {/* Future: Add subroutes for users, services, bookings, payments */}
              </Route>
            </Route>
          </Route>

          {/* Fallback route: Redirects to home page for any undefined paths. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
