import React from 'react';
import {
  FaBars,
  FaBook,
  FaWallet,
  FaStar,
  FaBell,
  FaHome,
  FaListAlt,
  FaPlus,
  FaEnvelope
} from 'react-icons/fa';


const brandColor = '#2bb6c4';

const sidebarItems = [
  { name: 'Dashboard', icon: <FaHome />, route: '/dashboard' },
  { name: 'My Subscriptions', icon: <FaBook />, route: '/dashboard/subscriptions' },
  { name: 'Available Plans', icon: <FaListAlt />, route: '/dashboard/available-plans' },
  { name: 'Add Service', icon: <FaPlus />, route: '/dashboard/add-service' },
  { name: 'Wallet', icon: <FaWallet />, route: '/dashboard/wallet' },
  { name: 'Reviews', icon: <FaStar />, route: '/dashboard/reviews' },
  { name: 'Notifications', icon: <FaBell />, route: '/dashboard/notifications' },
];

function Sidebar({ sidebarOpen, active, onSidebarClick, handleSidebarToggle }) {
  return (
    <nav
      className={`z-20 flex flex-col justify-between items-center md:items-stretch shadow-lg bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-hidden h-screen ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header Section */}
      <div className="w-full">
        <div className="flex items-center justify-between py-5 px-4 border-b border-gray-200 dark:border-gray-700 min-h-[65px]">
                      {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <span className="text-base font-bold text-gray-800 dark:text-gray-100">Sublite</span>
              </div>
            ) : (
            <div className="flex items-center justify-center w-full">
              <button
                className="p-2 rounded-lg text-gray-500 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                onClick={handleSidebarToggle}
              >
                <FaBars className="text-lg" />
              </button>
            </div>
          )}
          {sidebarOpen && (
            <button
              className="p-2 rounded-lg text-gray-500 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              onClick={handleSidebarToggle}
            >
              <FaBars className="text-lg" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="py-4 px-2">
          <ul className="space-y-2">
            {sidebarItems.map((item, idx) => (
              <li key={item.name}>
                <button
                  className={`group flex items-center w-full text-left transition-all duration-200 rounded-xl p-3 relative overflow-hidden
                    ${active === idx
                      ? 'bg-gradient-to-r from-[#2bb6c4] to-[#1ea1b0] text-white shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#2bb6c4] dark:hover:text-[#5ed1dc]'
                    }
                    ${sidebarOpen ? 'justify-start' : 'justify-center'}
                  `}
                  onClick={() => onSidebarClick(idx, item.route)}
                >
                  {/* Active indicator */}
                  {active === idx && (
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-white"></div>
                  )}

                  <span className={`text-lg transition-all duration-200 ${
                    active === idx
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-[#2bb6c4] dark:group-hover:text-[#5ed1dc]'
                  }`}>
                    {item.icon}
                  </span>

                  {sidebarOpen && (
                    <span className="ml-3 font-medium text-sm">{item.name}</span>
                  )}

                  {/* Hover effect */}
                  {!active === idx && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-full border-t border-gray-200 dark:border-gray-700">
        <div className="p-4">
          {sidebarOpen ? (
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Need Help?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Contact us at<br />
                <span className="text-[#2bb6c4] dark:text-[#5ed1dc] font-medium">sublite.app@gmail.com</span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                className="p-2 rounded-lg text-gray-500 hover:text-[#2bb6c4] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                title="Contact us: sublite.app@gmail.com"
              >
                <FaEnvelope className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Sidebar; 