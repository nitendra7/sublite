import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import AvailablePlansCard from '../components/dashboard/AvailablePlansCard';

// Mock data for user's subscriptions summary
const mySubscriptionsSummary = {
  active: 2,
  owned: 1,
  borrowed: 1,
};

const DashboardOverview = () => {
  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Dashboard</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Welcome back! Here's an overview of your account.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Subscriptions Card */}
        <Link to="/dashboard/subscriptions" className="lg:col-span-1 bg-gradient-to-br from-[#2bb6c4] to-[#1ea1b0] text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-transform duration-300">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Subscriptions</h2>
              <CreditCard size={32} className="opacity-70" />
            </div>
            <p className="opacity-90 mb-6">View and manage all your owned and borrowed subscriptions.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mt-auto">
            <div>
              <p className="text-2xl font-bold">{mySubscriptionsSummary.active}</p>
              <p className="text-xs opacity-80">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{mySubscriptionsSummary.owned}</p>
              <p className="text-xs opacity-80">Owned</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{mySubscriptionsSummary.borrowed}</p>
              <p className="text-xs opacity-80">Borrowed</p>
            </div>
          </div>
        </Link>

        {/* Available Plans Card (from the new component) */}
        <AvailablePlansCard />
      </div>
    </div>
  );
};

export default DashboardOverview;