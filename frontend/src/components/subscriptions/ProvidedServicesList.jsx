import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';

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
        try {
            const response = await fetch(`/api/services/${serviceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Services I'm Providing</h2>
            {services.length > 0 ? (
                <div className="space-y-4">
                    {services.map(service => (
                        <div key={service._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-grow">
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{service.serviceName}</p>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4 mt-1">
                                    <span className="flex items-center gap-1"><Tag size={14} /> ₹{service.rentalPrice}/slot</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> {service.currentUsers}/{service.maxUsers} users</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <Button onClick={() => handleEdit(service._id)} variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <Edit size={18} />
                                </Button>
                                <Button onClick={() => handleDelete(service._id)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">You haven't listed any services yet.</p>
            )}
        </div>
    );
};

export default ProvidedServicesList;