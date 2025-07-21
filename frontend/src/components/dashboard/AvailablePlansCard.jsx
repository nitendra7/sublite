import React from 'react';
import { Link } from 'react-router-dom';

const AvailablePlansCard = ({ plansCount = 3 }) => {
  return (
    <Link
      to="available-plans"
      className="lg:col-span-2 bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-transform duration-300"
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          {/* Card title with bold font and adaptable text colors for dark mode. */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Available Plans</h2>
        </div>
        {/* Card description with adaptable text colors for dark mode. */}
        <p className="opacity-90 mb-6 text-gray-700 dark:text-gray-300">
          Discover and join shared subscriptions from other users.
        </p>
      </div>
      <div className="text-center">
        {/* Plans count with brand color and adaptable dark mode color. */}
        <p className="text-4xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{plansCount}</p>
        {/* Label for plans count with adaptable text colors for dark mode. */}
        <p className="text-sm opacity-80 text-gray-500 dark:text-gray-400">Plans listed</p>
      </div>
    </Link>
  );
};

export default AvailablePlansCard;