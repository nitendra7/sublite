import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Info, Gift, Loader } from "lucide-react";
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

// Component for Send Credentials button with its own state
const SendCredentialsButton = ({ bookingId, onOpenModal }) => {
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingCreatedAt, setBookingCreatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const bookingRes = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const booking = await bookingRes.json();
        setBookingStatus(booking.bookingStatus);
        setBookingCreatedAt(booking.createdAt);
      } catch (err) {
        console.error('Failed to fetch booking details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const isEligible = () => {
    if (isLoading || !bookingStatus || !bookingCreatedAt) return false;
    if (bookingStatus !== 'pending') return false;
    const created = new Date(bookingCreatedAt);
    const now = new Date();
    const diffMinutes = (now - created) / (1000 * 60);
    return diffMinutes <= 15;
  };

  if (isLoading) {
    return (
      <button disabled className="mt-2 px-4 py-2 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400">
        Loading...
      </button>
    );
  }

  return (
    <button
      className={`mt-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 
        ${isEligible()
          ? 'bg-[#2bb6c4] text-white hover:bg-[#1ea1b0] dark:bg-[#5ed1dc] dark:text-gray-900 dark:hover:bg-[#2bb6c4]'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
        }`}
      onClick={() => {
        if (isEligible()) {
          onOpenModal(bookingId);
        }
      }}
      disabled={!isEligible()}
      title={!isEligible() ? 'Booking not eligible (must be pending and within 15 minutes)' : ''}
    >
      Send Credentials
    </button>
  );
};

// Define icons with consistent colors
const typeIcon = {
  booking: <CheckCircle className="text-[#2bb6c4] dark:text-[#5ed1dc]" />,
  payment: <Info className="text-[#2bb6c4] dark:text-[#5ed1dc]" />,
  reminder: <Bell className="text-[#2bb6c4] dark:text-[#5ed1dc]" />,
  promotion: <Gift className="text-[#2bb6c4] dark:text-[#5ed1dc]" />,
};

// Define background for notification types - consistent with theme
const typeBg = {
  booking: "bg-white dark:bg-gray-800",
  payment: "bg-white dark:bg-gray-800",
  reminder: "bg-white dark:bg-gray-800",
  promotion: "bg-white dark:bg-gray-800",
};

export default function NotificationsPage() {
  const { user, loading: loadingUser } = useUser();
  const { darkMode } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for sending credentials
  const [showCredModal, setShowCredModal] = useState(false);
  const [credBookingId, setCredBookingId] = useState(null);
  const [credValues, setCredValues] = useState({ username: '', password: '', profileName: '', accessInstructions: '' });
  const [credLoading, setCredLoading] = useState(false);
  const [credError, setCredError] = useState('');
  const [credSuccess, setCredSuccess] = useState('');
  const [credBookingStatus, setCredBookingStatus] = useState('');
  const [credBookingCreatedAt, setCredBookingCreatedAt] = useState(null);

  const [expandedId, setExpandedId] = useState(null);

  // Mark notification as read in backend and update local state
  const markRead = async (notifId) => {
    try {
      const token = localStorage.getItem("token");
      console.log('Marking notification as read:', notifId);
      console.log('API_BASE:', API_BASE);
      
      const response = await fetch(`${API_BASE}/api/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Mark as read response status:', response.status);
      
      if (response.ok) {
        const updatedNotification = await response.json();
        console.log('Updated notification:', updatedNotification);
        return true; // Success
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to mark notification as read:', response.status, errorData);
        return false; // Failed
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false; // Failed
    }
  };

  // For credential notifications, mark booking as active/confirmed
  const confirmBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      // Ignore error for now
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error('Session expired. Please log in again.');
      }
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return await res.json();
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch notifications');
    }
  };

  // Fetch booking and service details for autofill and status check
  const openCredModal = async (bookingId) => {
    setCredBookingId(bookingId);
    setCredError('');
    setCredSuccess('');
    setCredLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Fetch booking details
      const bookingRes = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const booking = await bookingRes.json();
      setCredBookingStatus(booking.bookingStatus);
      setCredBookingCreatedAt(booking.createdAt);
      // Fetch service details for autofill
      const serviceRes = await fetch(`${API_BASE}/api/services/${booking.serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const service = await serviceRes.json();
      setCredValues({
        username: service.credentials?.username || '',
        password: service.credentials?.password || '',
        profileName: service.credentials?.profileName || '',
        accessInstructions: service.accessInstructionsTemplate || ''
      });
      setShowCredModal(true);
    } catch (err) {
      setCredError('Failed to fetch booking/service details');
      setShowCredModal(true);
    } finally {
      setCredLoading(false);
    }
  };

  const handleCredChange = (e) => {
    const { name, value } = e.target;
    setCredValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCredentials = async (e) => {
    e.preventDefault();
    setCredLoading(true);
    setCredError('');
    setCredSuccess('');
    try {
      const token = localStorage.getItem("token");

      
      const res = await fetch(`${API_BASE}/api/bookings/${credBookingId}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(credValues)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send credentials');
      setCredSuccess('Credentials sent successfully!');
      setTimeout(() => {
        setShowCredModal(false);
        setCredBookingId(null);
        setCredValues({ username: '', password: '', profileName: '', accessInstructions: '' });
        setCredError('');
        setCredSuccess('');
        // Don't refresh notifications to preserve read status
      }, 1500);
    } catch (err) {
      setCredError(err.message);
    } finally {
      setCredLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingUser && user) {
      setLoading(true);
      setError(null);
      fetchNotifications()
        .then((data) => setNotifications(data))
        .catch((err) => {
          setError(err.message);
          console.error('Error fetching notifications:', err);
        })
        .finally(() => setLoading(false));
    }
    if (!loadingUser && !user) {
      setNotifications([]);
      setLoading(false);
    }
  }, [loadingUser, user]);

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="flex items-center gap-2">
          <Loader className="w-6 h-6 animate-spin text-[#2bb6c4]" />
          <span className="text-xl font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">Loading user data...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">Please log in to view notifications.</p>
        </div>
      </div>
    );
  }

  // Helper to check if Send Credentials should be shown (for notification list)
  const canSendCredentials = (notif) => {
    if (notif.title !== 'New Booking!' || !notif.relatedId) return false;
    // Only show if not cancelled and within 15 minutes (use booking status/createdAt if available)
    // If modal is open for this booking, use modal state; otherwise, don't show button
    if (expandedId === notif._id && credBookingStatus && credBookingCreatedAt) {
      if (credBookingStatus !== 'confirmed') return false;
      const created = new Date(credBookingCreatedAt);
      const now = new Date();
      const diffMinutes = (now - created) / (1000 * 60);
      if (diffMinutes > 15) return false;
      return true;
    }
    // Otherwise, show button and check on modal open
    return true;
  };

  // Helper to check if Send Credentials is allowed (in modal)
  const canSendNow = () => {
    if (credBookingStatus !== 'pending') return false;
    if (!credBookingCreatedAt) return false;
    const created = new Date(credBookingCreatedAt);
    const now = new Date();
    const diffMinutes = (now - created) / (1000 * 60);
    return diffMinutes <= 15;
  };

  return (
    <div className="min-h-screen py-10 px-4 relative overflow-hidden animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8 animate-slide-in-down">
          <Bell className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          <h1 className="text-3xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">Notifications</h1>
        </div>
        


        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 min-h-[300px] animate-fade-in">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-red-500">
              <p className="text-lg font-semibold mb-2">Error loading notifications</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
              <Bell className="w-12 h-12 mb-2" />
              <span>No notifications yet.</span>
            </div>
          ) : (
            <ul className="space-y-4">
              {notifications.map((n, idx) => (
                <li
                  key={n._id}
                  className={`
                    flex items-start gap-4 rounded-xl px-5 py-4 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 cursor-pointer
                    ${typeBg[n.type] || "bg-white dark:bg-gray-800"}
                    hover:shadow-xl hover:scale-[1.01]
                    ${n.isRead ? "opacity-70" : "opacity-100"}
                    ${idx % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"}
                  `}
                  style={{ animationDelay: `${idx * 100 + 200}ms` }}
                  onClick={async () => {
                    // Mark as read immediately when clicked, regardless of expansion
                    if (!n.isRead) {
                      // Update local state immediately for instant UI feedback
                      setNotifications((prev) => prev.map(notification => 
                        notification._id === n._id ? { ...notification, isRead: true } : notification
                      ));
                      // Then update backend
                      const success = await markRead(n._id);
                      // If backend update failed, revert the state
                      if (!success) {
                        setNotifications((prev) => prev.map(notification => 
                          notification._id === n._id ? { ...notification, isRead: false } : notification
                        ));
                      }
                    }
                    setExpandedId(expandedId === n._id ? null : n._id);
                    if (n.title === 'Access Details Received!' && n.relatedId) await confirmBooking(n.relatedId);
                  }}
                >
                  <div className="pt-1">{typeIcon[n.type] || <Info className="text-gray-400 dark:text-gray-500" />}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${n.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{n.title}</span>
                    </div>
                    {/* Always show Send Credentials button for eligible bookings */}
                    {n.title === 'New Booking!' && n.relatedId && (
                      <SendCredentialsButton 
                        bookingId={n.relatedId} 
                        onOpenModal={openCredModal}
                      />
                    )}
                    {expandedId === n._id && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">{n.message}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Modal for sending credentials */}
      {showCredModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Send Credentials</h2>
            {canSendNow() ? (
              <form onSubmit={handleSendCredentials}>
                <div className="mb-3">
                  <label className="block mb-1 text-gray-700 dark:text-gray-300">Username</label>
                  <input type="text" name="username" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]" value={credValues.username} onChange={handleCredChange} required />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-gray-700 dark:text-gray-300">Password</label>
                  <input type="text" name="password" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]" value={credValues.password} onChange={handleCredChange} required />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-gray-700 dark:text-gray-300">Profile Name</label>
                  <input type="text" name="profileName" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]" value={credValues.profileName} onChange={handleCredChange} />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-gray-700 dark:text-gray-300">Access Instructions</label>
                  <textarea name="accessInstructions" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]" value={credValues.accessInstructions} onChange={handleCredChange} rows={2} />
                </div>
                {credError && <div className="text-red-500 mb-2">{credError}</div>}
                {credSuccess && <div className="text-green-500 mb-2">{credSuccess}</div>}
                <div className="flex justify-between items-center mt-4">
                  <button type="button" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" onClick={() => setShowCredModal(false)} disabled={credLoading}>Cancel</button>
                  <button type="submit" className="bg-[#2bb6c4] hover:bg-[#1ea1b0] dark:bg-[#5ed1dc] dark:text-gray-900 dark:hover:bg-[#2bb6c4] text-white px-4 py-2 rounded-lg transition-all duration-200" disabled={credLoading}>{credLoading ? 'Sending...' : 'Send'}</button>
                </div>
              </form>
            ) : (
              <>
                <div className="text-red-500 text-center mb-4">This booking is no longer eligible for sending credentials (cancelled or more than 15 minutes old).</div>
                <div className="flex justify-center mt-4">
                  <button type="button" className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg transition-all duration-200" onClick={() => setShowCredModal(false)}>Close</button>
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
        @keyframes slide-in-down {
          from { opacity: 0; transform: translateY(-40px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-slide-in-down {
          animation: slide-in-down 0.7s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  );
}
