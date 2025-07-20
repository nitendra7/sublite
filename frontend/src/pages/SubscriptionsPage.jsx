import React, { useState } from 'react';

const brandColor = '#2bb6c4';

const lightColors = {
  cardBg: '#fff',
  cardText: '#222',
  badgeOwned: 'bg-blue-100 text-blue-700',
  badgeBorrowed: 'bg-green-100 text-green-700',
  statusActive: 'bg-green-200 text-green-800',
  statusPending: 'bg-yellow-200 text-yellow-800',
  statusCompleted: 'bg-gray-200 text-gray-800',
  pageBgStart: '#e0f7fa',
  pageBgEnd: '#e0f2f1',
  modalBg: '#ffffffcc', // translucent white modal background
};

const Subscriptions = ({ darkMode = false }) => {
  const colors = lightColors;
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
    {
      id: 4,
      name: 'Adobe Creative Cloud',
      type: 'Owned',
      status: 'pending',
      price: 499,
      duration: '30 days',
      startDate: '2024-07-10',
      expiryDate: '2024-08-10',
      user: 'rohan@email.com',
    },
  ];

  const openModal = (sub, type) => {
    setSelectedSub(sub);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedSub(null);
    setModalType(null);
  };

  return (
    <div
      className="w-full min-h-screen py-10 px-4"
      style={{
        background: `linear-gradient(to bottom right, ${colors.pageBgStart}, ${colors.pageBgEnd})`,
      }}
    >
      <div className="max-w-5xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.cardText }}>
          My Subscriptions
        </h1>
        <p style={{ color: '#64748b' }}>
          Track your owned and borrowed services
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 px-4">
        {subscriptions.map((sub, idx) => (
          <div
            key={sub.id}
            className={`
              relative rounded-2xl shadow-2xl p-6 w-full sm:w-[360px]
              transform transition-all duration-500
              hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(43,182,196,0.15)]
              animate-fade-in
              ${idx % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'}
            `}
            style={{
              background: colors.cardBg,
              color: colors.cardText,
              animationDelay: `${idx * 100}ms`,
            }}
          >
            <span className={`
              absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold
              ${sub.type === 'Owned' ? colors.badgeOwned : colors.badgeBorrowed}
            `}>
              {sub.type}
            </span>

            <div className="text-xl font-semibold mb-2">{sub.name}</div>
            <div className="mb-1">
              <strong>Status:</strong>
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs font-bold
                ${sub.status === 'active'
                  ? colors.statusActive
                  : sub.status === 'pending'
                    ? colors.statusPending
                    : colors.statusCompleted}
              `}>
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
                className="px-4 py-1 rounded-lg transition-all duration-300 shadow"
                style={{
                  background: '#e0f7fa',
                  color: '#222',
                }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: `linear-gradient(to bottom right, #b2ebf2aa, #e0f2f1aa)`,
          }}
        >
          <div
            className="bg-white border border-blue-200 text-black p-6 rounded-xl w-[90%] max-w-md shadow-xl relative"
          >
            <button
              className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-black"
              onClick={closeModal}
            >
              ×
            </button>

            {modalType === 'details' && (
              <>
                <h2 className="text-2xl font-bold mb-3 text-[#2bb6c4]">{selectedSub.name}</h2>
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
                <h2 className="text-2xl font-bold mb-4 text-[#2bb6c4]">Renew Subscription</h2>
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
                    className="bg-gray-200 text-black px-4 py-1 rounded-lg"
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

      {/* Animations */}
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
