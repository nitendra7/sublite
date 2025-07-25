import React, { useState, useEffect, useCallback } from "react";
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Camera, MapPin, Briefcase, Star, CheckCircle, XCircle } from 'lucide-react';
// Import the reusable Input component
import { Input } from '../components/ui/input'; // Adjust the path if input.jsx is in a different directory

const API_BASE = 'https://sublite-wmu2.onrender.com';

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

    if (!token) {
      setLocalError("Authentication required to save changes. Please log in.");
      return;
    }

    setLocalError(null);
    setSaveSuccess(false);

    // Prepare only the fields the backend expects
    const dataToUpdate = {};
    if (profile.name !== initialProfile?.name) dataToUpdate.name = profile.name;
    if (profile.phone !== initialProfile?.phone) dataToUpdate.phone = profile.phone;
    if (profile.password && profile.password.trim() !== "") dataToUpdate.password = profile.password;
    if (profile.userType === 'provider' && profile.providerSettings) {
      dataToUpdate.providerSettings = profile.providerSettings;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      setIsEditing(false);
      setSaveSuccess(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToUpdate),
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-4 py-10">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#2bb6c4] dark:text-[#5ed1dc] drop-shadow">User Profile</h1>
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg overflow-hidden border-4 border-[#2bb6c4] dark:border-[#5ed1dc]">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5v2.25m0 0c-3.75 0-6.75-3-6.75-6.75S8.25 5.25 12 5.25s6.75 3 6.75 6.75-3 6.75-6.75 6.75z" /></svg></span>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition cursor-pointer">
                <input type="file" accept="image/*" className="hidden" name="profilePicture" onChange={handleChange} />
                <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition">Change</span>
              </label>
            </div>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[#2bb6c4] outline-none" required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Username</label>
              <input type="text" name="username" value={profile.username} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[#2bb6c4] outline-none" required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email ID</label>
              <input type="email" name="email" value={profile.email} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed" disabled />
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone Number</label>
              <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[#2bb6c4] outline-none" />
            </div>
            <div>
              <label className="block mb-1 font-medium">New Password</label>
              <input type="password" name="password" value={profile.password} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[#2bb6c4] outline-none" placeholder="Enter new password" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Wallet Balance</label>
              <div className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-[#2bb6c4] dark:text-[#5ed1dc] font-bold cursor-not-allowed">₹{profile.walletBalance?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
          {localError && <div className="text-red-500 text-center">{localError}</div>}
          {saveSuccess && <div className="text-green-600 text-center">Profile updated successfully!</div>}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={handleEditToggle} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-[#2bb6c4] text-white font-semibold shadow-md hover:bg-[#1ea1b0] dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4] transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
