import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  HomeIcon,
  UsersIcon,
  LayoutListIcon,
  BookCopyIcon,
  CreditCardIcon,
  AreaChartIcon,
  ShieldCheckIcon,
  KeyRoundIcon,
  ServerCogIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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

function AdminSidebar({ sidebarOpen, handleSidebarToggle }) {
  const location = useLocation();

  return (
    <nav
      className={`z-20 flex flex-col justify-between items-center md:items-stretch shadow-lg bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-hidden h-screen ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      { /* Header Section */ }
      <div className="w-full">
        <div className="flex items-center justify-between py-5 px-4 border-b border-gray-200 dark:border-gray-700 min-h-[65px]">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <span className="text-base font-bold text-gray-800 dark:text-gray-100">Admin</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <button
                className="p-2 rounded-lg text-gray-500 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                onClick={handleSidebarToggle}
              >
                <ChevronRight className="text-lg" />
              </button>
            </div>
          )}
          {sidebarOpen && (
            <button
              className="p-2 rounded-lg text-gray-500 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              onClick={handleSidebarToggle}
            >
              <ChevronLeft className="text-lg" />
            </button>
          )}
        </div>

        { /* Navigation Items */ }
        <div className="py-4 px-2">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);
              const Icon = link.icon;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`group flex items-center w-full text-left transition-all duration-200 rounded-xl p-3 relative overflow-hidden
                      ${active
                        ? 'bg-gradient-to-r from-[#2bb6c4] to-[#1ea1b0] text-white shadow-lg transform scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#2bb6c4] dark:hover:text-[#5ed1dc]'
                      }
                      ${sidebarOpen ? 'justify-start' : 'justify-center'}
                    `}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-white"></div>
                    )}

                    <span className={`text-lg transition-all duration-200 ${
                      active
                        ? 'text-white'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-[#2bb6c4] dark:group-hover:text-[#5ed1dc]'
                    }`}>
                      <Icon size={18} />
                    </span>

                    {sidebarOpen && (
                      <span className="ml-3 font-medium text-sm">{link.label}</span>
                    )}

                    {/* hover effect */}
                    {!active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-full border-t border-gray-200 dark:border-gray-700">
        <div className="p-4">
          {sidebarOpen ? (
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Admin Panel</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Manage your platform<br />
                <span className="text-[#2bb6c4] dark:text-[#5ed1dc] font-medium">sublite.app</span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                className="p-2 rounded-lg text-gray-500 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                title="Admin Panel - sublite.app"
              >
                <ServerCogIcon size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

AdminSidebar.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  handleSidebarToggle: PropTypes.func.isRequired
};

export default AdminSidebar;