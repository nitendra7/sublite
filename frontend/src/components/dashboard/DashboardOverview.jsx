import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import AvailablePlansCard from './AvailablePlansCard';

// Mock data for user's subscriptions summary
const mySubscriptionsSummary = {
  active: 2,
  owned: 1,
  borrowed: 1,
};

// DashboardOverview component displays a summary of the user's dashboard.
const DashboardOverview = () => {
  return (
    // Main container for the overview section, adapting background and text colors to dark mode.
    <div className="p-6 md:p-10 min-h-full animate-fade-in">
      {/* Dashboard title and welcome message, with adaptable text colors for dark mode. */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Dashboard</h1>
      <p className="text-gray-500 dark:text-gray-300 mb-8">Welcome back! Here's an overview of your account.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Subscriptions Card */}
        <Link
          to="/dashboard/subscriptions"
          // Card background, text color, and shadow, adapting to dark mode.
          className="lg:col-span-1 bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-transform duration-300"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              {/* Title text color adapts to dark mode. */}
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Subscriptions</h2>
              {/* Icon color adapts to dark mode. */}
              <CreditCard size={32} className="opacity-70 text-gray-500 dark:text-gray-300" />
            </div>
            {/* Description text color adapts to dark mode. */}
            <p className="opacity-90 mb-6 text-gray-700 dark:text-gray-300">View and manage all your owned and borrowed subscriptions.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mt-auto">
            <div>
              {/* Numbers with brand color, adapting to dark mode. */}
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{mySubscriptionsSummary.active}</p>
              {/* Label text color adapts to dark mode. */}
              <p className="text-xs opacity-80 text-gray-500 dark:text-gray-400">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{mySubscriptionsSummary.owned}</p>
              <p className="text-xs opacity-80 text-gray-500 dark:text-gray-400">Owned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{mySubscriptionsSummary.borrowed}</p>
              <p className="text-xs opacity-80 text-gray-500 dark:text-gray-400">Borrowed</p>
            </div>
          </div>
        </Link>

        {/* Available Plans Card component. Its own file handles its dark mode styling. */}
        <AvailablePlansCard />
      </div>
    </div>
  );
};

export default DashboardOverview;