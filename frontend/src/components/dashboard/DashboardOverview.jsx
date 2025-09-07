import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  AlertTriangle,
  Star,
  Bell,
  Plus,
  Users,
  IndianRupee,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import Loading from "../ui/Loading";
import {
  filterValidServices,
  reportMissingProviders,
} from "../../utils/serviceUtils";

import api, { API_BASE } from "../../utils/api";

// DashboardOverview component displays a comprehensive summary of the user's dashboard.
const DashboardOverview = () => {
  const { user, token } = useUser();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    subscriptions: { active: 0, completed: 0, provided: 0, paused: 0 },
    wallet: { balance: 0, transactions: 0 },
    reviews: { given: 0, received: 0 },
    notifications: { unread: 0, total: 0 },
    availablePlans: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        console.log("API_BASE:", API_BASE);
        console.log("Token:", token ? "Present" : "Missing");

        const results = await Promise.allSettled([
          // Fetch user's bookings/subscriptions
          api.get("/bookings/my-bookings"),

          // Fetch services provided by the user
          api.get("/services/my-services"),

          // Fetch wallet data
          api.get("/wallettransactions"),

          // Fetch reviews data
          api.get("/reviews/my/reviews"),

          // Fetch notifications
          api.get("/notifications"),

          // Fetch available services
          api.get("/services"),
        ]);

        // Process results
        const [
          bookingsRes,
          providedServicesRes,
          walletRes,
          reviewsRes,
          notificationsRes,
          servicesRes,
        ] = results;

        const bookings =
          bookingsRes.status === "fulfilled" ? bookingsRes.value.data : [];

        const providedServices =
          providedServicesRes.status === "fulfilled"
            ? providedServicesRes.value.data
            : [];

        const walletTransactions =
          walletRes.status === "fulfilled" ? walletRes.value.data : [];

        const reviews =
          reviewsRes.status === "fulfilled" ? reviewsRes.value.data : [];

        const notifications =
          notificationsRes.status === "fulfilled"
            ? notificationsRes.value.data
            : [];

        const servicesData =
          servicesRes.status === "fulfilled" ? servicesRes.value.data : [];

        // Filter out services with missing providers
        const services = filterValidServices(servicesData);

        // Report any services with missing providers for debugging
        if (servicesData.length !== services.length) {
          reportMissingProviders(servicesData);
        }

        // Process data
        const activeBookings = bookings.filter(
          (b) =>
            b.bookingStatus === "active" ||
            b.bookingStatus === "confirmed" ||
            b.bookingStatus === "pending",
        );
        const completedBookings = bookings.filter(
          (b) => b.bookingStatus === "completed",
        );
        const pausedBookings = bookings.filter(
          (b) => b.bookingStatus === "paused",
        );

        const walletBalance = user?.walletBalance || 0;
        const unreadNotifications = notifications.filter(
          (n) => !n.isRead,
        ).length;

        setDashboardData({
          subscriptions: {
            active: activeBookings.length,
            completed: completedBookings.length,
            provided: providedServices.length,
            paused: pausedBookings.length,
          },
          wallet: {
            balance: walletBalance,
            transactions: walletTransactions.length,
          },
          reviews: {
            given: reviews.length,
            received: 0, // This would need a separate endpoint for reviews received
          },
          notifications: {
            unread: unreadNotifications,
            total: notifications.length,
          },
          availablePlans: services.length,
          recentActivity: walletTransactions.slice(0, 3), // Last 3 transactions
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user]);

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in">
        <div className="text-center text-red-500 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Welcome back, {user?.name?.split(" ")[0] || "Nitendra"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here&apos;s what&apos;s happening with your subscriptions today.
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc] mb-1">
            {dashboardData.subscriptions.active}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc] mb-1">
            ₹{dashboardData.wallet.balance.toLocaleString("en-IN")}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Balance
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc] mb-1">
            {dashboardData.availablePlans}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Plans</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc] mb-1">
            {dashboardData.notifications.unread}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Alerts</div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - My Subscriptions */}
        <div className="lg:col-span-1">
          <Link
            to="/dashboard/subscriptions"
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 h-full flex flex-col card-hover hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                My Subscriptions
              </h2>
              <Users className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  Active
                </span>
                <span className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                  {dashboardData.subscriptions.active}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  Paused
                </span>
                <span className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                  {dashboardData.subscriptions.paused || 3}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  Completed
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {dashboardData.subscriptions.completed}
                </span>
              </div>
            </div>

            <div className="mt-6 w-full bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Manage Subscriptions
            </div>
          </Link>
        </div>

        {/* Middle Column - Wallet Balance */}
        <div className="lg:col-span-1">
          <Link
            to="/dashboard/wallet"
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 h-full flex flex-col card-hover hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Wallet Balance
              </h2>
              <IndianRupee className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>

            <div className="text-center mb-6 flex-1 flex flex-col justify-center">
              <div className="text-4xl font-bold mb-2 text-[#2bb6c4] dark:text-[#5ed1dc]">
                ₹{dashboardData.wallet.balance.toLocaleString("en-IN")}
              </div>
              {dashboardData.wallet.balance < 100 && (
                <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Low Balance
                </div>
              )}
              {dashboardData.wallet.balance >= 100 && (
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Available Balance
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/dashboard/wallet#add-money");
                }}
                className="w-full bg-[#2bb6c4] hover:bg-[#1ea1b0] dark:bg-[#5ed1dc] dark:hover:bg-[#2bb6c4] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Money
              </button>
            </div>
          </Link>
        </div>

        {/* Right Column - Available Plans */}
        <div className="lg:col-span-1">
          <Link
            to="/dashboard/available-plans"
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 h-full flex flex-col card-hover hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Available Plans
              </h2>
              <LayoutGrid className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>

            <div className="text-center mb-6 flex-1 flex flex-col justify-center">
              <div className="text-4xl font-bold mb-2 text-[#2bb6c4] dark:text-[#5ed1dc]">
                {dashboardData.availablePlans}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                Premium services available
              </p>
            </div>

            <div className="w-full bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Browse Plans
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/dashboard/add-service"
              className="p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-[#2bb6c4]/5 dark:hover:bg-[#5ed1dc]/10 hover:border-[#2bb6c4]/30 dark:hover:border-[#5ed1dc]/30 transition-all duration-200 group border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-lg flex items-center justify-center group-hover:bg-[#2bb6c4]/20 dark:group-hover:bg-[#5ed1dc]/20 transition-colors duration-200">
                  <Plus className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#2bb6c4] dark:group-hover:text-[#5ed1dc] transition-colors duration-200">
                    Add Service
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Create new subscription
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/dashboard/reviews"
              className="p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-[#2bb6c4]/5 dark:hover:bg-[#5ed1dc]/10 hover:border-[#2bb6c4]/30 dark:hover:border-[#5ed1dc]/30 transition-all duration-200 group border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-lg flex items-center justify-center group-hover:bg-[#2bb6c4]/20 dark:group-hover:bg-[#5ed1dc]/20 transition-colors duration-200">
                  <Star className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#2bb6c4] dark:group-hover:text-[#5ed1dc] transition-colors duration-200">
                    Reviews
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Rate services
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/dashboard/notifications"
              className="p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-[#2bb6c4]/5 dark:hover:bg-[#5ed1dc]/10 hover:border-[#2bb6c4]/30 dark:hover:border-[#5ed1dc]/30 transition-all duration-200 group border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-lg flex items-center justify-center group-hover:bg-[#2bb6c4]/20 dark:group-hover:bg-[#5ed1dc]/20 transition-colors duration-200">
                  <Bell className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#2bb6c4] dark:group-hover:text-[#5ed1dc] transition-colors duration-200">
                    Notifications
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    View alerts
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      {dashboardData.recentActivity.length > 0 && (
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
              <Link
                to="/dashboard/wallet"
                className="text-[#2bb6c4] dark:text-[#5ed1dc] hover:underline text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.recentActivity.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === "credit"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-red-100 dark:bg-red-900/20"
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${
                          transaction.type === "credit"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {transaction.description || "Wallet Transaction"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      transaction.type === "credit"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₹
                    {transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
