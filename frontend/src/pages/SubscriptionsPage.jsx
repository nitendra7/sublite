import React, { useState, useEffect } from 'react';
import { BookOpen, Users } from 'lucide-react';
import ProvidedServicesList from '../components/subscriptions/ProvidedServicesList';
import JoinedSubscriptionsList from '../components/subscriptions/JoinedSubscriptionsList';

import api, { API_BASE } from '../utils/api';

const SubscriptionsPage = () => {
  const [providedServices, setProvidedServices] = useState([]);
  const [joinedSubscriptions, setJoinedSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
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
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bb6c4] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your subscriptions...</p>
          </div>
        </div>
      </div>
    );
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
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          My Subscriptions
        </h1>
        <p className="text-gray-500 dark:text-gray-300">
          Manage your owned services and joined subscriptions.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Services I Provide</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {providedServices.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Services I've Joined</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {joinedSubscriptions.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-12">
        <ProvidedServicesList 
            services={providedServices} 
            onServiceDeleted={handleServiceDeleted} 
        />
        <JoinedSubscriptionsList subscriptions={joinedSubscriptions} />
      </div>
    </div>
  );
};

export default SubscriptionsPage;

