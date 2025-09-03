import PropTypes from 'prop-types';
import { User, Calendar, Circle, Clock } from 'lucide-react';

const JoinedSubscriptionsList = ({ subscriptions }) => {
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'confirmed':
                return 'text-[#2bb6c4] dark:text-[#5ed1dc]';
            case 'pending':
                return 'text-yellow-500';
            case 'completed':
                return 'text-[#2bb6c4] dark:text-[#5ed1dc]';
            case 'cancelled':
            case 'disputed':
                return 'text-red-500';
            default:
                return 'text-gray-400';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Services I&apos;ve Joined</h2>
            {subscriptions.length > 0 ? (
                <div className="space-y-4">
                    {subscriptions.map(booking => (
                        <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-grow">
                                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                                        {booking.bookingDetails.serviceName}
                                    </p>
                                    <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2 mt-2">
                                        <span className="flex items-center gap-1">
                                            <User size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" /> Provided by {booking.providerId ? booking.providerId.name : 'N/A'}
                                        </span>
                                        {['active', 'confirmed', 'pending'].includes(booking.bookingStatus) && (
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" /> Expires on: {formatDate(booking.bookingDetails.endDate)}
                                            </span>
                                        )}
                                        {booking.bookingStatus === 'completed' && (
                                            <>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" /> Used from: {formatDate(booking.bookingDetails.startDate)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" /> To: {formatDate(booking.bookingDetails.endDate)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                                     <span className={`flex items-center gap-2 text-sm font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                        <Circle size={10} fill="currentColor" />
                                        {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-gray-500 dark:text-gray-400">You haven&apos;t joined any services yet.</p>
                </div>
            )}
        </div>
    );
};

JoinedSubscriptionsList.propTypes = {
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      bookingStatus: PropTypes.string.isRequired,
      bookingDetails: PropTypes.shape({
        serviceName: PropTypes.string.isRequired,
        startDate: PropTypes.string,
        endDate: PropTypes.string
      }).isRequired,
      providerId: PropTypes.shape({
        name: PropTypes.string
      })
    })
  ).isRequired
};

export default JoinedSubscriptionsList;
