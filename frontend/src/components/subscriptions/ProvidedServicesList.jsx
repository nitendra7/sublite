import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users, Tag } from 'lucide-react';

const ProvidedServicesList = ({ services, onServiceDeleted }) => {
    const navigate = useNavigate();

    const handleEdit = (serviceId) => {
        navigate(`/dashboard/edit-service/${serviceId}`);
    };

    const handleDelete = async (serviceId) => {
        if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
            return;
        }

        const token = localStorage.getItem('token');
        const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
        
        try {
            const response = await fetch(`${API_BASE}/api/services/${serviceId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to delete service.');
            }
            
            onServiceDeleted(serviceId);
            alert('Service deleted successfully!');

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Services I'm Providing</h2>
            {services.length > 0 ? (
                <div className="space-y-4">
                    {services.map(service => (
                        <div key={service._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xl transition-shadow">
                            <div className="flex-grow">
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{service.serviceName}</p>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4 mt-2">
                                    <span className="flex items-center gap-1"><Tag size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" /> ₹{service.rentalPrice}/slot</span>
                                    <span className="flex items-center gap-1"><Users size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" /> {service.currentUsers}/{service.maxUsers} users</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <button onClick={() => handleEdit(service._id)} className="p-2 text-[#2bb6c4] dark:text-[#5ed1dc] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(service._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-gray-500 dark:text-gray-400">You haven't listed any services yet.</p>
                </div>
            )}
        </div>
    );
};

export default ProvidedServicesList;