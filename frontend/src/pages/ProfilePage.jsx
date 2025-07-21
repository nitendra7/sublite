import React, { useState, useEffect, useCallback } from "react";
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Camera, MapPin, Briefcase, Star, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = 'https://sublite-wmu2.onrender.com';

export default function ProfilePage() {
  const { user, loading, error, updateUserContext } = useUser();
  const { darkMode } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  // Renamed from formData to profile to match usage in JSX
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
    coordinates: { latitude: 0, longitude: 0 }, // Added coordinates from schema
    preferredLocation: { city: '', state: '' },
  });
  const [initialProfile, setInitialProfile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const token = localStorage.getItem("token");
  const userId = user?._id;

  // Effect to initialize local 'profile' state when user data is available from context
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
        coordinates: { // Initialize coordinates
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

  // Effect to manage the image preview URL for newly selected files
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
      setProfile((prev) => ({ ...prev, profilePicture: files[0] }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditToggle = () => {
    setIsEditing(prev => !prev);
    if (isEditing && initialProfile) {
      setProfile(initialProfile);
      setImagePreview(initialProfile.profilePicture);
      setLocalError(null);
      setSaveSuccess(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!userId || !token) {
      setLocalError("Authentication required to save changes. Please log in.");
      return;
    }

    setLocalError(null);
    setSaveSuccess(false);

    const dataToUpdate = new FormData();

    Object.keys(profile).forEach(key => {
      if (key === 'password' || key === 'profilePicture' || typeof profile[key] === 'object') return;
      if (initialProfile && profile[key] !== initialProfile[key]) {
        dataToUpdate.append(key, profile[key]);
      }
    });

    if (profile.userType === 'provider') {
      if (profile.businessLocation) {
        Object.entries(profile.businessLocation).forEach(([key, value]) => {
          if (initialProfile?.businessLocation?.[key] !== value) {
            dataToUpdate.append(`businessLocation.${key}`, value);
          }
        });
      }
      if (initialProfile?.coordinates?.latitude !== profile.coordinates?.latitude) dataToUpdate.append('coordinates.latitude', profile.coordinates.latitude);
      if (initialProfile?.coordinates?.longitude !== profile.coordinates?.longitude) dataToUpdate.append('coordinates.longitude', profile.coordinates.longitude);
      
      if (initialProfile?.businessName !== profile.businessName) dataToUpdate.append('businessName', profile.businessName);
      if (initialProfile?.businessDescription !== profile.businessDescription) dataToUpdate.append('businessDescription', profile.businessDescription);
      if (initialProfile?.businessCategory !== profile.businessCategory) dataToUpdate.append('businessCategory', profile.businessCategory);

    } else if (profile.userType === 'client') {
      if (profile.preferredLocation) {
        Object.entries(profile.preferredLocation).forEach(([key, value]) => {
          if (initialProfile?.preferredLocation?.[key] !== value) {
            dataToUpdate.append(`preferredLocation.${key}`, value);
          }
        });
      }
    }

    if (profile.password && profile.password.trim() !== "") {
      dataToUpdate.append("password", profile.password);
    }

    if (profile.profilePicture && typeof profile.profilePicture !== 'string') {
      dataToUpdate.append("profilePicture", profile.profilePicture);
    } else if (profile.profilePicture === null && initialProfile?.profilePicture) {
      dataToUpdate.append("profilePicture", "");
    }

    if (Array.from(dataToUpdate.entries()).length === 0) {
      setIsEditing(false);
      setSaveSuccess(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToUpdate,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      updateUserContext(data);
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setLocalError(`Failed to save profile: ${err.message}`);
    } finally {
      // setIsSaving(false);
    }
  };

  // Helper to get initials for profile picture fallback
  const getInitialsAvatar = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <p className="text-xl font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <p className="text-xl font-semibold text-red-500 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden animate-fade-in
                    bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100
                    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-in-down">
        <h2 className="text-4xl font-extrabold mb-10 text-center text-[#2bb6c4] dark:text-[#5ed1dc] tracking-tight drop-shadow-lg animate-fade-in">
          User Profile
        </h2>

        {localError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 dark:bg-red-900 dark:text-red-200 dark:border-red-700" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{localError}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setLocalError(null)}>
              <svg className="fill-current h-6 w-6 text-red-500 dark:text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
          </div>
        )}
        {saveSuccess && (
          <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-3 rounded-md mb-4 dark:border-green-700">
            Profile updated successfully!
          </div>
        )}

        {/* Profile Picture / Initials */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group animate-fade-in">
            <img
              src={imagePreview || `https://placehold.co/150x150/e0e0e0/6c757d?text=${getInitialsAvatar(profile.name)}`} // Changed from formData.name to profile.name
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-700 transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay for changing profile picture in edit mode */}
            {isEditing && (
              <>
                <label htmlFor="profilePictureInput" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white cursor-pointer rounded-full">
                  <Camera size={32} />
                </label>
                <input
                  type="file"
                  id="profilePictureInput"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden" // Hide the default file input
                />
              </>
            )}
            {!isEditing && (
              <div className="absolute bottom-2 right-2 bg-[#2bb6c4] text-white px-3 py-1 rounded-full text-xs opacity-80 shadow transition-all duration-300 animate-bounce dark:bg-[#1ea1b0]">
                {user?.username || "User"}
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave}>
          {/* General User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name} // Changed from formData.name to profile.name
                onChange={handleChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={profile.username} // Changed from formData.username to profile.username
                onChange={handleChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email ID</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email} // Changed from formData.email to profile.email
                readOnly // Email is usually read-only
                className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 read-only:bg-gray-100 dark:read-only:bg-gray-700"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone} // Changed from formData.phone to profile.phone
                onChange={handleChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={profile.password} // Changed from formData.password to profile.password
                onChange={handleChange}
                readOnly={!isEditing}
                placeholder={isEditing ? "Enter new password" : "********"}
                className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700"
              />
            </div>
            {/* User Status */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Account Status</label>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                {user?.isVerified ? (
                  <CheckCircle size={18} className="text-green-500 dark:text-green-400" />
                ) : (
                  <XCircle size={18} className="text-red-500 dark:text-red-400" />
                )}
                <span>{user?.isVerified ? 'Verified' : 'Not Verified'}</span>
              </div>
            </div>
            {/* Wallet Balance */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Wallet Balance</label>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                <span className="text-[#2bb6c4] dark:text-[#5ed1dc] text-lg font-bold">₹{user?.walletBalance?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Provider-Specific Details */}
          {user?.userType === 'provider' && (
            <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h2 className="text-xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc] mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-[#2bb6c4] dark:text-[#5ed1dc]" /> Business Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Business Name</label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={profile.businessName} // Changed from formData.businessName to profile.businessName
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700"
                  />
                </div>
                <div>
                  <label htmlFor="businessCategory" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                  <input
                    type="text"
                    id="businessCategory"
                    name="businessCategory"
                    value={profile.businessCategory} // Changed from formData.businessCategory to profile.businessCategory
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="businessDescription" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Business Description</label>
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={profile.businessDescription} // Changed from formData.businessDescription to profile.businessDescription
                  onChange={handleChange}
                  readOnly={!isEditing}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700"
                ></textarea>
              </div>
              {/* Business Location */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <MapPin size={16} className="text-gray-600 dark:text-gray-400" /> Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="businessLocation.address" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Address</label>
                    <input type="text" id="businessLocation.address" name="businessLocation.address" value={profile.businessLocation.address} onChange={handleChange} readOnly={!isEditing} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700" />
                  </div>
                  <div>
                    <label htmlFor="businessLocation.city" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">City</label>
                    <input type="text" id="businessLocation.city" name="businessLocation.city" value={profile.businessLocation.city} onChange={handleChange} readOnly={!isEditing} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700" />
                  </div>
                  <div>
                    <label htmlFor="businessLocation.state" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">State</label>
                    <input type="text" id="businessLocation.state" name="businessLocation.state" value={profile.businessLocation.state} onChange={handleChange} readOnly={!isEditing} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700" />
                  </div>
                  <div>
                    <label htmlFor="businessLocation.pincode" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Pincode</label>
                    <input type="text" id="businessLocation.pincode" name="businessLocation.pincode" value={profile.businessLocation.pincode} onChange={handleChange} readOnly={!isEditing} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700" />
                  </div>
                </div>
              </div>
              {/* Provider Rating */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <Star size={16} className="text-gray-600 dark:text-gray-400" /> Provider Rating: <span className="text-[#2bb6c4] dark:text-[#5ed1dc] font-bold">{user?.rating?.toFixed(1) || 'N/A'}</span> ({user?.totalRatings || 0} reviews)
                </h3>
              </div>
            </div>
          )}

          {/* Client-Specific Details */}
          {user?.userType === 'client' && (
            <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h2 className="text-xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc] mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#2bb6c4] dark:text-[#5ed1dc]" /> Preferred Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredLocation.city" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">City</label>
                  <input type="text" id="preferredLocation.city" name="preferredLocation.city" value={profile.preferredLocation.city} onChange={handleChange} readOnly={!isEditing} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700" />
                </div>
                <div>
                  <label htmlFor="preferredLocation.state" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">State</label>
                  <input type="text" id="preferredLocation.state" name="preferredLocation.state" value={profile.preferredLocation.state} onChange={handleChange} readOnly={!isEditing} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-700" />
                </div>
              </div>
            </div>
          )}

          {/* Edit/Save/Cancel Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleEditToggle} // Cancel button
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#2bb6c4] text-white font-semibold hover:bg-[#1ea1b0] transition-colors shadow"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEditToggle} // Edit Profile button
                className="px-6 py-2 rounded-lg bg-[#2bb6c4] text-white font-semibold hover:bg-[#1ea1b0] transition-colors shadow"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}