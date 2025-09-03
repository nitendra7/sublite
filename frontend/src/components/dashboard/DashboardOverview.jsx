import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Wallet,
  LayoutGrid,
  CheckCircle
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

        // Log results for debugging
        console.log('API Results:', {
          bookings: bookingsRes.status,
          providedServices: providedServicesRes.status,
          wallet: walletRes.status,
          reviews: reviewsRes.status,
          notifications: notificationsRes.status,
          services: servicesRes.status
        });

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

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-full animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-500 dark:text-gray-300">
          Here&apos;s what&apos;s happening with your subscriptions today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Wallet Balance */}
        <Link
          to="/dashboard/wallet"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border-2 border-[#b6effa] dark:border-[#263238] relative transition-all duration-200 hover:shadow-xl hover:scale-[1.04] focus-within:shadow-xl cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-600 dark:text-gray-100 tracking-wide mb-2">Wallet Balance</p>
              <p className="text-4xl font-extrabold text-[#2bb6c4] dark:text-gray-100 drop-shadow-md mb-2">
                ₹{dashboardData.wallet.balance.toFixed(2)}
              </p>
            </div>
            <div className="relative">
              <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#e0f7fa] dark:bg-[#263238] opacity-90 z-0"></span>
              <Wallet className="w-12 h-12 z-10 relative text-[#2bb6c4] dark:text-[#5ed1dc] drop-shadow-lg" aria-label="Wallet Icon"/>
            </div>
          </div>
        </Link>

        {/* Active Subscriptions */}
        <Link
          to="/dashboard/subscriptions"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] transition-all duration-200 hover:shadow-xl hover:scale-[1.03] focus-within:shadow-xl cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Active Subscriptions</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">
                {dashboardData.subscriptions.active}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </Link>

        {/* Completed Subscriptions */}
        <Link
          to="/dashboard/subscriptions"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] transition-all duration-200 hover:shadow-xl hover:scale-[1.03] focus-within:shadow-xl cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Completed Subscriptions</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">
                {dashboardData.subscriptions.completed}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </Link>

        {/* Available Plans */}
        <Link
          to="/dashboard/available-plans"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] transition-all duration-200 hover:shadow-xl hover:scale-[1.03] focus-within:shadow-xl cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Available Plans</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">
                {dashboardData.availablePlans}
              </p>
            </div>
            <LayoutGrid className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" aria-label="Available Plans Icon"/>
          </div>
        </Link>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Subscriptions Card */}
        <Link
          to="/dashboard/subscriptions"
          className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-center hover:scale-105 transform transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#2bb6c4] focus-visible:ring-offset-2 active:scale-98 border border-gray-200 dark:border-gray-700 hover:shadow-xl"
        >
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <CreditCard size={48} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3">My Subscriptions</h2>
            <p className="text-gray-700 dark:text-gray-200 text-sm">
              Manage your owned and borrowed subscriptions
            </p>
          </div>
        </Link>

        {/* Available Plans Card */}
        <Link
          to="/dashboard/available-plans"
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#2bb6c4] focus-visible:ring-offset-2 active:scale-98 border border-gray-200 dark:border-[#263238] hover:shadow-xl"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Available Plans</h2>
              <LayoutGrid size={32} className="text-[#2bb6c4] dark:text-[#5ed1dc]" aria-label="Available Plans Icon"/>
            </div>
            <p className="text-gray-700 dark:text-gray-200 mb-6">
              Discover and join shared subscriptions from other users.
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
              {dashboardData.availablePlans}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Plans Available</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardOverview;
