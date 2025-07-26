import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Wallet, 
  Star, 
  Bell, 
  TrendingUp, 
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// DashboardOverview component displays a comprehensive summary of the user's dashboard.
const DashboardOverview = () => {
  const { user, token } = useUser();
  const [dashboardData, setDashboardData] = useState({
    subscriptions: { active: 0, owned: 0, borrowed: 0 },
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
          fetch(`${API_BASE}/api/bookings/my-bookings`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          
          // Fetch wallet data
          fetch(`${API_BASE}/api/wallettransactions`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          
          // Fetch reviews data
          fetch(`${API_BASE}/api/reviews/my/reviews`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          
          // Fetch notifications
          fetch(`${API_BASE}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          
          // Fetch available services
          fetch(`${API_BASE}/api/services`)
        ]);
        
        // Process results
        const [bookingsRes, walletRes, reviewsRes, notificationsRes, servicesRes] = results;
        
        // Log results for debugging
        console.log('API Results:', {
          bookings: { status: bookingsRes.status, ok: bookingsRes.status === 'fulfilled' ? bookingsRes.value.ok : false },
          wallet: { status: walletRes.status, ok: walletRes.status === 'fulfilled' ? walletRes.value.ok : false },
          reviews: { status: reviewsRes.status, ok: reviewsRes.status === 'fulfilled' ? reviewsRes.value.ok : false },
          notifications: { status: notificationsRes.status, ok: notificationsRes.status === 'fulfilled' ? notificationsRes.value.ok : false },
          services: { status: servicesRes.status, ok: servicesRes.status === 'fulfilled' ? servicesRes.value.ok : false }
        });
        
        const bookings = bookingsRes.status === 'fulfilled' && bookingsRes.value.ok 
          ? await bookingsRes.value.json() 
          : [];
        
        const walletTransactions = walletRes.status === 'fulfilled' && walletRes.value.ok 
          ? await walletRes.value.json() 
          : [];
        
        const reviews = reviewsRes.status === 'fulfilled' && reviewsRes.value.ok 
          ? await reviewsRes.value.json() 
          : [];
        
        const notifications = notificationsRes.status === 'fulfilled' && notificationsRes.value.ok 
          ? await notificationsRes.value.json() 
          : [];
        
        const services = servicesRes.status === 'fulfilled' && servicesRes.value.ok 
          ? await servicesRes.value.json() 
          : [];
        
        // Process data
        const activeBookings = bookings.filter(b => b.bookingStatus === 'active' || b.bookingStatus === 'confirmed');
        const ownedServices = bookings.filter(b => b.providerId === user._id);
        const borrowedServices = bookings.filter(b => b.clientId === user._id && b.providerId !== user._id);
        
        const walletBalance = user?.walletBalance || 0;
        const unreadNotifications = notifications.filter(n => !n.isRead).length;
        
        setDashboardData({
          subscriptions: {
            active: activeBookings.length,
            owned: ownedServices.length,
            borrowed: borrowedServices.length
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
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bb6c4] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
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
    <div className="p-6 md:p-10 min-h-full animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-500 dark:text-gray-300">
          Here's what's happening with your subscriptions today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Wallet Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Balance</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                ₹{dashboardData.wallet.balance.toFixed(2)}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscriptions</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {dashboardData.subscriptions.active}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Plans</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {dashboardData.availablePlans}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </div>

        {/* Unread Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unread Notifications</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {dashboardData.notifications.unread}
              </p>
            </div>
            <Bell className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Subscriptions Card */}
        <Link
          to="/dashboard/subscriptions"
          className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#2bb6c4] focus-visible:ring-offset-2 active:scale-98 border border-gray-200 dark:border-gray-700"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">My Subscriptions</h2>
              <CreditCard size={32} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
            <p className="text-gray-700 dark:text-gray-200 mb-6">
              Manage your owned and borrowed subscriptions.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {dashboardData.subscriptions.active}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300">Active</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {dashboardData.subscriptions.owned}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300">Owned</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {dashboardData.subscriptions.borrowed}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300">Borrowed</p>
            </div>
          </div>
        </Link>

        {/* Available Plans Card */}
        <Link
          to="/dashboard/available-plans"
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#2bb6c4] focus-visible:ring-offset-2 active:scale-98 border border-gray-200 dark:border-gray-700"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Available Plans</h2>
              <TrendingUp size={32} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
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

      {/* Recent Activity Section */}
      {dashboardData.recentActivity.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {activity.type === 'credit' ? 'Added' : 'Spent'} ₹{activity.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    activity.type === 'credit' 
                      ? 'text-[#2bb6c4] dark:text-[#5ed1dc]' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {activity.type === 'credit' ? '+' : '-'}₹{activity.amount.toFixed(2)}
                  </span>
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