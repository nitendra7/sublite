import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Bell,
  CheckCircle,
  Info,
  Gift,
  Loader2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import Loading from "../components/ui/Loading";

import api from "../utils/api";

const SendCredentialsButton = ({ bookingId, onOpenModal }) => {
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingCreatedAt, setBookingCreatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const bookingRes = await api.get(`/bookings/${bookingId}`);
        const booking = bookingRes.data;
        setBookingStatus(booking.bookingStatus);
        setBookingCreatedAt(booking.createdAt);
      } catch (err) {
        console.error("Failed to fetch booking details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const isEligible = () => {
    if (isLoading || !bookingStatus || !bookingCreatedAt) return false;
    if (bookingStatus !== "pending") return false;
    const created = new Date(bookingCreatedAt);
    const now = new Date();
    const diffMinutes = (now - created) / (1000 * 60);
    return diffMinutes <= 15;
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="mt-3 px-4 py-2 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-all duration-200"
      >
        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
        Loading...
      </button>
    );
  }

  return (
    <button
      className={`mt-3 px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
        isEligible()
          ? "bg-[#2bb6c4] text-white hover:bg-[#1ea1b0] dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4] shadow-lg hover:shadow-xl"
          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
      }`}
      onClick={() => {
        if (isEligible()) {
          onOpenModal(bookingId);
        }
      }}
      disabled={!isEligible()}
      title={
        !isEligible()
          ? "Booking not eligible (must be pending and within 15 minutes)"
          : ""
      }
    >
      Send Credentials
    </button>
  );
};

SendCredentialsButton.propTypes = {
  bookingId: PropTypes.string.isRequired,
  onOpenModal: PropTypes.func.isRequired,
};

const typeIcon = {
  booking: (
    <CheckCircle className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />
  ),
  payment: <Info className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />,
  reminder: <Bell className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />,
  promotion: <Gift className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />,
};

export default function NotificationsPage() {
  const { loading: loadingUser } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [showCredModal, setShowCredModal] = useState(false);
  const [credBookingId, setCredBookingId] = useState(null);
  const [credValues, setCredValues] = useState({
    username: "",
    password: "",
    profileName: "",
    accessInstructions: "",
  });
  const [credLoading, setCredLoading] = useState(false);
  const [credError, setCredError] = useState("");
  const [credBookingCreatedAt, setCredBookingCreatedAt] = useState(null);

  const markRead = async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/read`);
      return true;
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      return false;
    }
  };

  const confirmBooking = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/confirm`);
    } catch (err) {
      console.error("Failed to confirm booking:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/notifications`);
      setNotifications(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCredModal = async (bookingId) => {
    try {
      const bookingRes = await api.get(`/bookings/${bookingId}`);
      const booking = bookingRes.data;
      setCredBookingCreatedAt(booking.createdAt);
      setCredBookingId(bookingId);
      setShowCredModal(true);
      setCredError("");
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
      setCredError("Failed to load booking details");
    }
  };

  const handleCredChange = (e) => {
    setCredValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendCredentials = async (e) => {
    e.preventDefault();
    setCredLoading(true);
    setCredError("");

    try {
      await api.post(`/bookings/${credBookingId}/send-message`, credValues);
      setShowCredModal(false);
      setCredValues({
        username: "",
        password: "",
        profileName: "",
        accessInstructions: "",
      });
      await fetchNotifications();
    } catch (err) {
      setCredError(err.message);
    } finally {
      setCredLoading(false);
    }
  };

  const canSendNow = () => {
    if (!credBookingCreatedAt) return false;
    const created = new Date(credBookingCreatedAt);
    const now = new Date();
    const diffMinutes = (now - created) / (1000 * 60);
    return diffMinutes <= 15;
  };

  useEffect(() => {
    if (!loadingUser) {
      fetchNotifications();
    }
  }, [loadingUser]);

  if (loading) {
    return <Loading message="Loading notifications..." />;
  }

  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Notifications
            </h1>
            <p className="text-gray-500 dark:text-gray-300">
              Stay updated with your latest activities and messages.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Notifications
              </p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {notifications.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Unread
              </p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {notifications.filter((n) => !n.isRead).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500 dark:text-red-400">
            <p className="text-lg font-semibold mb-2">
              Error loading notifications
            </p>
            <p className="text-sm">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You&apos;ll see notifications here when you have new activities.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((n, idx) => (
              <div
                key={n._id}
                className={`p-6 transition-all duration-300 cursor-pointer animate-fade-in hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  n.isRead ? "opacity-70" : "opacity-100"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={async () => {
                  if (!n.isRead) {
                    setNotifications((prev) =>
                      prev.map((notification) =>
                        notification._id === n._id
                          ? { ...notification, isRead: true }
                          : notification,
                      ),
                    );
                    const success = await markRead(n._id);
                    if (!success) {
                      setNotifications((prev) =>
                        prev.map((notification) =>
                          notification._id === n._id
                            ? { ...notification, isRead: false }
                            : notification,
                        ),
                      );
                    }
                  }
                  setExpandedId(expandedId === n._id ? null : n._id);
                  if (n.title === "Access Details Received!" && n.relatedId)
                    await confirmBooking(n.relatedId);
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {typeIcon[n.type] || (
                      <Info className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-lg ${n.isRead ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-100"}`}
                        >
                          {n.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Send Credentials Button */}
                    {n.title === "New Booking!" && n.relatedId && (
                      <SendCredentialsButton
                        bookingId={n.relatedId}
                        onOpenModal={openCredModal}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credentials Modal */}
      {showCredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Send Credentials
              </h2>

              {canSendNow() ? (
                <form onSubmit={handleSendCredentials} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={credValues.username}
                      onChange={handleCredChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="text"
                      name="password"
                      value={credValues.password}
                      onChange={handleCredChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="profileName"
                      value={credValues.profileName}
                      onChange={handleCredChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Access Instructions (Optional)
                    </label>
                    <textarea
                      name="accessInstructions"
                      value={credValues.accessInstructions}
                      onChange={handleCredChange}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200 resize-none"
                    />
                  </div>

                  {credError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                      {credError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={credLoading}
                      className="flex-1 bg-[#2bb6c4] text-white py-3 rounded-xl font-semibold hover:bg-[#1ea1b0] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {credLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Credentials"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCredModal(false)}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    Time Expired
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Credentials can only be sent within 15 minutes of booking
                    creation.
                  </p>
                  <button
                    onClick={() => setShowCredModal(false)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
