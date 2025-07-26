import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, LayoutGrid, List } from 'lucide-react';
import { useUser } from '../context/UserContext'; // To get the auth token
import BookingModal from '../components/modals/BookingModal';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

// This should fetch from your backend, not use mock data
// const availablePlansList = [ ... ];

const Availableplans = () => {
  const navigate = useNavigate();
  const { token } = useUser(); // Get token for authenticated requests
  const [isGridView, setIsGridView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]); // State to hold plans from backend
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [userBookings, setUserBookings] = useState([]); // State to hold user's bookings

  // Fetch plans and user bookings from the backend when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Include auth header if user is logged in to exclude own services
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const [plansRes, bookingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/services`, { headers }),
          token ? fetch(`${API_BASE}/api/bookings/my-bookings`, { headers }) : Promise.resolve(null)
        ]);

        const plansData = await plansRes.json();

        // FIX: Check if the API response is an array before setting state
        if (Array.isArray(plansData)) {
          setPlans(plansData);
        } else {
          console.error("API did not return an array of plans:", plansData);
          setPlans([]); // Default to an empty array to prevent the app from crashing
        }

        // Fetch user bookings if logged in
        if (token && bookingsRes) {
          const bookingsData = await bookingsRes.json();
          setUserBookings(bookingsData);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setPlans([]); // Also default to an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Function to open booking modal
  const handleBookService = async (service) => {
    if (!token) {
      alert('Please login to book a service.');
      return;
    }
    
    // Check if user has already booked this service
    try {
      const response = await fetch(`${API_BASE}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userBookings = await response.json();
        const existingBooking = userBookings.find(booking => 
          booking.serviceId === service._id && 
          ['pending', 'confirmed', 'active'].includes(booking.bookingStatus)
        );
        
        if (existingBooking) {
          alert('You have already booked this service. You cannot book the same service twice.');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking existing bookings:', error);
      // Continue with booking modal even if check fails
    }
    
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  // Function to close booking modal
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  const toggleView = () => {
    setIsGridView(prevState => !prevState);
  };

  const filteredPlans = plans.filter(service =>
    (service.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.providerId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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
            filteredPlans.map(service => (
              <div key={service._id}
                   className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex 
                               ${isGridView ? 'flex-col items-center text-center' : 'flex-col'} 
                               hover:shadow-lg transition-shadow text-gray-900 dark:text-gray-100`}
              >
                <div className={`flex-grow ${isGridView ? 'mb-4' : 'mb-4'} ${isGridView ? 'text-center' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">{service.serviceName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.serviceStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {service.serviceStatus}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{service.description || 'No description available'}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm mb-3">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Users size={14} className="text-gray-500 dark:text-gray-400" /> 
                      {service.availableSlots}/{service.maxUsers} slots available
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Star size={14} className="text-gray-500 dark:text-gray-400" /> 
                      By {service.providerId?.name || service.providerId?.username || 'Unknown'}
                    </span>
                  </div>
                  
                  {service.features && service.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {service.features.map((feature, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                  <div className={`flex items-center justify-between w-full ${isGridView ? 'flex-col gap-2' : 'flex-row'}`}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">₹{service.rentalPrice}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">per month (user decides duration)</p>
                  </div>
                  {(() => {
                    // Check if user has already booked this service
                    const existingBooking = userBookings.find(booking => 
                      booking.serviceId === service._id && 
                      ['pending', 'confirmed', 'active'].includes(booking.bookingStatus)
                    );

                    if (existingBooking) {
                      return (
                        <button
                          disabled
                          className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white cursor-not-allowed"
                        >
                          Already Booked
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={() => handleBookService(service)}
                        disabled={service.availableSlots <= 0}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors shadow ${
                          service.availableSlots > 0 
                            ? 'bg-[#2bb6c4] text-white hover:bg-[#1ea1b0] dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4]'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {service.availableSlots > 0 ? 'Book Now' : 'Sold Out'}
                      </button>
                    );
                  })()}
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
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        service={selectedService}
      />
    </div>
  );
};

export default Availableplans;