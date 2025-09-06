import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users, Tag, X, AlertTriangle, Rocket, Target, TrendingUp, Plus, Star } from 'lucide-react';
import api from '../../utils/api';

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
    
            try {
                console.log('Attempting to delete service:', {
                    serviceId: deleteModal.serviceId
                });
    
                // First, verify the service exists
                try {
                    const serviceData = await api.get(`/services/${deleteModal.serviceId}`);
                    // If we get here, service exists
                    console.log('Service exists:', serviceData.data);
                } catch (getError) {
                    // If GET fails with 404
                    if (getError.response?.status === 404) {
                        console.log('Service not found, treating as already deleted');
                        onServiceDeleted(deleteModal.serviceId);
                        closeDeleteModal();
                        alert('Service deleted successfully! (Already removed)');
                        return;
                    }
                    throw getError; // Re-throw other errors
                }

            try {
                await api.delete(`/services/${deleteModal.serviceId}`);
                console.log('Delete successful');

                // Update UI
                onServiceDeleted(deleteModal.serviceId);
                closeDeleteModal();
                alert('Service deleted successfully!');
            } catch (deleteError) {
                if (deleteError.response?.status === 404) {
                    console.log('Service not found during delete, treating as already deleted');
                    onServiceDeleted(deleteModal.serviceId);
                    closeDeleteModal();
                    alert('Service deleted successfully!');
                    return;
                }
                throw deleteError; // Re-throw other delete errors
            }

            onServiceDeleted(deleteModal.serviceId);
            closeDeleteModal();
            // Show success message
            alert('Service deleted successfully!');

        } catch (err) {
            console.error('Delete service error:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response,
                status: err.response?.status
            });
            if (err.response?.status === 404) {
                // Service already deleted, treat as success
                onServiceDeleted(deleteModal.serviceId);
                closeDeleteModal();
                alert('Service deleted successfully! (Already removed)');
            } else {
                const errorMessage = err.message || 'Unknown error occurred';
                alert(`Error deleting service: ${errorMessage}`);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="anim-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-[#2bb6c4]/15 to-[#5ed1dc]/15 rounded-xl">
                    <Users className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#2bb6c4] to-[#5ed1dc] rounded-full"></div>
                    Services I'm Providing
                </h2>
            </div>

            {services.length > 0 ? (
                <div className="space-y-4">
                    {services.map((service, index) => (
                        <div
                            key={service._id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xl transition-all duration-300 card-hover anim-fade-in-up relative overflow-hidden"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Background accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#2bb6c4]/5 to-transparent rounded-bl-xl"></div>

                            <div className="flex-grow relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{service.serviceName}</p>
                                </div>
                                <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4 mt-2">
                                    <span className="flex items-center gap-2 bg-gradient-to-r from-[#2bb6c4]/10 to-[#5ed1dc]/10 px-3 py-1 rounded-full">
                                        <Tag size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
                                        ₹{service.rentalPrice}/slot
                                    </span>
                                    <span className="flex items-center gap-2 bg-gradient-to-r from-[#2bb6c4]/10 to-[#5ed1dc]/10 px-3 py-1 rounded-full">
                                        <Users size={14} className="text-[#2bb6c4] dark:text-[#5ed1dc]" />
                                        {service.currentUsers}/{service.maxUsers} booked
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center relative z-10">
                                <button
                                    onClick={() => handleEdit(service._id)}
                                    className="p-2 text-[#2bb6c4] dark:text-[#5ed1dc] hover:bg-[#2bb6c4]/10 dark:hover:bg-[#5ed1dc]/10 rounded-full transition-all duration-200 hover:scale-110"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(service._id, service.serviceName)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 hover:scale-110"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center relative overflow-hidden anim-fade-in-up">
                    {/* Background gradient pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-8 left-8 w-24 h-24 bg-[#2bb6c4] rounded-full blur-xl"></div>
                        <div className="absolute bottom-8 right-8 w-32 h-32 bg-[#5ed1dc] rounded-full blur-xl"></div>
                    </div>

                    <div className="relative z-10">
                        {/* Bouncing rocket icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2bb6c4]/15 to-[#5ed1dc]/15 rounded-full mb-6 anim-float">
                            <Rocket className="w-10 h-10 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 gradient-text">
                            Ready to Launch Your First Service?
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            Share your expertise and skills with our community. Create services that help others and earn while you do it!
                        </p>

                        {/* Feature points */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
                            <div className="bg-gradient-to-br from-[#2bb6c4]/10 to-[#5ed1dc]/10 p-3 rounded-lg hover:shadow-lg transition-all duration-200 card-hover">
                                <Target className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc] mx-auto mb-2" />
                                <p className="text-xs font-medium gradient-text">Reach Customers</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#2bb6c4]/10 to-[#5ed1dc]/10 p-3 rounded-lg hover:shadow-lg transition-all duration-200 card-hover">
                                <TrendingUp className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc] mx-auto mb-2" />
                                <p className="text-xs font-medium gradient-text">Earn Money</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#2bb6c4]/10 to-[#5ed1dc]/10 p-3 rounded-lg hover:shadow-lg transition-all duration-200 card-hover">
                                <Users className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc] mx-auto mb-2" />
                                <p className="text-xs font-medium gradient-text">Build Network</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard/add-service')}
                            className="inline-flex items-center gap-3 px-6 py-3 btn-gradient rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 anim-pulse-slow"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Service
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 anim-fade-in-up">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                    <AlertTriangle className="text-red-500 w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Delete Service</h3>
                            </div>

                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                                Are you sure you want to delete <span className="font-semibold gradient-text">"{deleteModal.serviceName}"</span>?
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                ⚠️ This action cannot be undone. All active bookings for this service will be affected.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
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

ProvidedServicesList.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      serviceName: PropTypes.string.isRequired,
      rentalPrice: PropTypes.number.isRequired,
      currentUsers: PropTypes.number,
      maxUsers: PropTypes.number.isRequired
    })
  ).isRequired,
  onServiceDeleted: PropTypes.func.isRequired
};

export default ProvidedServicesList;
