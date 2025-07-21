import React, { useEffect, useState } from "react";
import { Bell, CheckCircle, Info, Gift } from "lucide-react";
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const API_BASE = "https://sublite-wmu2.onrender.com";

// Define icons with dark mode adaptable colors
const typeIcon = {
  booking: <CheckCircle className="text-blue-500 dark:text-blue-400" />,
  payment: <Info className="text-green-500 dark:text-green-400" />,
  reminder: <Bell className="text-yellow-500 dark:text-yellow-400" />,
  promotion: <Gift className="text-pink-500 dark:text-pink-400" />,
};

// Define background gradients for notification types with dark mode variants
const typeBg = {
  booking: "from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40",
  payment: "from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40",
  reminder: "from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40",
  promotion: "from-pink-50 to-pink-100 dark:from-pink-900/40 dark:to-pink-800/40",
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, loading: userContextLoading, error: userContextError } = useUser();
  const { darkMode } = useTheme();
  const userId = user?._id;

  useEffect(() => {
    if (!userContextLoading && !userContextError && userId) {
      async function fetchNotifications() {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          const res = await fetch(`${API_BASE}/api/notifications?userId=${userId}`, { headers });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || `HTTP error! Status: ${res.status}`);
          }
          setNotifications(data.reverse());
        } catch (err) {
          console.error("Error fetching notifications:", err.message);
          setNotifications([]);
        }
        setLoading(false);
      }
      fetchNotifications();
    } else if (!userContextLoading && !userId) {
        setNotifications([]);
        setLoading(false);
    }
  }, [userId, userContextLoading, userContextError]);

  if (userContextLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className="text-xl font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">Loading user data...</div>
        </div>
    );
  }

  if (userContextError || !userId) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              <div className="text-xl font-semibold text-red-500 dark:text-red-400">Authentication required to view notifications.</div>
          </div>
      );
  }

  return (
    // Main page container with adaptable background and text colors.
    <div className="min-h-screen py-10 px-4 relative overflow-hidden animate-fade-in
                    bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8 animate-slide-in-down">
          <Bell className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          <h1 className="text-3xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc] drop-shadow">Notifications</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 min-h-[300px] animate-fade-in">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg className="animate-spin h-8 w-8 text-[#2bb6c4] dark:text-[#5ed1dc]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
              <Bell className="w-12 h-12 mb-2 text-gray-400 dark:text-gray-500" />
              <span>No notifications yet.</span>
            </div>
          ) : (
            <ul className="space-y-4">
              {notifications.map((n, idx) => (
                <li
                  key={n._id}
                  className={`
                    flex items-start gap-4 rounded-xl px-5 py-4 shadow transition-all duration-500
                    bg-gradient-to-r ${typeBg[n.type] || "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700"}
                    hover:scale-[1.02] hover:shadow-lg
                    ${n.isRead ? "opacity-70" : "opacity-100"}
                    ${idx % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"}
                  `}
                  style={{ animationDelay: `${idx * 100 + 200}ms` }}
                >
                  <div className="pt-1">{typeIcon[n.type] || <Info className="text-gray-400 dark:text-gray-500" />}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{n.title}</span>
                      {!n.isRead && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-[#2bb6c4] text-white animate-pulse dark:bg-[#1ea1b0] dark:text-gray-100">New</span>
                      )}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mt-1">{n.message}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
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
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}