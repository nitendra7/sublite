import React, { useState, useEffect } from 'react';
import ProvidedServicesList from '../components/subscriptions/ProvidedServicesList';
import JoinedSubscriptionsList from '../components/subscriptions/JoinedSubscriptionsList';

const SubscriptionsPage = () => {
  const [providedServices, setProvidedServices] = useState([]);
  const [joinedSubscriptions, setJoinedSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [providedRes, joinedRes] = await Promise.all([
          fetch('/api/services/my-services', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/bookings/my-bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!providedRes.ok || !joinedRes.ok) {
          throw new Error('Failed to fetch subscription data.');
        }

        const providedData = await providedRes.json();
        const joinedData = await joinedRes.json();

        setProvidedServices(providedData);
        setJoinedSubscriptions(joinedData);

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
      <div className="p-10 text-center text-gray-500 dark:text-gray-400">
        <p>Loading your subscriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">My Subscriptions</h1>
      
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