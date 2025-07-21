import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, LayoutGrid } from 'lucide-react';

// Mock data for the detailed plans list
const availablePlansList = [
  { id: 1, serviceName: 'Netflix Premium', description: 'Watch on 4 screens at once in Ultra HD.', rentalPrice: 150, slots: 1, totalSlots: 4, owner: 'Alex', rentalDuration: 30 },
  { id: 2, serviceName: 'Spotify Family', description: '6 premium accounts for family members living under one roof.', rentalPrice: 50, slots: 2, totalSlots: 6, owner: 'Maria', rentalDuration: 30 },
  { id: 3, serviceName: 'YouTube Premium', description: 'Ad-free & background play. YouTube Music Premium included.', rentalPrice: 40, slots: 3, totalSlots: 5, owner: 'John', rentalDuration: 30 },
];

const Availableplans = () => { // This component is for the dedicated Available Plans page
  const navigate = useNavigate();
  const handleViewPlan = (plan) => {
    navigate('/subscription-details', { state: { plan } });
  };

  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">All Available Plans</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Browse and join shared subscriptions from the community.</p>

      <div className="space-y-4">
        {availablePlansList.map(plan => (
          <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col sm:flex-row items-center justify-between hover:shadow-lg transition-shadow">
            <div className="flex-grow mb-3 sm:mb-0">
              <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{plan.serviceName}</p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4 mt-1">
                <span className="flex items-center gap-1"><Users size={14} /> {plan.slots}/{plan.totalSlots} slots available</span>
                <span className="flex items-center gap-1"><Star size={14} /> Shared by {plan.owner}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xl font-semibold text-[#2bb6c4]">₹{plan.rentalPrice}<span className="text-sm font-normal text-gray-500">/slot</span></p>
              <button
                onClick={() => handleViewPlan(plan)}
                className="bg-[#2bb6c4] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#1ea1b0] transition-colors shadow"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Availableplans;