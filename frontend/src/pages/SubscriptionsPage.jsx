import React, { useState, useEffect } from 'react';
import ProvidedServicesList from '../components/subscriptions/ProvidedServicesList';
import JoinedSubscriptionsList from '../components/subscriptions/JoinedSubscriptionsList';

const API_BASE = "https://sublite-wmu2.onrender.com";

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
        const responseProvided = await fetch(`${API_BASE}/api/services/my-services`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // Fetch subscriptions joined by the user (bookings made by the user)
        const responseJoined = await fetch(`${API_BASE}/api/bookings/my-joined`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!responseProvided.ok || !responseJoined.ok) {
          throw new Error('Failed to fetch data');
        }

        const dataProvided = await responseProvided.json();
        const dataJoined = await responseJoined.json();

        setProvidedServices(dataProvided);
        setJoinedSubscriptions(dataJoined);

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

