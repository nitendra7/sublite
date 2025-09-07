import { useState, useEffect } from "react";
import { Users, Star, LayoutGrid, List, Search } from "lucide-react";
import { useUser } from "../context/UserContext";
import Loading from "../components/ui/Loading";
import BookingModal from "../components/modals/BookingModal";
import {
  filterValidServices,
  reportMissingProviders,
} from "../utils/serviceUtils";

import api from "../utils/api";

import GridCard from "../components/ui/GridCard";

const Availableplans = () => {
  const { token } = useUser();
  // MOBILE: expandedServiceId tracks which service is in "grid" (expanded) mode
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  // DESKTOP: grid/list view for sm+ only
  const [isGridView, setIsGridView] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, bookingsRes] = await Promise.all([
          api.get("/services"),
          token
            ? api.get("/bookings/my-bookings")
            : Promise.resolve({ data: null }),
        ]);

        const plansData = plansRes.data;
        if (Array.isArray(plansData)) {
          // Filter out services with missing providers first
          const validPlans = filterValidServices(plansData);

          // Report any services with missing providers for debugging
          if (plansData.length !== validPlans.length) {
            reportMissingProviders(plansData);
          }

          const availablePlans = validPlans.filter(
            (plan) => plan.availableSlots > 0,
          );
          setPlans(availablePlans);
        } else {
          console.error("API did not return an array of plans:", plansData);
          setPlans([]);
        }
        if (token && bookingsRes.data) {
          const bookingsData = bookingsRes.data;
          if (Array.isArray(bookingsData)) {
            setUserBookings(bookingsData);
          } else {
            console.error(
              "Bookings API did not return an array:",
              bookingsData,
            );
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
      alert("Please login to book a service.");
      return;
    }

    try {
      const response = await api.get(`/bookings/my-bookings`);
      const userBookingsCheck = response.data;
      const existingBooking = Array.isArray(userBookingsCheck)
        ? userBookingsCheck.find(
            (booking) =>
              booking.serviceId === service._id &&
              ["pending", "confirmed", "active"].includes(
                booking.bookingStatus,
              ),
          )
        : null;

      if (existingBooking) {
        alert(
          "You have already booked this service. You cannot book the same service twice.",
        );
        return;
      }
    } catch (error) {
      console.error("Error checking existing bookings:", error);
    }

    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  // Only for mobile: tap to expand/collapse card
  const handleExpandService = (serviceId) => {
    setExpandedServiceId((prev) => (prev === serviceId ? null : serviceId));
  };
  // Only for desktop/tablet: toggle grid/list
  const handleToggleView = () => {
    setIsGridView((prev) => !prev);
  };

  const filteredPlans = plans.filter(
    (service) =>
      (service.serviceName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (service.providerId?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (service.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <Loading message="Loading available plans..." />;
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
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-8 w-full">
        <div className="relative w-full sm:flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search plans by name, owner, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
        {/* Grid/List toggle for desktop/tablet only */}
        <div className="hidden sm:flex w-auto justify-end sm:justify-center">
          <button
            onClick={handleToggleView}
            className="flex items-center justify-center p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200 group min-w-[48px] min-h-[48px]"
            title={isGridView ? "Switch to List View" : "Switch to Grid View"}
            aria-label={
              isGridView ? "Switch to List View" : "Switch to Grid View"
            }
          >
            {isGridView ? (
              <List
                size={24}
                className="group-hover:scale-110 transition-transform duration-200"
              />
            ) : (
              <LayoutGrid
                size={24}
                className="group-hover:scale-110 transition-transform duration-200"
              />
            )}
          </button>
        </div>
      </div>

      {/* Plans Grid/List */}
      {filteredPlans.length > 0 ? (
        <>
          <div className="block sm:hidden space-y-4">
            {filteredPlans.map((service, index) => {
              const existingBooking = Array.isArray(userBookings)
                ? userBookings.find(
                    (booking) =>
                      booking.serviceId === service._id &&
                      ["pending", "confirmed", "active"].includes(
                        booking.bookingStatus,
                      ),
                  )
                : null;

              // MOBILE: condensed by default, expand on tap
              return (
                <div
                  key={service._id}
                  className="block sm:hidden"
                  onClick={() => handleExpandService(service._id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={expandedServiceId === service._id}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {expandedServiceId === service._id ? (
                    // Expanded "grid" view for this service with smooth transition
                    <GridCard
                      key={service._id + "-mobile-expanded"}
                      service={service}
                      existingBooking={existingBooking}
                      onBook={handleBookService}
                      disableBook={service.availableSlots <= 0}
                      animationDelay={index * 100}
                      disableFullClick={true}
                    />
                  ) : (
                    // Condensed card for mobile list view
                    <div
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in overflow-hidden transition-all duration-500 ease-in-out"
                      style={{
                        maxHeight:
                          expandedServiceId === service._id ? "0" : "220px",
                        opacity: expandedServiceId === service._id ? 0 : 1,
                      }}
                    >
                      {/* Title & status */}
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-lg text-gray-800 dark:text-gray-100">
                          {service.serviceName}
                        </span>
                        <span
                          className={`px-1 py-1 rounded-full text-xs font-medium ${
                            service.serviceStatus === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          }`}
                        >
                          {service.serviceStatus}
                        </span>
                      </div>
                      {/* Slots & price */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="flex items-center gap-2">
                          <Users
                            size={16}
                            className="text-gray-600 dark:text-gray-400"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {service.availableSlots}
                            /{service.maxUsers} slots
                          </span>
                        </span>
                        <span className="text-[#2bb6c4] dark:text-[#5ed1dc] font-bold text-xl">
                          ₹{((service.rentalPrice / 28) * 1.1).toFixed(2)}
                        </span>
                      </div>
                      {/* Owner & action */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {service.providerId?.name ||
                            service.providerId?.username ||
                            "Unknown"}
                        </span>
                        {existingBooking &&
                        existingBooking.bookingStatus === "pending" ? (
                          <button
                            disabled
                            className="px-4 py-2 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
                          >
                            Already Booked
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookService(service);
                            }}
                            disabled={service.availableSlots <= 0}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 z-10 ${
                              service.availableSlots > 0
                                ? "bg-[#2bb6c4] text-white hover:bg-[#1ea1b0] dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4] shadow"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {service.availableSlots > 0
                              ? "Book Now"
                              : "Sold Out"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {/* Desktop & tablet view: grid/list toggleable */}
            {filteredPlans.map((service, index) => {
              const existingBooking = Array.isArray(userBookings)
                ? userBookings.find(
                    (booking) =>
                      booking.serviceId === service._id &&
                      ["pending", "confirmed", "active"].includes(
                        booking.bookingStatus,
                      ),
                  )
                : null;

              // Desktop/tablet: grid (full card), list (condensed)
              if (isGridView) {
                return (
                  <GridCard
                    key={service._id + "-desktop"}
                    service={service}
                    existingBooking={existingBooking}
                    onBook={handleBookService}
                    disableBook={service.availableSlots <= 0}
                    animationDelay={index * 100}
                  />
                );
              } else {
                // Condensed list view for desktop/tablet
                return (
                  <div
                    key={service._id + "-desktop-list"}
                    className="hidden sm:flex bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 px-6 py-4 items-start justify-between gap-x-6 mb-4 animate-fade-in transition-all duration-300 hover:shadow-xl hover:scale-[1.02] transform-gpu will-change-transform relative overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Status Badge - Positioned at top-left for better visibility */}
                    <span
                      className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium shadow-sm z-20 ${
                        service.serviceStatus === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                      }`}
                    >
                      {typeof service.serviceStatus === "string"
                        ? service.serviceStatus
                            .replace(/^[^a-zA-Z]+/, "")
                            .trim()
                        : service.serviceStatus}
                    </span>

                    {/* Left Column: Title, Slots, Provider */}
                    <div className="flex flex-col min-w-0 flex-1 gap-y-2">
                      {/* Title at top left */}
                      <span className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate max-w-[230px]">
                        {service.serviceName}
                      </span>
                      {/* Slots in middle left */}
                      <div className="flex items-center gap-2 text-[#2bb6c4] dark:text-[#5ed1dc] font-medium">
                        <Users
                          size={16}
                          className="text-gray-600 dark:text-gray-400"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {service.availableSlots}/
                          {service.maxUsers} slots
                        </span>
                      </div>
                      {/* Provider name at bottom left */}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {service.providerId?.name ||
                          service.providerId?.username ||
                          "Unknown"}
                      </span>
                    </div>
                    {/* Right: Price and Book */}
                    <div className="flex items-center gap-x-4 min-w-fit z-10 mt-auto mb-2">
                      {/* Price beside book button */}
                      <div className="flex flex-col text-right">
                        <span className="text-[#2bb6c4] dark:text-[#5ed1dc] font-bold text-xl">
                          ₹{((service.rentalPrice / 28) * 1.1).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          per day
                        </span>
                      </div>
                      {/* Book Button */}
                      <div className="flex flex-col items-end justify-center">
                        {existingBooking &&
                        existingBooking.bookingStatus === "pending" ? (
                          <button
                            disabled
                            className="px-4 py-2 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
                          >
                            Already Booked
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBookService(service)}
                            disabled={service.availableSlots <= 0}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 z-10 ${
                              service.availableSlots > 0
                                ? "bg-[#2bb6c4] text-white hover:bg-[#1ea1b0] dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4] shadow"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {service.availableSlots > 0
                              ? "Book Now"
                              : "Sold Out"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {searchTerm ? "No matching plans found" : "No plans available"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms or browse all available plans."
                : "Check back later for new subscription opportunities."}
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
