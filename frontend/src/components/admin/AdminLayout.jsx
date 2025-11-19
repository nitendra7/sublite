import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        handleSidebarToggle={handleSidebarToggle}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        { /* Admin Header */ }
        <header className="relative z-10 flex items-center justify-between px-4 py-3 shadow-sm bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 min-h-[60px] backdrop-blur-sm -ml-px">
          { /* Left Section - Logo and Brand */ }
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                <img src="/logos/logo.png" alt="logo" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <h2 className="font-bold text-xl text-[#2bb6c4] dark:text-[#5ed1dc] tracking-wide">Admin Panel</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Platform Management</p>
              </div>
            </div>
          </div>

          {/* Right Section - Actions and User */}
          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Back to User Dashboard */}
              <button
                className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group relative"
                title="Back to User Dashboard"
                onClick={() => window.location.href = '/dashboard'}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              {/* Theme Toggle */}
              <button
                className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                onClick={toggleDarkMode}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Notifications */}
              <button
                className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group relative"
                title="Notifications"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.618 4.618A9.955 9.955 0 0112 2c5.523 0 10 4.477 10 10 0 5.523-4.477 10-10 10a9.955 9.955 0 01-7.382-3.382L2 22l5-2.618z" />
                </svg>
              </button>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2bb6c4] to-[#1ea1b0] flex items-center justify-center text-white font-bold text-lg ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-[#2bb6c4] transition-all duration-200">
                A
              </div>
              <div className="hidden md:block text-left">
                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;