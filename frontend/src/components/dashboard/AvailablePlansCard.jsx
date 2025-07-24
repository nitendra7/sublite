import React from 'react';
import { Link } from 'react-router-dom';

// This component displays an overview card for available plans,
// typically used on a dashboard or overview page.
const AvailablePlansCard = ({ plansCount = 3 }) => {
  return (
    <Link
      to="available-plans"
      // Card container with responsive columns, background, shadow, and hover effects.
      // Explicit dark mode classes for background, text, and border for theme consistency.
      className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-[#2bb6c4] focus-visible:ring-offset-2 active:scale-98" // Added focus-visible and active states
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          {/* Card title with bold font and adaptable text colors for dark mode. */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Available Plans</h2> {/* Lighter text for dark mode title */}
          {/* Grid icon with adaptable text colors for dark mode. */}
          {/* Assuming Grid icon is no longer desired here as per previous clarification */}
          {/* <Grid size={32} className="opacity-70 text-gray-600 dark:text-gray-400" /> */}
        </div>
        {/* Card description with adaptable text colors for dark mode. */}
        <p className="opacity-90 mb-6 text-gray-700 dark:text-gray-200">
          Discover and join shared subscriptions from other users.
        </p>
      </div>
      <div className="text-center">
        {/* Plans count with brand color and adaptable dark mode color. */}
        <p className="text-4xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{plansCount}</p>
        {/* Label for plans count with adaptable text colors for dark mode. */}
        <p className="text-sm opacity-80 text-gray-500 dark:text-gray-300">Plans listed</p>
      </div>
    </Link>
  );
};

export default AvailablePlansCard;