// src/components/dashboard/AvailablePlansCard.jsx (Conceptual File)
import React from 'react';
import { Link } from 'react-router-dom';
import { Grid } from 'lucide-react'; // Assuming Grid icon for plans listed

// You might be passing props like `plansCount` to it, or it fetches its own data.
const AvailablePlansCard = ({ plansCount = 3 }) => {
  return (
    // Card container background and text color should adapt to dark mode
    <Link to="available-plans" className="lg:col-span-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transform transition-transform duration-300">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Available Plans</h2>
          <Grid size={32} className="opacity-70 text-gray-500 dark:text-gray-300" /> {/* Icon color */}
        </div>
        <p className="opacity-90 mb-6 text-gray-700 dark:text-gray-300"> {/* Body text color */}
          Discover and join shared subscriptions from other users.
        </p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{plansCount}</p> {/* Number color */}
        <p className="text-sm opacity-80 text-gray-500 dark:text-gray-400">Plans listed</p> {/* Small text color */}
      </div>
    </Link>
  );
};

export default AvailablePlansCard;