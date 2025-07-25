import React from 'react';
import { Link, Outlet, Routes, Route } from 'react-router-dom';
import UserManagement from './UserManagement';

const sidebarLinks = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/payments', label: 'Payments' },
];

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="flex-1">
          <ul className="space-y-4">
            {sidebarLinks.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-gray-700 hover:text-blue-600 font-medium">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          {/* Add profile/logout here if needed */}
        </header>
        <Routes>
          <Route index element={<Outlet />} />
          <Route path="users" element={<UserManagement />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 