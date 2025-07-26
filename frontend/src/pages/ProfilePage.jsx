import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Loader2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function ProfilePage() {
  const { user, loading, error, updateUserContext } = useUser();
  const { darkMode } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    profilePicture: '',
    userType: '',
    isVerified: false,
    isActive: true,
    rating: 0,
    totalRatings: 0,
    walletBalance: 0,
    businessName: '',
    businessDescription: '',
    businessCategory: '',
    businessLocation: { address: '', city: '', state: '', pincode: '' },
    coordinates: { latitude: 0, longitude: 0 },
    preferredLocation: { city: '', state: '' },
  });
  const [initialProfile, setInitialProfile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user) {
      const fetchedProfile = {
        name: user.name || "",
        username: user.username || "",
        password: "",
        email: user.email || "",
        phone: user.phone || "",
        profilePicture: user.profilePicture || "",
        userType: user.userType || "",
        isVerified: user.isVerified || false,
        isActive: user.isActive || true,
        rating: user.rating || 0,
        totalRatings: user.totalRatings || 0,
        walletBalance: user.walletBalance || 0,
        businessName: user.businessName || "",
        businessDescription: user.businessDescription || "",
        businessCategory: user.businessCategory || "",
        businessLocation: {
          address: user.businessLocation?.address || '',
          city: user.businessLocation?.city || '',
          state: user.businessLocation?.state || '',
          pincode: user.businessLocation?.pincode || '',
        },
        coordinates: {
          latitude: user.coordinates?.latitude || 0,
          longitude: user.coordinates?.longitude || 0,
        },
        preferredLocation: {
          city: user.preferredLocation?.city || '',
          state: user.preferredLocation?.state || '',
        },
      };
      setProfile(fetchedProfile);
      setInitialProfile(fetchedProfile);
      setImagePreview(user.profilePicture || null);
      setLocalError(null);
      setSaveSuccess(false);
    }
  }, [user]);

  useEffect(() => {
    if (profile.profilePicture && typeof profile.profilePicture !== 'string') {
      const objectUrl = URL.createObjectURL(profile.profilePicture);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (profile.profilePicture && typeof profile.profilePicture === 'string') {
      setImagePreview(profile.profilePicture);
    } else {
      setImagePreview(null);
    }
  }, [profile.profilePicture]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture' && files && files[0]) {
      setProfile(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setProfile(initialProfile);
      setImagePreview(initialProfile?.profilePicture || null);
    }
    setIsEditing(!isEditing);
    setLocalError(null);
    setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setLocalError(null);
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      Object.keys(profile).forEach(key => {
        if (key === 'profilePicture' && profile[key] instanceof File) {
          formData.append(key, profile[key]);
        } else if (key === 'profilePicture' && typeof profile[key] === 'string') {
          // Don't append if it's already a URL
        } else if (typeof profile[key] === 'object') {
          formData.append(key, JSON.stringify(profile[key]));
        } else if (profile[key] !== undefined && profile[key] !== null) {
          formData.append(key, profile[key]);
        }
      });

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await res.json();
      updateUserContext(data);
      setSaveSuccess(true);
      setIsEditing(false);
      setInitialProfile(profile);
    } catch (err) {
      setLocalError(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bb6c4] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
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

  if (!user) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          My Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-300">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Picture Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col items-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg overflow-hidden border-4 border-[#2bb6c4] dark:border-[#5ed1dc]">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2bb6c4] to-[#1ea1b0] flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                    </span>
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 cursor-pointer rounded-full">
                  <input type="file" accept="image/*" className="hidden" name="profilePicture" onChange={handleChange} />
                  <span className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M15 6v-3a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v3"/><path d="M23 19l-6-6"/><path d="M19 19h3v3H2"/><path d="M19 19l-3 3"/><path d="M19 19l-3-3"/></svg>
                  </span>
                </label>
              )}
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {profile.name || 'User'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                @{profile.username}
              </p>
              <div className="flex items-center justify-center gap-2">
                {profile.isVerified ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium dark:bg-green-800 dark:text-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium dark:bg-gray-700 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    Unverified
                  </span>
                )}
                {profile.rating > 0 && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium dark:bg-yellow-800 dark:text-yellow-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {profile.rating.toFixed(1)} ({profile.totalRatings})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.06 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.06-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={profile.password}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>

              {/* Wallet Balance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 16v-4"/><path d="M12 12v-4"/><path d="M12 8v-4"/></svg>
                  Wallet Balance
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#2bb6c4] dark:text-[#5ed1dc] font-bold cursor-not-allowed">
                  ₹{profile.walletBalance?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {localError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                {localError}
              </div>
            )}
            {saveSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
                Profile updated successfully!
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              {isEditing && (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#2bb6c4] text-white rounded-xl font-semibold hover:bg-[#1ea1b0] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
