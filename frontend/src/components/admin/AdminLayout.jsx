import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  LayoutListIcon,
  BookCopyIcon,
  CreditCardIcon,
  AreaChartIcon,
  ShieldCheckIcon,
  KeyRoundIcon,
  ServerCogIcon
} from 'lucide-react';
import UserManagement from './UserManagement';
import ServiceList from '../lists/ServiceList';
import BookingList from '../lists/BookingList';
import PaymentList from '../lists/PaymentList';

const sidebarLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/admin/services', label: 'Services', icon: LayoutListIcon },
  { to: '/admin/bookings', label: 'Bookings', icon: BookCopyIcon },
  { to: '/admin/payments', label: 'Payments', icon: CreditCardIcon },
  { to: '/admin/analytics', label: 'Analytics', icon: AreaChartIcon },
  { to: '/admin/moderation', label: 'Moderation', icon: ShieldCheckIcon },
  { to: '/admin/permissions', label: 'Permissions', icon: KeyRoundIcon },
  { to: '/admin/monitoring', label: 'System Monitoring', icon: ServerCogIcon },
];

const AdminLayout = () => {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-4 flex flex-col fixed sm:static z-40 h-screen transition-all">
        <h2 className="text-2xl font-black mb-10 pl-2 tracking-tight text-blue-700 flex items-center gap-2">
          <ServerCogIcon size={28} className="text-blue-700 mr-1" />
          Admin Panel
        </h2>
        <nav className="flex-1">
          <ul className="flex flex-col gap-2">
            {sidebarLinks.map(link => {
              const active = location.pathname.startsWith(link.to);
              const Icon = link.icon;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={
                      "flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all " +
                      (active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 hover:text-blue-700 hover:bg-blue-100")
                    }
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={20} className={active ? "text-white" : "text-blue-600"} aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto pt-6 border-t flex items-center gap-2">
          {/* TODO: Replace/extend with authenticated admin profile menu */}
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">A</div>
          <div className="text-sm font-semibold text-blue-700">Admin</div>
          {/* Dropdown, Logout, etc. could go here */}
        </div>
      </aside>
      {/* Main panel (responsive to sidebar) */}
      <main className="flex-1 p-6 sm:ml-64 min-h-screen transition-all">
        <header className="mb-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-blue-800">Admin Dashboard</h1>
          {/* Quick actions, system status, help, or profile can be added here */}
        </header>
        <section
          className="bg-white rounded-xl shadow-lg p-6 min-h-[350px] transition-all"
          aria-label="Admin main content"
        >
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout; 