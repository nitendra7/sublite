import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Wallet as WalletIcon,
  LayoutGrid,
  CheckCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Loading from '../ui/Loading';

import api, { API_BASE } from '../../utils/api';

// DashboardOverview component displays a comprehensive summary of the user's dashboard.
const DashboardOverview = () => {
  const { user, token } = useUser();
  const [dashboardData, setDashboardData] = useState({
    subscriptions: { active: 0, completed: 0, provided: 0 },
    wallet: { balance: 0, transactions: 0 },
    reviews: { given: 0, received: 0 },
    notifications: { unread: 0, total: 0 },
    availablePlans: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        console.log('API_BASE:', API_BASE);
        console.log('Token:', token ? 'Present' : 'Missing');

        const results = await Promise.allSettled([
          // Fetch user's bookings/subscriptions
          api.get('/bookings/my-bookings'),

          // Fetch services provided by the user
          api.get('/services/my-services'),

          // Fetch wallet data
          api.get('/wallettransactions'),

          // Fetch reviews data
          api.get('/reviews/my/reviews'),

          // Fetch notifications
          api.get('/notifications'),

          // Fetch available services
          api.get('/services')
        ]);

        // Process results
        const [bookingsRes, providedServicesRes, walletRes, reviewsRes, notificationsRes, servicesRes] = results;

        const bookings = bookingsRes.status === 'fulfilled'
          ? bookingsRes.value.data
          : [];

        const providedServices = providedServicesRes.status === 'fulfilled'
          ? providedServicesRes.value.data
          : [];

        const walletTransactions = walletRes.status === 'fulfilled'
          ? walletRes.value.data
          : [];

        const reviews = reviewsRes.status === 'fulfilled'
          ? reviewsRes.value.data
          : [];

        const notifications = notificationsRes.status === 'fulfilled'
          ? notificationsRes.value.data
          : [];

        const services = servicesRes.status === 'fulfilled'
          ? servicesRes.value.data
          : [];

        // Process data
        const activeBookings = bookings.filter(b => b.bookingStatus === 'active' || b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending');
        const completedBookings = bookings.filter(b => b.bookingStatus === 'completed');

        const walletBalance = user?.walletBalance || 0;
        const unreadNotifications = notifications.filter(n => !n.isRead).length;

        setDashboardData({
          subscriptions: {
            active: activeBookings.length,
            completed: completedBookings.length,
            provided: providedServices.length
          },
          wallet: {
            balance: walletBalance,
            transactions: walletTransactions.length
          },
          reviews: {
            given: reviews.length,
            received: 0 // This would need a separate endpoint for reviews received
          },
          notifications: {
            unread: unreadNotifications,
            total: notifications.length
          },
          availablePlans: services.length,
          recentActivity: walletTransactions.slice(0, 3) // Last 3 transactions
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
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

  // Calculate metrics for KPIs
  const activeCount = dashboardData.subscriptions.active;
  const completedCount = dashboardData.subscriptions.completed;
  const totalSubscriptions = activeCount + completedCount;

  // Mock data for due this week and expired (you may need to implement real logic)
  const dueThisWeek = Math.floor(Math.random() * 3); // Mock data
  const expired = Math.floor(Math.random() * 2); // Mock data

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-full animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-500 dark:text-gray-300 text-sm">
          Here's what's happening with your subscriptions today.
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Subscriptions Hero Card - col-span-8 */}
        <div className="col-span-12 xl:col-span-8 xl:min-h-[400px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2bb6c406] dark:bg-[#2bb6c4]/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#2bb6c4]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Subscriptions</h2>
              </div>
              <Link
                to="/dashboard/subscriptions"
                className="px-6 py-3 bg-[#2bb6c4] text-white rounded-lg hover:bg-[#1ea1b0] transition-all duration-150 font-semibold min-h-[48px] shadow-md hover:shadow-lg text-lg text-center"
              >
                Manage All
              </Link>
            </div>

            {/* KPI Strip - 3 Equal Items */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Active</div>
                {activeCount > 0 && <div className="h-2 w-2 bg-green-500 rounded-full mx-auto mt-2"></div>}
              </div>
              <div className="text-center p-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {dueThisWeek}
                  {dueThisWeek > 0 && <div className="h-2 w-2 bg-amber-500 rounded-full mx-auto mt-1"></div>}
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">Due This Week</div>
              </div>
              <div className="text-center p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {expired}
                  {expired > 0 && <div className="h-2 w-2 bg-red-500 rounded-full mx-auto mt-1"></div>}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Expired</div>
              </div>
            </div>

            {/* Empty State or Mini-List */}
            {totalSubscriptions === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#2bb6c406] dark:bg-[#2bb6c4]/20 rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-[#2bb6c4]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Welcome to Subscriptions!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Start saving money on your favorite services by joining shared subscriptions. No subscriptions added yet.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Explore Available Plans</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Browse and join shared subscriptions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-orange-500" />
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Top Up Your Wallet</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Add funds to start subscribing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <LayoutGrid className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Manage Subscriptions</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Track renewals and payments</p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/dashboard/available-plans"
                  className="block w-full px-6 py-3 bg-[#2bb6c4] text-white text-center rounded-lg hover:bg-[#1ea1b0] transition-all duration-150 font-semibold text-lg min-h-[48px] shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mock subscription items - replace with real data */}
                {Array.from({ length: Math.min(totalSubscriptions, 3) }, (_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {/* Service icon placeholder */}
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {"Mock Service " + (i + 1)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Next billing: {"Feb " + (15 + i)} • ₹{(299 + i * 50).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      i === 0 ? 'bg-[#2bb6c406] text-[#2bb6c4]' :
                      i === 1 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {i === 0 ? 'Active' : i === 1 ? 'Due Soon' : 'Expired'}
                    </span>
                  </div>
                ))}
                {totalSubscriptions > 3 && (
                  <div className="text-center mt-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      +{totalSubscriptions - 3} more subscriptions
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Wallet + Plans */}
        <div className="col-span-12 xl:col-span-4 xl:min-h-[400px] space-y-6">
          {/* Wallet Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
            {dashboardData.wallet.balance < 100 && (
              <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Low Balance
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#2bb6c406] dark:bg-[#2bb6c4]/20 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-[#2bb6c4]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Wallet Balance</h3>
            </div>
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ₹{dashboardData.wallet.balance.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="space-y-3">
              <Link
                to="/dashboard/wallet"
                className="block w-full px-6 py-3 bg-[#2bb6c4] text-white text-center rounded-lg hover:bg-[#1ea1b0] transition-all duration-150 font-semibold text-lg min-h-[48px] shadow-md hover:shadow-lg"
              >
                Top Up
              </Link>
              <Link
                to="/dashboard/wallet"
                className="block w-full px-6 py-3 border border-[#2bb6c4] text-[#2bb6c4] hover:bg-[#2bb6c406] hover:text-[#1ea1b0] text-center rounded-lg transition-all duration-150 font-semibold text-lg min-h-[48px] shadow-md hover:shadow-lg"
              >
                View Transactions
              </Link>
            </div>
          </div>

          {/* Available Plans Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#2bb6c406] dark:bg-[#2bb6c4]/20 rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-[#2bb6c4]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Available Plans</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <span className="px-3 py-2 bg-[#2bb6c406] dark:bg-[#2bb6c4]/20 text-[#2bb6c4] dark:text-[#5ed1dc] text-sm font-medium rounded-lg text-center block">
                {dashboardData.availablePlans} Plans
              </span>
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg text-center block">
                Group Savings
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Join shared subscriptions and save money with group pricing on popular services.
            </p>

            <Link
              to="/dashboard/available-plans"
              className="block w-full px-6 py-3 bg-[#2bb6c4] text-white text-center rounded-lg hover:bg-[#1ea1b0] transition-all duration-150 font-semibold text-lg min-h-[48px] shadow-md hover:shadow-lg"
            >
              Explore Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
