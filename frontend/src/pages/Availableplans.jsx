import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, LayoutGrid, List } from 'lucide-react';
import { useUser } from '../context/UserContext'; // To get the auth token

const API_BASE = "https://sublite-wmu2.onrender.com";

// This should fetch from your backend, not use mock data
// const availablePlansList = [ ... ];

const Availableplans = () => {
  const navigate = useNavigate();
  const { token } = useUser(); // Get token for authenticated requests
  const [isGridView, setIsGridView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]); // State to hold plans from backend
  const [loading, setLoading] = useState(true);

 // Fetch plans from the backend when the component mounts
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/services`);
        const data = await res.json();

        // FIX: Check if the API response is an array before setting state
        if (Array.isArray(data)) {
          setPlans(data);
        } else {
          // If the API sends an object like { services: [...] }, you could handle it here:
          // else if (data && Array.isArray(data.services)) {
          //   setPlans(data.services);
          // }
          console.error("API did not return an array of plans:", data);
          setPlans([]); // Default to an empty array to prevent the app from crashing
        }

      } catch (error) {
        console.error("Failed to fetch plans:", error);
        setPlans([]); // Also default to an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // =================================================================
  // == NEW FUNCTION to handle buying a plan with wallet balance   ==
  // =================================================================
  const handleBuyPlan = async (serviceId) => {
    if (!window.confirm("Are you sure you want to purchase this plan using your wallet balance?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings/pay-from-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceId: serviceId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'An error occurred.');
      }

      alert('Purchase successful! You can view it in "My Subscriptions".');
      navigate('/dashboard/subscriptions');

    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const toggleView = () => {
    setIsGridView(prevState => !prevState);
  };

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plan.provider?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">All Available Plans</h1>
        <button
          onClick={toggleView}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title={isGridView ? "Switch to List View" : "Switch to Grid View"}
        >
          {isGridView ? <List size={24} /> : <LayoutGrid size={24} />}
        </button>
      </div>
      
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search plans by name, owner, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xl rounded-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-colors"
        />
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">Browse and join shared subscriptions from the community.</p>

      {loading ? <p>Loading plans...</p> : (
        <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredPlans.length > 0 ? (
            filteredPlans.map(plan => (
              <div key={plan._id}
                   className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex 
                               ${isGridView ? 'flex-col items-center text-center' : 'flex-col sm:flex-row items-center justify-between'} 
                               hover:shadow-lg transition-shadow text-gray-900 dark:text-gray-100`}
              >
                <div className={`flex-grow ${isGridView ? 'mb-2' : 'mb-3 sm:mb-0'} ${isGridView ? 'text-center' : ''}`}>
                  <p className="font-bold text-lg">{plan.name}</p>
                  <div className={`flex items-center text-sm gap-4 mt-1 ${isGridView ? 'justify-center' : ''}`}>
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><Users size={14} className="text-gray-500 dark:text-gray-400" /> {plan.slotsAvailable}/{plan.totalSlots} slots available</span>
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><Star size={14} className="text-gray-500 dark:text-gray-400" /> Shared by {plan.provider?.name || '...'}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-4 ${isGridView ? 'flex-col' : ''}`}>
                  <p className="text-xl font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">₹{plan.price}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/slot</span></p>
                  <button
                    onClick={() => handleBuyPlan(plan._id)}
                    className="bg-[#2bb6c4] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#1ea1b0] transition-colors shadow dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4] dark:text-gray-100"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400 col-span-full">
              No matching plans found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Availableplans;