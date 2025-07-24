import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Users, Shield, Tag, FileText, Camera, MapPin } from 'lucide-react';

const AddServicePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        serviceName: '',
        serviceType: 'Streaming', // Default value
        description: '',
        originalPrice: '',
        rentalDuration: '30', // Default value
        maxUsers: '',
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
        
        // Basic frontend validation
        if (!formData.serviceName || !formData.originalPrice || !formData.maxUsers) {
            setError("Service Name, Original Price, and Max Users are required.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('https://sublite-wmu2.onrender.com/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    features: formData.features.split(',').map(f => f.trim()), // Convert comma-separated string to array
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to add service.');
            }
            
            setSuccess(`Service "${result.serviceName}" added successfully! The fair rental price is calculated to be ₹${result.rentalPrice}.`);
            // Optionally, navigate away after a short delay
            setTimeout(() => {
                navigate('/dashboard/subscriptions'); // Navigate to a relevant page
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <h1 className="text-3xl font-bold mb-2">Add a New Service</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">List your subscription service for others to share.</p>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                {/* Service Details */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
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
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><DollarSign size={20} className="mr-2 text-[#2bb6c4]" />Pricing & Slots</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="Original Monthly Price (₹)" className="input-style" required />
                        <input type="number" name="maxUsers" value={formData.maxUsers} onChange={handleChange} placeholder="Max Users Allowed" className="input-style" required />
                        <select name="rentalDuration" value={formData.rentalDuration} onChange={handleChange} className="input-style">
                            <option value="30">30 Days</option>
                            <option value="90">90 Days</option>
                            <option value="365">365 Days</option>
                        </select>
                    </div>
                     <p className="text-xs text-gray-400 mt-2">The fair rental price per slot will be calculated automatically.</p>
                </div>
                
                 {/* Credentials */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Shield size={20} className="mr-2 text-[#2bb6c4]" />Shared Credentials</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input name="username" value={formData.credentials.username} onChange={handleCredentialChange} placeholder="Username / Email" className="input-style"/>
                        <input type="password" name="password" value={formData.credentials.password} onChange={handleCredentialChange} placeholder="Password" className="input-style"/>
                        <input name="profileName" value={formData.credentials.profileName} onChange={handleCredentialChange} placeholder="Shared Profile Name" className="input-style"/>
                    </div>
                     <p className="text-xs text-gray-400 mt-2">These will only be shared with confirmed members of your group.</p>
                </div>

                {/* Features & Terms */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><FileText size={20} className="mr-2 text-[#2bb6c4]" />Features & Terms</h2>
                     <div className="space-y-4">
                        <input name="features" value={formData.features} onChange={handleChange} placeholder="Features (comma-separated, e.g., 4K, Ad-free)" className="input-style" />
                        <textarea name="terms" value={formData.terms} onChange={handleChange} placeholder="Your terms for users (e.g., No password changes)" className="input-style" rows="3"></textarea>
                    </div>
                </div>

                {/* Location */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><MapPin size={20} className="mr-2 text-[#2bb6c4]" />Location (Optional)</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input name="city" value={formData.location.city} onChange={handleLocationChange} placeholder="City" className="input-style"/>
                        <input name="state" value={formData.location.state} onChange={handleLocationChange} placeholder="State" className="input-style"/>
                        <input name="country" value={formData.location.country} onChange={handleLocationChange} placeholder="Country" className="input-style"/>
                    </div>
                </div>


                {/* Submission */}
                <div className="flex justify-end items-center">
                    {error && <p className="text-red-500 mr-4">{error}</p>}
                    {success && <p className="text-green-500 mr-4">{success}</p>}
                    <button type="submit" disabled={isLoading} className="bg-[#2bb6c4] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1ea1b0] transition-colors shadow disabled:bg-gray-400">
                        {isLoading ? 'Submitting...' : 'Add Service'}
                    </button>
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


export default AddServicePage;