import PropTypes from 'prop-types';
import { User, Calendar, Circle, Clock, Search, Star, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border-green-200 dark:border-green-600',
            confirmed: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700/30',
            pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700/30',
            completed: 'bg-[#5ed1dc]/15 text-[#5ed1dc] border-[#5ed1dc]/30',
            cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-500 border-red-300 dark:border-red-700/30',
            disputed: 'bg-red-100 dark:bg-red-900/20 text-red-500 border-red-300 dark:border-red-700/30',
            default: 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700/30'
        };

        const icons = {
            active: Zap,
            confirmed: Star,
            pending: Clock,
            completed: Star,
            cancelled: Circle,
            disputed: Circle,
            default: Circle
        };

        const IconComponent = icons[status] || icons.default;
        const colorClass = colors[status] || colors.default;

        return (
            <div className={`inline-flex items-center gap-1 px-1 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                <IconComponent size={12} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
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
        <div className="anim-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-[#5ed1dc]/15 to-[#2bb6c4]/15 rounded-xl">
                    <Star className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#5ed1dc] to-[#2bb6c4] rounded-full"></div>
                    Services I've Joined
                </h2>
            </div>

            {subscriptions.length > 0 ? (
                <div className="space-y-4">
                    {subscriptions.map((booking, index) => (
                        <div
                            key={booking._id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 card-hover anim-fade-in-up relative overflow-hidden"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Background accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#5ed1dc]/5 to-transparent rounded-bl-xl"></div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-1 bg-gradient-to-r from-[#2bb6c4]/15 to-[#5ed1dc]/15 rounded-lg">
                                            <User className="w-4 h-4 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                                        </div>
                                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{booking.bookingDetails.serviceName}</p>
                                        {['active', 'confirmed', 'pending', 'completed'].includes(booking.bookingStatus) && (
                                            <Heart className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>

                                    {/* Provider info */}
                                    <div className="mb-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Provided by <span className="font-medium gradient-text">{booking.providerId ? booking.providerId.name : 'N/A'}</span>
                                        </span>
                                    </div>

                                    {/* Status and dates */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        {getStatusBadge(booking.bookingStatus)}

                                        {['active', 'confirmed', 'pending'].includes(booking.bookingStatus) && (
                                            <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                                                <Calendar size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
                                                Expires: {formatDate(booking.bookingDetails.endDate)}
                                            </span>
                                        )}

                                        {booking.bookingStatus === 'completed' && (
                                            <>
                                                <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                                                    <Clock size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
                                                    Used from: {formatDate(booking.bookingDetails.startDate)}
                                                </span>
                                                <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                                                    <Calendar size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
                                                    To: {formatDate(booking.bookingDetails.endDate)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center relative overflow-hidden anim-fade-in-up">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 right-4 w-28 h-28 bg-[#2bb6c4] rounded-full blur-2xl"></div>
                        <div className="absolute bottom-4 left-4 w-20 h-20 bg-[#5ed1dc] rounded-full blur-xl"></div>
                    </div>

                    <div className="relative z-10">
                        {/* Floating Heart icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2bb6c4]/15 to-[#5ed1dc]/15 rounded-full mb-6 anim-float">
                            <Heart className="w-10 h-10 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 gradient-text">
                            Discover Amazing Services
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            Explore a world of incredible services from talented providers. Find the perfect match for your needs!
                        </p>

                        {/* Benefits */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
                            <div className="bg-gradient-to-br from-[#2bb6c4]/10 to-[#5ed1dc]/10 p-3 rounded-lg hover:shadow-lg transition-all duration-200 card-hover">
                                <Zap className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc] mx-auto mb-2" />
                                <p className="text-xs font-medium gradient-text">Instant Access</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#2bb6c4]/10 to-[#5ed1dc]/10 p-3 rounded-lg hover:shadow-lg transition-all duration-200 card-hover">
                                <Star className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc] mx-auto mb-2" />
                                <p className="text-xs font-medium gradient-text">Expert Providers</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#2bb6c4]/10 to-[#5ed1dc]/10 p-3 rounded-lg hover:shadow-lg transition-all duration-200 card-hover">
                                <Heart className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc] mx-auto mb-2" />
                                <p className="text-xs font-medium gradient-text">Satisfaction Guaranteed</p>
                            </div>
                        </div>

                        <Link
                            to="/dashboard/available-plans"
                            className="inline-flex items-center gap-3 px-6 py-3 btn-gradient rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 anim-pulse-slow"
                        >
                            <Search className="w-5 h-5" />
                            Explore Available Plans
                        </Link>
                    </div>
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
