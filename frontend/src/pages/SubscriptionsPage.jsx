import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

const Subscriptions = () => {
  const { darkMode } = useTheme(); // Consume dark mode state
  const [selectedSub, setSelectedSub] = useState(null);
  const [modalType, setModalType] = useState(null);

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
      user: 'rahul@email.com',
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
      user: 'megha@email.com',
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
      user: 'nishant@email.com',
    },
  ];

  // Helper function to get badge/status colors based on Tailwind classes.
  const getBadgeClasses = (type) => {
    return type === 'Owned'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100'
      : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100';
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      case 'completed':
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return '';
    }
  };

  const openModal = (sub, type) => {
    setSelectedSub(sub);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedSub(null);
    setModalType(null);
  };

  return (
    // Main page container with dark mode adaptable background and text colors.
    <div
      className="w-full min-h-screen py-10 px-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      {/* Removed text-center from this div to align heading left */}
      <div className="max-w-5xl mx-auto mb-8"> 
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100"> {/* Heading is now left-aligned */}
          My Subscriptions
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your owned and borrowed services
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 px-4">
        {subscriptions.map((sub, idx) => (
          <div
            key={sub.id}
            // Card background and text color adapting to dark mode.
            className={`
              relative rounded-2xl shadow-2xl p-6 w-full sm:w-[360px]
              transform transition-all duration-500
              hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(43,182,196,0.15)]
              animate-fade-in
              ${idx % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'}
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            `}
            style={{
              animationDelay: `${idx * 100}ms`,
            }}
          >
            {/* Type badge styling */}
            <span className={`
              absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold
              ${getBadgeClasses(sub.type)}
            `}>
              {sub.type}
            </span>

            {/* Subscription details */}
            <div className="text-xl font-semibold mb-2">{sub.name}</div>
            <div className="mb-1">
              <strong>Status:</strong>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${getStatusClasses(sub.status)}`}>
                {sub.status}
              </span>
            </div>
            <div className="mb-1"><strong>Price:</strong> ₹{sub.price}</div>
            <div className="mb-1"><strong>Duration:</strong> {sub.duration}</div>
            <div className="mb-1"><strong>Start Date:</strong> {sub.startDate}</div>
            <div className="mb-1"><strong>Expiry Date:</strong> {sub.expiryDate}</div>
            <div className="mb-3">
              <strong>{sub.type === 'Owned' ? 'Borrowed By' : 'Shared By'}:</strong> {sub.user}
            </div>

            <div className="flex flex-wrap gap-2">
              {sub.type === 'Borrowed' && sub.status === 'completed' && (
                <button
                  className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-1 rounded-lg transition-all duration-300 shadow"
                  onClick={() => openModal(sub, 'renew')}
                >
                  Renew
                </button>
              )}
              <button
                // View Details button styling
                className="px-4 py-1 rounded-lg transition-all duration-300 shadow bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => openModal(sub, 'details')}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedSub && (
        <div // Overlay background
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: `linear-gradient(to bottom right, ${darkMode ? '#1f2937dd' : '#b2ebf2aa'}, ${darkMode ? '#1f2937dd' : '#e0f2f1aa'})`, // Adapt modal overlay to dark mode
          }}
        >
          <div
            // Modal content box
            className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 text-gray-900 dark:text-gray-100 p-6 rounded-xl w-[90%] max-w-md shadow-xl relative"
          >
            <button
              className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-gray-100" // Close button styling
              onClick={closeModal}
            >
              ×
            </button>

            {modalType === 'details' && (
              <>
                <h2 className="text-2xl font-bold mb-3 text-[#2bb6c4] dark:text-[#5ed1dc]">{selectedSub.name}</h2>
                <p><strong>Type:</strong> {selectedSub.type}</p>
                <p><strong>Status:</strong> {selectedSub.status}</p>
                <p><strong>Price:</strong> ₹{selectedSub.price}</p>
                <p><strong>Duration:</strong> {selectedSub.duration}</p>
                <p><strong>Start:</strong> {selectedSub.startDate}</p>
                <p><strong>Expires:</strong> {selectedSub.expiryDate}</p>
                <p><strong>{selectedSub.type === 'Owned' ? 'Borrowed By' : 'Shared By'}:</strong> {selectedSub.user}</p>
              </>
            )}

            {modalType === 'renew' && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-[#2bb6c4] dark:text-[#5ed1dc]">Renew Subscription</h2>
                <p>
                  Are you sure you want to renew <strong>{selectedSub.name}</strong> for another {selectedSub.duration} at ₹{selectedSub.price}?
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-1 rounded-lg"
                    onClick={() => {
                      alert('Renewal requested!');
                      closeModal();
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-gray-200 text-gray-900 px-4 py-1 rounded-lg dark:bg-gray-700 dark:text-gray-200" // Adapt cancel button
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Animations (kept inline for simplicity and directness) */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s ease both;
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.7s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  );
};

export default Subscriptions;