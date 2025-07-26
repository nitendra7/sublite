import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, LayoutGrid, List, Search, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import BookingModal from '../components/modals/BookingModal';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const Availableplans = () => {
  const navigate = useNavigate();
  const { token } = useUser();
  const [isGridView, setIsGridView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const [plansRes, bookingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/services`, { headers }),
          token ? fetch(`${API_BASE}/api/bookings/my-bookings`, { headers }) : Promise.resolve(null)
        ]);

        const plansData = await plansRes.json();

        if (Array.isArray(plansData)) {
          const availablePlans = plansData.filter(plan => plan.availableSlots > 0);
          setPlans(availablePlans);
        } else {
          console.error("API did not return an array of plans:", plansData);
          setPlans([]);
        }

        if (token && bookingsRes) {
          const bookingsData = await bookingsRes.json();
          if (Array.isArray(bookingsData)) {
            setUserBookings(bookingsData);
          } else {
            console.error("Bookings API did not return an array:", bookingsData);
            setUserBookings([]);
          }
        } else {
          setUserBookings([]);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleBookService = async (service) => {
    if (!token) {
      alert('Please login to book a service.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userBookings = await response.json();
        const existingBooking = Array.isArray(userBookings) ? userBookings.find(booking => 
          booking.serviceId === service._id && 
          ['pending', 'confirmed', 'active'].includes(booking.bookingStatus)
        ) : null;
        
        if (existingBooking) {
          alert('You have already booked this service. You cannot book the same service twice.');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking existing bookings:', error);
    }
    
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  const toggleView = () => {
    setIsGridView(!isGridView);
  };

  const filteredPlans = plans.filter(service =>
    (service.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.providerId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bb6c4] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading available plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Available Plans
        </h1>
        <p className="text-gray-500 dark:text-gray-300">
          Browse and join shared subscriptions from the community.
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search plans by name, owner, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
        
        <button
          onClick={toggleView}
          className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200 group"
          title={isGridView ? "Switch to List View" : "Switch to Grid View"}
        >
          {isGridView ? (
            <List size={20} className="group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <LayoutGrid size={20} className="group-hover:scale-110 transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Plans Grid/List */}
      {filteredPlans.length > 0 ? (
        <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredPlans.map((service, index) => (
            <div 
              key={service._id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Service Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">
                  {service.serviceName}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  service.serviceStatus === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {service.serviceStatus}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {service.description || 'No description available'}
              </p>
              
              {/* Service Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users size={16} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
                  <span>{service.availableSlots}/{service.maxUsers} slots available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Star size={16} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
                  <span>By {service.providerId?.name || service.providerId?.username || 'Unknown'}</span>
                </div>
              </div>
              
              {/* Features */}
              {service.features && service.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features.map((feature, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 text-[#2bb6c4] dark:text-[#5ed1dc] rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Price and Action */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                    ₹{((service.rentalPrice / 28) * 1.10).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    per day (incl. commission)
                  </p>
                </div>
                
                {(() => {
                  const existingBooking = Array.isArray(userBookings) ? userBookings.find(booking => 
                    booking.serviceId === service._id && 
                    ['pending', 'confirmed', 'active'].includes(booking.bookingStatus)
                  ) : null;

                  if (existingBooking && existingBooking.bookingStatus === 'pending') {
                    return (
                      <button
                        disabled
                        className="px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-all duration-200"
                      >
                        Already Booked
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={() => handleBookService(service)}
                      disabled={service.availableSlots <= 0}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                        service.availableSlots > 0 
                          ? 'bg-[#2bb6c4] text-white hover:bg-[#1ea1b0] dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4] shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {service.availableSlots > 0 ? 'Book Now' : 'Sold Out'}
                    </button>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {searchTerm ? 'No matching plans found' : 'No plans available'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'Try adjusting your search terms or browse all available plans.'
                : 'Check back later for new subscription opportunities.'
              }
            </p>
          </div>
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