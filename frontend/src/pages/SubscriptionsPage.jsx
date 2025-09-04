import { useState, useEffect } from 'react';
import { BookOpen, Users, Plus, ArrowRight, TrendingUp, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProvidedServicesList from '../components/subscriptions/ProvidedServicesList';
import JoinedSubscriptionsList from '../components/subscriptions/JoinedSubscriptionsList';

import api from '../utils/api';
import Loading from '../components/ui/Loading';

const SubscriptionsPage = () => {
  const [providedServices, setProvidedServices] = useState([]);
  const [joinedSubscriptions, setJoinedSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services provided by the user
        const responseProvided = await api.get(`/services/my-services`);
        const responseJoined = await api.get(`/bookings/my-joined`);

        setProvidedServices(responseProvided.data);
        setJoinedSubscriptions(responseJoined.data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleServiceDeleted = (deletedServiceId) => {
    setProvidedServices(prev => prev.filter(service => service._id !== deletedServiceId));
  };

  if (loading) {
    return <Loading message="Loading your subscriptions..." />;
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-500 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header Section */}
      <div className="mb-10 anim-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-[#2bb6c4] to-[#5ed1dc] rounded-xl anim-float">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            My Subscriptions
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-300 text-lg">
          Manage your owned services and joined subscriptions in one beautiful place
        </p>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/dashboard/add-service"
            className="inline-flex items-center gap-2 px-4 py-2 btn-gradient rounded-lg text-white font-medium shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </Link>
          <Link
            to="/dashboard/available-plans"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 font-medium hover:border-[#2bb6c4] transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            Explore Plans
          </Link>
        </div>
      </div>

      {/* Enhanced Stats Overview with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 card-hover anim-fade-in-up stagger-1 relative overflow-hidden">
          {/* Background gradient accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2bb6c4]/10 to-transparent rounded-bl-full"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                Services I Provide
              </p>
              <p className="text-3xl font-bold gradient-text mt-1">
                {providedServices.length}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {providedServices.length === 1 ? 'service' : 'services'} active
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#2bb6c4]/15 to-[#5ed1dc]/15 rounded-2xl flex items-center justify-center card-hover relative">
              <Users className="w-7 h-7 text-[#2bb6c4] dark:text-[#5ed1dc]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#2bb6c4] rounded-full anim-pulse-slow"></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 card-hover anim-fade-in-up stagger-2 relative overflow-hidden">
          {/* Background gradient accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#5ed1dc]/10 to-transparent rounded-bl-full"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                Services I've Joined
              </p>
              <p className="text-3xl font-bold gradient-text mt-1">
                {joinedSubscriptions.length}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {joinedSubscriptions.length === 1 ? 'subscription' : 'subscriptions'} active
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#2bb6c4]/15 to-[#5ed1dc]/15 rounded-2xl flex items-center justify-center card-hover relative">
              <BookOpen className="w-7 h-7 text-[#2bb6c4] dark:text-[#5ed1dc]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#5ed1dc] rounded-full anim-pulse-slow"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sections with Visual Separators */}
      <div className="space-y-12">
        <div className="anim-fade-in-up stagger-3">
          <ProvidedServicesList
              services={providedServices}
              onServiceDeleted={handleServiceDeleted}
          />
        </div>

        <div className="anim-fade-in-up stagger-4">
          <JoinedSubscriptionsList subscriptions={joinedSubscriptions} />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
