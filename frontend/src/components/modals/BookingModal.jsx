import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  X,
  Calendar,
  CreditCard,
  Wallet,
  DollarSign,
  Plus,
  BadgeIndianRupee,
  Loader2,
} from "lucide-react";
import api from "../../utils/api";
import { useUser } from "../../context/UserContext";

const BookingModal = ({ isOpen, onClose, service }) => {
  const { user, fetchUserProfile } = useUser();
  const [rentalDuration, setRentalDuration] = useState(7); // Default 7 days
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Calculate total cost based on rental duration
  const baseDailyRate = service ? service.rentalPrice / 28 : 0;
  const platformFee = baseDailyRate * 0.1;
  const totalDailyRate = baseDailyRate + platformFee;
  const totalCost = Math.ceil(totalDailyRate * rentalDuration);

  // Check if user has sufficient balance
  const hasSufficientBalance = user && user.walletBalance >= totalCost;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRentalDuration(7);
      setError(null);
    }
  }, [isOpen]);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setPaymentProcessing(true);
    setShowAddMoneyModal(false);

    try {
      const orderRes = await api.post(`/payments/create-order`, { amount });
      const orderData = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key_here",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SubLite Wallet Top-Up",
        description: "Add money to your wallet",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            await api.post(`/payments/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            await fetchUserProfile();
            setTopUpAmount("");
            alert("Payment successful! Your wallet has been topped up.");
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2bb6c4",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
      setPaymentProcessing(false);
    }
  };

  const handleBooking = async () => {
    if (!service || !rentalDuration) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(`/bookings`, {
        serviceId: service._id,
        rentalDuration: rentalDuration,
        paymentMethod: "wallet",
      });

      const data = response.data;

      alert(
        data.message ||
          'Booking successful! Check "My Subscriptions" for details.',
      );
      onClose();
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !service) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1e2633] rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Book Service</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2a3343] rounded-full transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Service Info */}
            <div className="bg-[#2a3343] rounded-2xl p-5 border border-gray-700">
              <h3 className="font-semibold text-xl text-white mb-3">
                {service.serviceName}
              </h3>
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                {service.description || "Premium subscription service"}
              </p>
              <div className="flex items-center text-sm text-gray-400">
                <span>
                  By{" "}
                  {service.providerId?.name ||
                    service.providerId?.username ||
                    "Provider"}
                </span>
                <span className="mx-2">•</span>
                <span className="text-[#5ed1dc]">
                  {service.availableSlots}/{service.maxUsers} slots available
                </span>
              </div>
            </div>

            {/* Rental Duration Selection */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-4">
                <Calendar size={16} className="mr-2 text-[#2bb6c4]" />
                Select Rental Duration
              </label>

              {/* Quick Selection Buttons */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[1, 3, 7, 14].map((days) => (
                  <button
                    key={days}
                    onClick={() => setRentalDuration(days)}
                    className={`p-3 rounded-2xl text-center border transition-all duration-200 ${
                      rentalDuration === days
                        ? "bg-[#2bb6c4] text-white border-[#2bb6c4] shadow-lg"
                        : "bg-[#2a3343] text-gray-300 border-gray-600 hover:bg-[#343e52] hover:border-[#2bb6c4]"
                    }`}
                  >
                    <div className="font-semibold text-lg">{days}</div>
                    <div className="text-xs opacity-75">
                      {days === 1 ? "day" : "days"}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Duration Input */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  Or enter custom duration (1-90 days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={rentalDuration}
                  onChange={(e) =>
                    setRentalDuration(parseInt(e.target.value) || 1)
                  }
                  className="w-full px-4 py-3 border border-gray-600 rounded-2xl bg-[#2a3343] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-[#2a3343] rounded-2xl p-5 border border-gray-700">
              <h4 className="flex items-center font-semibold text-white mb-4">
                <DollarSign size={18} className="mr-2 text-[#2bb6c4]" />
                Cost Breakdown
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Base monthly rate:</span>
                  <span className="text-white font-medium">
                    ₹{service.rentalPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Daily rate:</span>
                  <span className="text-white font-medium">
                    ₹{baseDailyRate.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Platform fee (10%):</span>
                  <span className="text-white font-medium">
                    ₹{platformFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Duration:</span>
                  <span className="text-white font-medium">
                    {rentalDuration} days
                  </span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-white">Total:</span>
                  <span className="text-[#5ed1dc]">₹{totalCost}</span>
                </div>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="bg-[#2a3343] rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center text-sm font-medium text-gray-300">
                  <Wallet size={16} className="mr-2 text-[#2bb6c4]" />
                  Wallet Balance:
                </span>
                <span
                  className={`font-bold text-lg ${
                    hasSufficientBalance ? "text-[#5ed1dc]" : "text-red-400"
                  }`}
                >
                  ₹{user?.walletBalance || 0}
                </span>
              </div>
              {!hasSufficientBalance && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-2xl">
                  <p className="text-red-300 text-sm mb-3">
                    Insufficient balance. Need ₹
                    {totalCost - (user?.walletBalance || 0)} more.
                  </p>
                  <button
                    onClick={() => setShowAddMoneyModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2bb6c4] text-white text-sm rounded-2xl hover:bg-[#1ea1b0] transition-colors font-medium"
                  >
                    <Plus size={14} />
                    Add Money to Wallet
                  </button>
                </div>
              )}
            </div>

            {/* Service Features */}
            {service.features && service.features.length > 0 && (
              <div className="bg-[#2a3343] rounded-2xl p-5 border border-gray-700">
                <h4 className="font-semibold text-white mb-3">Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#2bb6c4]/20 text-[#5ed1dc] rounded-full text-xs font-medium border border-[#2bb6c4]/30"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Refund Policy Notice */}
            <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-800">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-[#5ed1dc] mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1 text-[#5ed1dc]">
                    Refund Policy:
                  </p>
                  <p>
                    If the provider doesn&apos;t respond within 15 minutes,
                    you&apos;ll be automatically refunded to your wallet. No
                    action needed!
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-2xl p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-2xl hover:bg-[#2a3343] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={
                isLoading ||
                !hasSufficientBalance ||
                service.availableSlots <= 0
              }
              className="flex-1 px-4 py-3 bg-[#2bb6c4] text-white rounded-2xl hover:bg-[#1ea1b0] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <CreditCard size={16} className="mr-2" />
                  Book for ₹{totalCost}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1e2633] rounded-3xl p-6 border border-gray-700 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-white">Add Money</h3>
              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="bg-[#2a3343] rounded-full p-2 hover:bg-[#343e52] transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[10, 25, 50, 75, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className={`py-3 px-4 rounded-2xl font-medium transition-all duration-200 ${
                    topUpAmount === amount.toString()
                      ? "bg-[#2bb6c4] text-white"
                      : "bg-[#2a3343] text-[#5ed1dc] hover:bg-[#343e52]"
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
              <button className="bg-[#2a3343] py-3 px-4 rounded-2xl text-[#5ed1dc] font-medium hover:bg-[#343e52] transition-colors">
                ...
              </button>
            </div>

            <div className="mb-6 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5ed1dc] text-lg font-medium">
                ₹
              </span>
              <input
                type="number"
                placeholder="Enter amount"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full pl-8 px-4 py-4 rounded-2xl border border-gray-600 bg-[#2a3343] focus:outline-none focus:border-[#2bb6c4] focus:ring-2 focus:ring-[#2bb6c4]/20 text-lg text-white placeholder-gray-400 transition-all"
                min="1"
                step="0.01"
              />
            </div>

            <button
              onClick={handleTopUp}
              disabled={
                paymentProcessing ||
                !topUpAmount ||
                parseFloat(topUpAmount) <= 0
              }
              className="w-full flex items-center justify-center gap-2 bg-[#2bb6c4] text-white py-4 px-6 rounded-2xl font-medium text-lg hover:bg-[#1ea1b0] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <BadgeIndianRupee className="w-5 h-5" />
                  Add Money
                </>
              )}
            </button>

            <div className="mt-4 text-sm text-center text-gray-400">
              Secure payment powered by Razorpay
            </div>
          </div>
        </div>
      )}
    </>
  );
};

BookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  service: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    serviceName: PropTypes.string.isRequired,
    description: PropTypes.string,
    rentalPrice: PropTypes.number.isRequired,
    providerId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
        username: PropTypes.string,
      }),
    ]),
    availableSlots: PropTypes.number,
    maxUsers: PropTypes.number,
    features: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default BookingModal;
