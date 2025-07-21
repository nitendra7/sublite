import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, LayoutGrid, List } from 'lucide-react'; // LayoutGrid and List for view toggle

// Mock data for the detailed plans list
const availablePlansList = [
  { id: 1, serviceName: 'Netflix Premium', description: 'Watch on 4 screens at once in Ultra HD.', rentalPrice: 150, slots: 1, totalSlots: 4, owner: 'Alex', rentalDuration: 30 },
  { id: 2, serviceName: 'Spotify Family', description: '6 premium accounts for family members living under one roof.', rentalPrice: 50, slots: 2, totalSlots: 6, owner: 'Maria', rentalDuration: 30 },
  { id: 3, serviceName: 'YouTube Premium', description: 'Ad-free & background play. YouTube Music Premium included.', rentalPrice: 40, slots: 3, totalSlots: 5, owner: 'John', rentalDuration: 30 },
];

const Availableplans = () => {
  const navigate = useNavigate();
  const [isGridView, setIsGridView] = useState(false); // State to manage view type (true for grid, false for list)
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const handleViewPlan = (plan) => {
    navigate('/subscription-details', { state: { plan } });
  };

  const toggleView = () => {
    setIsGridView(prevState => !prevState);
  };

  // Filter plans based on search term
  const filteredPlans = availablePlansList.filter(plan =>
    plan.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Main page container with background and text colors adapting to dark mode.
    <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-8">
        {/* Page title with adaptable text colors. */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">All Available Plans</h1>
        {/* View toggle button */}
        <button
          onClick={toggleView}
          // Button styling: ensure background and text color adapt to dark mode for icon visibility.
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title={isGridView ? "Switch to List View" : "Switch to Grid View"}
        >
          {/* Icon color handled by parent button's text color */}
          {isGridView ? <List size={24} /> : <LayoutGrid size={24} />}
        </button>
      </div>
      
      {/* Search Input for Available Plans */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search plans by name, owner, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // Input field styling: background, border, text, and placeholder colors adapt to dark mode.
          className="w-full max-w-xl rounded-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-colors"
        />
      </div>
      
      {/* Page description with adaptable text colors (improved contrast). */}
      <p className="text-gray-600 dark:text-gray-300 mb-8">Browse and join shared subscriptions from the community.</p>

      {/* Conditional rendering based on view type */}
      <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredPlans.length > 0 ? (
          filteredPlans.map(plan => (
            <div key={plan.id}
                 // Card background, shadow, and general text colors adapting to dark mode.
                 // Ensure text inside is dark in light mode, light in dark mode.
                 className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex 
                             ${isGridView ? 'flex-col items-center text-center' : 'flex-col sm:flex-row items-center justify-between'} 
                             hover:shadow-lg transition-shadow text-gray-900 dark:text-gray-100`} 
            >
              <div className={`flex-grow ${isGridView ? 'mb-2' : 'mb-3 sm:mb-0'} ${isGridView ? 'text-center' : ''}`}>
                {/* Title text color - now inherits from card, which has dark mode text. */}
                <p className="font-bold text-lg">{plan.serviceName}</p>
                <div className={`flex items-center text-sm gap-4 mt-1 ${isGridView ? 'justify-center' : ''}`}>
                  {/* Icon colors and text - ensure these are visible too */}
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><Users size={14} className="text-gray-500 dark:text-gray-400" /> {plan.slots}/{plan.totalSlots} slots available</span>
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><Star size={14} className="text-gray-500 dark:text-gray-400" /> Shared by {plan.owner}</span>
                </div>
              </div>
              <div className={`flex items-center gap-4 ${isGridView ? 'flex-col' : ''}`}>
                {/* Price text color - brand color adapts to dark mode. */}
                <p className="text-xl font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">₹{plan.rentalPrice}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/slot</span></p>
                <button
                  onClick={() => handleViewPlan(plan)}
                  // View button styling - background, text, and hover effects adapt to dark mode.
                  className="bg-[#2bb6c4] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#1ea1b0] transition-colors shadow dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4] dark:text-gray-100"
                >
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          // Message for no matching plans found, with adaptable text colors.
          <div className="text-center text-gray-600 dark:text-gray-400 col-span-full">
            No matching plans found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Availableplans;