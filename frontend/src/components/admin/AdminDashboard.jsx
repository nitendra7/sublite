import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import {
  Users,
  BookCopy,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import api from "../../utils/api";
import { useUser } from '../../context/UserContext';
import Loading from '../ui/Loading';

const AdminDashboard = () => {
  const { user, token } = useUser();
  const [stats, setStats] = useState({
    usersCount: 0,
    bookingsCount: 0,
    revenueTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return <Loading message="Loading admin dashboard..." />;
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
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
        </h1>
        <p className="text-gray-500 dark:text-gray-300">
          Here&apos;s what&apos;s happening with your platform today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <Link
          to="/admin/users"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border-2 border-[#b6effa] dark:border-[#263238] relative transition-all duration-200 hover:shadow-xl hover:scale-[1.04] focus-within:shadow-xl cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-600 dark:text-gray-100 tracking-wide mb-2">Total Users</p>
              <p className="text-4xl font-extrabold text-[#2bb6c4] dark:text-gray-100 drop-shadow-md mb-2">
                {stats.usersCount}
              </p>
            </div>
            <div className="relative">
              <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#e0f7fa] dark:bg-[#263238] opacity-90 z-0"></span>
              <Users className="w-12 h-12 z-10 relative text-[#2bb6c4] dark:text-[#5ed1dc] drop-shadow-lg" aria-label="Users Icon"/>
            </div>
          </div>
        </Link>

        {/* Total Bookings */}
        <Link
          to="/admin/bookings"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] transition-all duration-200 hover:shadow-xl hover:scale-[1.03] focus-within:shadow-xl cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Total Bookings</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">
                {stats.bookingsCount}
              </p>
            </div>
            <BookCopy className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </Link>

        {/* Total Revenue */}
        <Link
          to="/admin/payments"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] transition-all duration-200 hover:shadow-xl hover:scale-[1.03] focus-within:shadow-xl cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Total Revenue</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">
                ₹{stats.revenueTotal.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </Link>

        {/* Platform Health */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] transition-all duration-200 hover:shadow-xl hover:scale-[1.03] focus-within:shadow-xl cursor-pointer block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Platform Health</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Active
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management Card */}
        <Link
          to="/admin/users"
          className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-center hover:scale-105 transform transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#2bb6c4] focus-visible:ring-offset-2 active:scale-98 border border-gray-200 dark:border-gray-700 hover:shadow-xl"
        >
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Users size={48} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3">User Management</h2>
            <p className="text-gray-700 dark:text-gray-200 text-sm">
              Manage platform users and their accounts
            </p>
          </div>
        </Link>

        {/* Analytics Card */}
        <Link
          to="/admin/analytics"
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#2bb6c4] focus-visible:ring-offset-2 active:scale-98 border border-gray-200 dark:border-[#263238] hover:shadow-xl"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Analytics & Insights</h2>
              <TrendingUp size={32} className="text-[#2bb6c4] dark:text-[#5ed1dc]" aria-label="Analytics Icon"/>
            </div>
            <p className="text-gray-700 dark:text-gray-200 mb-6">
              View detailed analytics and platform performance metrics.
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
              {stats.bookingsCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Total Transactions</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;