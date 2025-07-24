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
          className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-[#2bb6c4] focus-visible:ring-offset-2 active:scale-98" // Added focus-visible and active states
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              {/* Title text color adapts to dark mode. */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">My Subscriptions</h2> {/* Lighter text for dark mode title */}
              {/* Icon color adapts to dark mode. */}
              <CreditCard size={32} className="opacity-70 text-gray-600 dark:text-gray-400" /> {/* Slightly lighter icon */}
            </div>
            {/* Description text color adapts to dark mode. */}
            <p className="opacity-90 mb-6 text-gray-700 dark:text-gray-200">View and manage all your owned and borrowed subscriptions.</p> {/* Lighter text for dark mode description */}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              {/* Numbers with brand color, adapting to dark mode. */}
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{mySubscriptionsSummary.active}</p>
              {/* Label text color adapts to dark mode. */}
              <p className="text-xs opacity-80 text-gray-500 dark:text-gray-300">Active</p> {/* Lighter text for dark mode labels */}
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{mySubscriptionsSummary.owned}</p>
              <p className="text-xs opacity-80 text-gray-500 dark:text-gray-300">Owned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{mySubscriptionsSummary.borrowed}</p>
              <p className="text-xs opacity-80 text-gray-500 dark:text-gray-300">Borrowed</p>
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