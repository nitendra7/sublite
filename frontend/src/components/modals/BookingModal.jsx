import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, Wallet, Clock, DollarSign, Plus } from 'lucide-react';
import { apiFetch, API_BASE } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

const BookingModal = ({ isOpen, onClose, service }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [rentalDuration, setRentalDuration] = useState(7); // Default 7 days
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calculate total cost based on rental duration
    const dailyRate = service ? service.rentalPrice / 30 : 0; // Convert monthly rate to daily
    const totalCost = Math.ceil(dailyRate * rentalDuration);
    
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
            const response = await apiFetch(`${API_BASE}/api/bookings`, {
                method: 'POST',
                body: JSON.stringify({
                    serviceId: service._id,
                    rentalDuration: rentalDuration,
                    paymentMethod: 'wallet'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Booking failed.');
            }

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
                    <Button 
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                    >
                        <X size={20} className="text-gray-500" />
                    </Button>
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

                    {/* Rental Duration Selection */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            <Calendar size={16} className="mr-2" />
                            Select Rental Duration
                        </label>
                        
                        {/* Quick Selection Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[1, 3, 7, 14].map(days => (
                                <Button
                                    key={days}
                                    onClick={() => setRentalDuration(days)}
                                    variant={rentalDuration === days ? "default" : "outline"}
                                    className="p-3 rounded-lg text-center border transition-colors"
                                >
                                    <div className="font-semibold">{days}</div>
                                    <div className="text-xs">{days === 1 ? 'day' : 'days'}</div>
                                </Button>
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
                                <span className="text-gray-900 dark:text-white">₹{dailyRate.toFixed(2)}</span>
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
                                <Button
                                    onClick={() => {
                                        onClose();
                                        navigate('/wallet');
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Plus size={14} />
                                    Add Money to Wallet
                                </Button>
                            </div>
                        )}
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
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBooking}
                        disabled={isLoading || !hasSufficientBalance || service.availableSlots <= 0}
                        className="flex-1 bg-[#2bb6c4] text-white rounded-lg hover:bg-[#1ea1b0] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
