import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DollarSign, Shield, Tag, FileText, MapPin } from 'lucide-react';
import api, { API_BASE } from '../utils/api';

const EditServicePage = () => {
    const navigate = useNavigate();
    const { serviceId } = useParams();
    const [formData, setFormData] = useState({
        serviceName: '',
        serviceType: 'Streaming',
        description: '',
        originalPrice: '',
        maxUsers: '',
        subscriptionExpiry: '',
        accessInstructionsTemplate: '',
        features: '',
        credentials: {
            username: '',
            password: '',
            profileName: ''
        },
        terms: '',
        location: {
            city: '',
            state: '',
            country: ''
        }
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Fetch service data on component mount
    useEffect(() => {
        const fetchServiceData = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                setIsLoadingData(false);
                return;
            }
            
            try {
                const response = await api.get(`/services/${serviceId}`);
                const serviceData = response.data;
                
                // Format the data for the form
                setFormData({
                    serviceName: serviceData.serviceName || '',
                    serviceType: serviceData.serviceType || 'Streaming',
                    description: serviceData.description || '',
                    originalPrice: serviceData.originalPrice || '',
                    maxUsers: serviceData.maxUsers || '',
                    subscriptionExpiry: serviceData.subscriptionExpiry ? serviceData.subscriptionExpiry.split('T')[0] : '',
                    accessInstructionsTemplate: serviceData.accessInstructionsTemplate || '',
                    features: Array.isArray(serviceData.features) ? serviceData.features.join(', ') : serviceData.features || '',
                    credentials: {
                        username: serviceData.credentials?.username || '',
                        password: serviceData.credentials?.password || '',
                        profileName: serviceData.credentials?.profileName || ''
                    },
                    terms: serviceData.terms || '',
                    location: {
                        city: serviceData.location?.city || '',
                        state: serviceData.location?.state || '',
                        country: serviceData.location?.country || ''
                    }
                });
            } catch (err) {
                setError('Failed to load service data: ' + err.message);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchServiceData();
    }, [serviceId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCredentialChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            credentials: { ...prev.credentials, [name]: value }
        }));
    };
    
    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            location: { ...prev.location, [name]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('token');
        
        console.log('Token present:', !!token);
        console.log('API_BASE:', API_BASE);
        
        if (!token) {
            setError("Authentication token not found. Please log in again.");
            setIsLoading(false);
            return;
        }
        
        // Basic frontend validation
        if (!formData.serviceName || !formData.originalPrice || !formData.maxUsers) {
            setError("Service Name, Original Price, and Max Users are required.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.put(`/services/${serviceId}`, {
                ...formData,
                features: formData.features.split(',').map(f => f.trim()).filter(f => f),
            });
            const result = response.data;
            setSuccess(`Service "${result.serviceName}" updated successfully!`);
            setTimeout(() => {
                navigate('/dashboard/subscriptions');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="p-6 md:p-10 min-h-full">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bb6c4] mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading service data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !formData.serviceName) {
        return (
            <div className="p-6 md:p-10 min-h-full">
                <div className="text-center text-red-500">
                    <p>{error}</p>
                    <button 
                        onClick={() => navigate('/dashboard/subscriptions')}
                        className="mt-4 bg-[#2bb6c4] text-white px-6 py-2 rounded-lg hover:bg-[#1ea1b0] transition-colors"
                    >
                        Back to Subscriptions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 min-h-full">
            <h1 className="text-3xl font-bold mb-2">Edit Service</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Update your subscription service details.</p>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                {/* Service Details */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Tag size={20} className="mr-2 text-[#2bb6c4]" />Service Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input name="serviceName" value={formData.serviceName} onChange={handleChange} placeholder="Service Name (e.g., Netflix Premium)" className="input-style" required />
                        <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="input-style">
                            <option>Streaming</option>
                            <option>Music</option>
                            <option>Gaming</option>
                            <option>Education</option>
                            <option>Software</option>
                            <option>Other</option>
                        </select>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="input-style md:col-span-2" rows="3"></textarea>
                    </div>
                </div>

                {/* Pricing and Slots */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><DollarSign size={20} className="mr-2 text-[#2bb6c4]" />Pricing & Slots</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Original Monthly Price *</label>
                            <input 
                                type="number" 
                                name="originalPrice" 
                                value={formData.originalPrice} 
                                onChange={handleChange} 
                                placeholder="₹ 999" 
                                className="input-style" 
                                required 
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Max Users Allowed *</label>
                            <input 
                                type="number" 
                                name="maxUsers" 
                                value={formData.maxUsers} 
                                onChange={handleChange} 
                                placeholder="4" 
                                className="input-style" 
                                required 
                                min="1"
                                max="10"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Subscription Expiry Date</label>
                            <input 
                                type="date" 
                                name="subscriptionExpiry" 
                                value={formData.subscriptionExpiry} 
                                onChange={handleChange} 
                                className="input-style" 
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Access Instructions Template</label>
                            <input 
                                type="text" 
                                name="accessInstructionsTemplate" 
                                value={formData.accessInstructionsTemplate} 
                                onChange={handleChange} 
                                placeholder="How to access the service" 
                                className="input-style" 
                            />
                        </div>
                    </div>
                     <p className="text-xs text-gray-400 mt-2">The base rental price per slot will be calculated automatically: (Original Price ÷ Max Users) × 1.1. Buyers will choose their rental duration when purchasing.</p>
                </div>
                
                 {/* Credentials */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Shield size={20} className="mr-2 text-[#2bb6c4]" />Shared Credentials</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input name="username" value={formData.credentials.username} onChange={handleCredentialChange} placeholder="Username / Email" className="input-style"/>
                        <input type="password" name="password" value={formData.credentials.password} onChange={handleCredentialChange} placeholder="Password" className="input-style"/>
                        <input name="profileName" value={formData.credentials.profileName} onChange={handleCredentialChange} placeholder="Shared Profile Name" className="input-style"/>
                    </div>
                     <p className="text-xs text-gray-400 mt-2">These will only be shared with confirmed members of your group.</p>
                </div>

                {/* Features & Terms */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><FileText size={20} className="mr-2 text-[#2bb6c4]" />Features & Terms</h2>
                     <div className="space-y-4">
                        <input name="features" value={formData.features} onChange={handleChange} placeholder="Features (comma-separated, e.g., 4K, Ad-free)" className="input-style" />
                        <textarea name="terms" value={formData.terms} onChange={handleChange} placeholder="Your terms for users (e.g., No password changes)" className="input-style" rows="3"></textarea>
                    </div>
                </div>

                {/* Location */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><MapPin size={20} className="mr-2 text-[#2bb6c4]" />Location (Optional)</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input name="city" value={formData.location.city} onChange={handleLocationChange} placeholder="City" className="input-style"/>
                        <input name="state" value={formData.location.state} onChange={handleLocationChange} placeholder="State" className="input-style"/>
                        <input name="country" value={formData.location.country} onChange={handleLocationChange} placeholder="Country" className="input-style"/>
                    </div>
                </div>

                {/* Submission */}
                <div className="flex justify-between items-center">
                    <button 
                        type="button" 
                        onClick={() => navigate('/dashboard/subscriptions')}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center">
                        {error && <p className="text-red-500 mr-4">{error}</p>}
                        {success && <p className="text-green-500 mr-4">{success}</p>}
                        <button type="submit" disabled={isLoading} className="bg-[#2bb6c4] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1ea1b0] transition-colors shadow disabled:bg-gray-400">
                            {isLoading ? 'Updating...' : 'Update Service'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

// Helper style for inputs to avoid repetition
const InputStyle = `
    .input-style {
        width: 100%;
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid #D1D5DB; /* gray-300 */
        background-color: #F9FAFB; /* gray-50 */
        color: #111827; /* gray-900 */
    }
    .dark .input-style {
        border-color: #4B5563; /* gray-600 */
        background-color: #374151; /* gray-700 */
        color: #F9FAFB; /* gray-50 */
    }
    .input-style:focus {
        outline: none;
        border-color: #2bb6c4;
        box-shadow: 0 0 0 2px rgba(43, 182, 196, 0.5);
    }
`;

// Injecting the style into the document head
const styleSheet = document.createElement("style");
styleSheet.innerText = InputStyle;
document.head.appendChild(styleSheet);

export default EditServicePage; 