import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users, Tag, X, AlertTriangle } from 'lucide-react';

const ProvidedServicesList = ({ services, onServiceDeleted }) => {
    const navigate = useNavigate();
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, serviceId: null, serviceName: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (serviceId) => {
        navigate(`/dashboard/edit-service/${serviceId}`);
    };

    const openDeleteModal = (serviceId, serviceName) => {
        setDeleteModal({ isOpen: true, serviceId, serviceName });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, serviceId: null, serviceName: '' });
    };

    const handleDelete = async () => {
        if (!deleteModal.serviceId) return;

        setIsDeleting(true);
        const token = localStorage.getItem('token');
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        
        try {
            console.log('Attempting to delete service:', {
                serviceId: deleteModal.serviceId,
                apiBase: API_BASE,
                hasToken: !!token
            });

            // First, let's verify the service exists and belongs to the user
            const getResponse = await fetch(`${API_BASE}/api/services/${deleteModal.serviceId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (getResponse.ok) {
                const serviceData = await getResponse.json();
                console.log('Service data:', serviceData);
            }

            const response = await fetch(`${API_BASE}/api/services/${deleteModal.serviceId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Delete response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const result = await response.json();
                console.error('Delete service error response:', result);
                throw new Error(result.message || `Failed to delete service. Status: ${response.status}`);
            }
            
            onServiceDeleted(deleteModal.serviceId);
            closeDeleteModal();
            // Show success message
            alert('Service deleted successfully!');

        } catch (err) {
            console.error('Delete service error:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsDeleting(false);
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
                                <button onClick={() => openDeleteModal(service._id, service.serviceName)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-gray-500 dark:text-gray-400">You haven't provided any services yet.</p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Delete Service</h3>
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex items-start gap-3 mb-6">
                            <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                    Are you sure you want to delete <span className="font-semibold">"{deleteModal.serviceName}"</span>?
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    This action cannot be undone. All active bookings for this service will be affected.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Service'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProvidedServicesList;