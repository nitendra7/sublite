import React from 'react';
import { FaBars, FaBook, FaThLarge, FaWallet, FaStar, FaBell } from 'react-icons/fa';
import { PlusCircle } from 'lucide-react';

const brandColor = '#2bb6c4';

const sidebarItems = [
  { name: 'Dashboard', icon: <FaThLarge />, route: '/dashboard' },
  { name: 'My Subscriptions', icon: <FaBook />, route: '/dashboard/subscriptions' },
  { name: 'Available Plans', icon: <FaThLarge />, route: '/dashboard/available-plans' },
  { name: 'Add Service', icon: <PlusCircle />, route: '/dashboard/add-service' },
  { name: 'Wallet', icon: <FaWallet />, route: '/dashboard/wallet' },
  { name: 'Reviews', icon: <FaStar />, route: '/dashboard/reviews' },
  { name: 'Notifications', icon: <FaBell />, route: '/dashboard/notifications' },
];

function Sidebar({ sidebarOpen, active, onSidebarClick, handleSidebarToggle }) {
  return (
    <nav
      className="z-50 flex flex-col justify-between items-center md:items-stretch shadow-sm bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 rounded-lg overflow-hidden"
      style={{ minWidth: sidebarOpen ? 200 : 64, width: sidebarOpen ? 200 : 64 }}
    >
      <div>
        <div className="flex items-center justify-center py-4 min-h-[72px]">
          <button
            className="p-0 text-2xl text-[#2bb6c4] hover:text-[#1ea1b0] dark:text-[#5ed1dc] dark:hover:text-[#80e5ee]"
            onClick={handleSidebarToggle}
          >
            <FaBars />
          </button>
        </div>
        <ul className="flex flex-col w-full mt-6">
          {sidebarItems.map((item, idx) => (
            <li key={item.name}>
              <button
                className={`flex items-center w-full text-left text-base transition-all duration-200 rounded-lg my-1 p-2
                  ${active === idx
                    ? 'bg-[#2bb6c4] text-white font-semibold shadow px-4 justify-start focus-visible:ring-2 focus-visible:ring-[#2bb6c4] focus-visible:ring-offset-2 active:scale-98'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:scale-98'
                  }
                  ${sidebarOpen ? 'justify-start px-4' : 'justify-center'}
                `}
                onClick={() => onSidebarClick(idx, item.route)}
              >
                <span className={`${active === idx ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>{item.icon}</span>
                {sidebarOpen && <span className="ms-2">{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full text-center text-xs text-gray-500 dark:text-gray-400 py-4 px-2 border-t border-gray-200 dark:border-gray-700">
        {sidebarOpen ? (
          <p className="leading-snug">
            Contact us:<br />
            <span style={{ color: brandColor }}>Sublite123@gmail.com</span>
          </p>
        ) : (
          <FaBook className="mx-auto" title="Contact us: Sublite123@gmail.com" />
        )}
      </div>
    </nav>
  );
}

export default Sidebar; 