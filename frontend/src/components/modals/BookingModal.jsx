import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, Wallet, DollarSign, Plus } from 'lucide-react';
import api, { API_BASE } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ isOpen, onClose, service }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [rentalDuration, setRentalDuration] = useState(7); // Default 7 days
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calculate total cost based on rental duration
    const baseDailyRate = service ? service.rentalPrice / 28 : 0;
    const platformFee = baseDailyRate * 0.10;
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

    const handleBooking = async () => {
        if (!service || !rentalDuration) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post(`/bookings`, {
                serviceId: service._id,
                rentalDuration: rentalDuration,
                paymentMethod: 'wallet'
            });

            const data = response.data;

            alert(data.message || 'Booking successful! Check "My Subscriptions" for details.');
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Service</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Service Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                            {service.serviceName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {service.description || 'Premium subscription service'}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>By {service.providerId?.name || service.providerId?.username || 'Provider'}</span>
                            <span className="mx-2">•</span>
                            <span>{service.availableSlots}/{service.maxUsers} slots available</span>
                        </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Pricing Breakdown</h4>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Base Daily Rate</span>
                            <span>₹{baseDailyRate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Platform Fee <span className="text-xs text-gray-400">(10%)</span></span>
                            <span>₹{platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-semibold border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                            <span>Total Daily Rate</span>
                            <span>₹{totalDailyRate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                            <span>Total for {rentalDuration} days</span>
                            <span>₹{totalCost}</span>
                        </div>
                    </div>

                    {/* Rental Duration Selection */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            <Calendar size={16} className="mr-2" />
                            Select Rental Duration
                        </label>
                        
                        {/* Quick Selection Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[1, 3, 7, 14].map(days => (
                                <button
                                    key={days}
                                    onClick={() => setRentalDuration(days)}
                                    className={`p-3 rounded-lg text-center border transition-colors ${
                                        rentalDuration === days
                                            ? 'bg-[#2bb6c4] text-white border-[#2bb6c4]'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <div className="font-semibold">{days}</div>
                                    <div className="text-xs">{days === 1 ? 'day' : 'days'}</div>
                                </button>
                            ))}
                        </div>

                        {/* Custom Duration Input */}
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Or enter custom duration (1-90 days)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="90"
                                value={rentalDuration}
                                onChange={(e) => setRentalDuration(parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="flex items-center font-semibold text-gray-900 dark:text-white mb-3">
                            <DollarSign size={16} className="mr-2" />
                            Cost Breakdown
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Base monthly rate:</span>
                                <span className="text-gray-900 dark:text-white">₹{service.rentalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Daily rate:</span>
                                <span className="text-gray-900 dark:text-white">₹{baseDailyRate.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Duration:</span>
                                <span className="text-gray-900 dark:text-white">{rentalDuration} days</span>
                            </div>
                            <hr className="border-gray-200 dark:border-gray-600" />
                            <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-900 dark:text-white">Total:</span>
                                <span className="text-[#2bb6c4]">₹{totalCost}</span>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Balance */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Wallet size={16} className="mr-2" />
                                Wallet Balance:
                            </span>
                            <span className={`font-semibold ${
                                hasSufficientBalance ? 'text-green-600' : 'text-red-600'
                            }`}>
                                ₹{user?.walletBalance || 0}
                            </span>
                        </div>
                        {!hasSufficientBalance && (
                            <div className="mt-3">
                                <p className="text-red-600 text-sm mb-2">
                                    Insufficient balance. Need ₹{totalCost - (user?.walletBalance || 0)} more.
                                </p>
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/wallet');
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Plus size={14} />
                                    Add Money to Wallet
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Refund Policy Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-medium mb-1">Refund Policy:</p>
                                <p>If the provider doesn't respond within 15 minutes, you'll be automatically refunded to your wallet. No action needed!</p>
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    {service.features && service.features.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Features:</h4>
                            <div className="flex flex-wrap gap-1">
                                {service.features.map((feature, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-xs">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBooking}
                        disabled={isLoading || !hasSufficientBalance || service.availableSlots <= 0}
                        className="flex-1 px-4 py-2 bg-[#2bb6c4] text-white rounded-lg hover:bg-[#1ea1b0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
    );
};

export default BookingModal;
