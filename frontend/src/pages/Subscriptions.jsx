import React, { useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const Subscriptions = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const subscriptions = [
    {
      id: 1,
      name: 'Netflix Premium',
      type: 'Owned',
      status: 'active',
      price: 299,
      duration: '30 days',
      startDate: '2024-07-01',
      expiryDate: '2024-07-31',
      user: 'rahul@email.com'
    },
    {
      id: 2,
      name: 'Amazon Prime',
      type: 'Borrowed',
      status: 'completed',
      price: 149,
      duration: '15 days',
      startDate: '2024-06-10',
      expiryDate: '2024-06-25',
      user: 'megha@email.com'
    },
    {
      id: 3,
      name: 'Zee5 Premium',
      type: 'Borrowed',
      status: 'active',
      price: 120,
      duration: '10 days',
      startDate: '2024-07-05',
      expiryDate: '2024-07-15',
      user: 'nishant@email.com'
    },
    {
      id: 4,
      name: 'Adobe Creative Cloud',
      type: 'Owned',
      status: 'pending',
      price: 499,
      duration: '30 days',
      startDate: '2024-07-10',
      expiryDate: '2024-08-10',
      user: 'rohan@email.com'
    }
  ];

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen transition-colors duration-500 bg-gray-100 dark:bg-gray-900`}>
      {/* Dark mode toggle */}
      <div className="flex justify-end p-4">
        <button
          onClick={toggleDarkMode}
          className="text-2xl text-gray-600 dark:text-yellow-300 transition-colors duration-300 focus:outline-none"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-300">My Subscriptions</h1>
        <p className="text-gray-500 dark:text-gray-300 transition-colors duration-300">Track your owned and borrowed services</p>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap justify-center gap-6 px-4">
        {subscriptions.map((sub, idx) => (
          <div
            key={sub.id}
            className={`
              relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-80 mb-4
              transform transition-all duration-500
              hover:scale-105 hover:shadow-2xl
              animate-fade-in
              ${idx % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'}
            `}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <span className={`
              absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold
              ${sub.type === 'Owned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}
              transition-colors duration-300
            `}>
              {sub.type}
            </span>
            <div className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{sub.name}</div>
            <div className="mb-1 text-gray-600 dark:text-gray-300"><strong>Status:</strong>
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs font-bold
                ${sub.status === 'active' ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100'
                  : sub.status === 'pending' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}
                transition-colors duration-300
              `}>
                {sub.status}
              </span>
            </div>
            <div className="mb-1 text-gray-600 dark:text-gray-300"><strong>Price:</strong> ₹{sub.price}</div>
            <div className="mb-1 text-gray-600 dark:text-gray-300"><strong>Duration:</strong> {sub.duration}</div>
            <div className="mb-1 text-gray-600 dark:text-gray-300"><strong>Start Date:</strong> {sub.startDate}</div>
            <div className="mb-1 text-gray-600 dark:text-gray-300"><strong>Expiry Date:</strong> {sub.expiryDate}</div>
            <div className="mb-3 text-gray-600 dark:text-gray-300">
              <strong>{sub.type === 'Owned' ? 'Borrowed By' : 'Shared By'}:</strong> {sub.user}
            </div>
            <div className="flex gap-2">
              {sub.type === 'Borrowed' && sub.status === 'completed' && (
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition-all duration-300 shadow">
                  Renew
                </button>
              )}
              <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-1 rounded-lg transition-all duration-300 shadow">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Animations (Tailwind custom) */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.7s ease both;
          }
          @keyframes slide-in-left {
            from { opacity: 0; transform: translateX(-40px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(40px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.7s cubic-bezier(.4,0,.2,1) both;
          }
        `}
      </style>
    </div>
  );
};

export default Subscriptions;