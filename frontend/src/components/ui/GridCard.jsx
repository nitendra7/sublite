import React from "react";
import { Users, Star } from "lucide-react";

/**
 * GridCard component for displaying a service in grid view.
 * Props:
 * - service: the service object
 * - existingBooking: booking object or null
 * - onBook: function to call when "Book Now" is clicked
 * - disableBook: disables the Book button
 */
const GridCard = ({
  service,
  existingBooking,
  onBook,
  disableBook = false,
  animationDelay = 0,
  disableFullClick = false,
}) => {
  const displayAvailableSlots = Math.min(service.availableSlots, service.maxUsers);

  return (
    <div
      className={
        "relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 animate-fade-in flex flex-col h-full " +
        (!disableFullClick && !disableBook && !(existingBooking && existingBooking.bookingStatus === "pending")
          ? "hover:shadow-xl hover:scale-[1.02] cursor-pointer"
          : (disableFullClick ? "" : "cursor-not-allowed"))
      }
      style={{ animationDelay: `${animationDelay}ms` }}
      {...(!disableFullClick && {
        onClick: () => {
          if (!disableBook && !(existingBooking && existingBooking.bookingStatus === "pending")) {
            onBook(service);
          }
        },
        tabIndex: (!disableBook && !(existingBooking && existingBooking.bookingStatus === "pending")) ? 0 : -1,
        role: "button",
        "aria-disabled": disableBook || (existingBooking && existingBooking.bookingStatus === "pending"),
      })}
    >
      {/* Status Badge - top right */}
      <span
        className={`absolute top-4 right-4 px-1 py-1 rounded-full text-xs font-medium z-10 ${
          service.serviceStatus === "active"
            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
        }`}
      >
        {service.serviceStatus}
      </span>

      {/* Card main content (grows, pushes footer down) */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">
          {service.serviceName}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed">
          {service.description || "No description available"}
        </p>

        {/* Features (always centered in min-height area for alignment) */}
        <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[56px]">
          {service.features && service.features.length > 0 &&
            service.features.map((feature, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 text-[#2bb6c4] dark:text-[#5ed1dc] rounded-full text-xs font-medium"
              >
                {feature}
              </span>
            ))}
        </div>

        {/* Slots & provider */}
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users size={16} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {displayAvailableSlots}/{service.maxUsers} slots
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <Star size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
          <span className="text-sm">
            Provider: {service.providerId?.name || service.providerId?.username || "Unknown"}
          </span>
        </div>
      </div>

      {/* Price and Action (footer always at bottom) */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
            ₹{((service.rentalPrice / 28) * 1.1).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            per day (incl. commission)
          </p>
        </div>
        {existingBooking && existingBooking.bookingStatus === "pending" ? (
          <button
            disabled
            className="px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-all duration-200"
          >
            Already Booked
          </button>
        ) : (
          <button
            onClick={() => onBook(service)}
            disabled={disableBook}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
              !disableBook
                ? "bg-[#2bb6c4] text-white hover:bg-[#1ea1b0] dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4] shadow-lg hover:shadow-xl"
                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            {service.availableSlots > 0 ? "Book Now" : "Sold Out"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GridCard;