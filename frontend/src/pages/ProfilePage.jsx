import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext'; // Correct path from src/pages to src/context

export default function ProfilePage() {
  // Get user data, loading state, and error from the UserContext
  const { user, loading, error, updateUserContext } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    password: "", // This field is for entering a new password, never pre-filled
    email: "",
    image: null, // Stores the File object for new uploads, or URL string from backend
  });
  const [initialProfile, setInitialProfile] = useState(null); // Stores the original profile data for comparison and cancellation
  const [imagePreview, setImagePreview] = useState(null); // Dedicated state for the image preview URL
  const [localError, setLocalError] = useState(null); // For errors specific to this component (e.g., save failures)

  const API_BASE = 'https://sublite-wmu2.onrender.com';

  // Get token from localStorage for sending in headers of PUT request
  const token = localStorage.getItem("token"); 
  // Get userId from the user object provided by context. This is the source of truth.
  const userId = user?._id; 

  // Effect to initialize local 'profile' state when user data is available from context
  useEffect(() => {
    if (user) {
      console.log("ProfilePage: Initializing profile state from context user:", user);
      const fetchedProfile = {
        name: user.name || "",
        username: user.username || "",
        password: "", // Always keep password empty initially for security
        email: user.email || "",
        image: user.image || null, // Image URL from backend
      };
      setProfile(fetchedProfile);
      setInitialProfile(fetchedProfile); // Save the initial state for comparison and cancellation
      setImagePreview(user.image || null); // Set initial image preview from user data
      setLocalError(null); // Clear any local errors when new user data loads
    }
  }, [user]); // Re-run this effect when the 'user' object from context changes

  // Effect to manage the image preview URL and revoke it to prevent memory leaks
  useEffect(() => {
    // If profile.image is a File object (meaning a new image was selected)
    if (profile.image && typeof profile.image !== 'string') {
      const objectUrl = URL.createObjectURL(profile.image);
      setImagePreview(objectUrl);

      // Cleanup function: revoke the object URL when the component unmounts or the image changes
      return () => URL.revokeObjectURL(objectUrl);
    } else if (profile.image && typeof profile.image === 'string') {
      // If it's a string, it's a URL from backend; just use it directly
      setImagePreview(profile.image);
    } else {
      // If no image is set, ensure preview is null to show placeholder
      setImagePreview(null);
    }
  }, [profile.image]); // Re-run when profile.image changes

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: files ? files[0] : value, // If file input, store the File object; otherwise, store value
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // When cancelling edit mode, revert any changes back to the initial state
    if (isEditing) {
      setProfile(initialProfile); // Revert all fields to their original fetched values
      setImagePreview(initialProfile.image); // Revert image preview too
      setLocalError(null); // Clear any local errors on cancel
    }
  };

  const handleSave = async () => {
    // Basic check for authentication credentials
    if (!userId || !token) {
      setLocalError("Authentication required to save changes. Please log in.");
      return;
    }

    setLocalError(null); // Clear previous local errors before attempting save

    // Compare current 'profile' state with 'initialProfile' to find what's changed.
    // This avoids sending unchanged data to the backend.
    const changedFields = {};
    Object.keys(profile).forEach(key => {
      // Exclude 'password' and 'image' from direct comparison, as they are handled specially.
      if (key !== 'password' && key !== 'image' && initialProfile && profile[key] !== initialProfile[key]) {
        changedFields[key] = profile[key];
      }
    });

    // Handle password update: only send if the user typed something into the password field.
    if (profile.password && profile.password.trim() !== "") {
      changedFields.password = profile.password;
    }

    // Determine if a new image file has been selected for upload.
    const hasNewImage = profile.image && typeof profile.image !== 'string';

    // If no fields have changed and no new image was selected, exit without an API call.
    if (Object.keys(changedFields).length === 0 && !hasNewImage) {
      setIsEditing(false); // Simply exit edit mode
      return;
    }

    let body;
    let headers = { Authorization: `Bearer ${token}` };

    if (hasNewImage) {
      // If there's a new image, use FormData for multipart/form-data upload.
      const formData = new FormData();
      Object.entries(changedFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("image", profile.image); // Append the actual File object
      body = formData;
      // The browser will automatically set the 'Content-Type' header to 'multipart/form-data'.
    } else {
      // If no new image, send data as JSON.
      body = JSON.stringify(changedFields);
      headers["Content-Type"] = "application/json";
    }

    try {
      // You might set a local loading state here if you want distinct loading feedback for saving.
      // E.g., const [isSaving, setIsSaving] = useState(false); setIsSaving(true);
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "PUT",
        headers: headers,
        body: body,
      });

      if (!res.ok) {
        // If the server response indicates an error (e.g., 400, 500), parse and throw.
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }

      const data = await res.json(); // Get the updated user data from the backend response
      console.log("ProfilePage: Profile updated successfully:", data);

      const newProfileState = {
        name: data.name || "",
        username: data.username || "",
        password: "", // Password field is always cleared after save for security
        email: data.email || "",
        image: data.image || null, // Use the new image URL returned by the backend
      };
      setProfile(newProfileState); // Update local profile state
      setInitialProfile(newProfileState); // Update initial profile state to the new saved data
      setImagePreview(newProfileState.image); // Update image preview immediately with the new URL

      // Crucially, update the global UserContext state with the new user data.
      // This ensures all other components using `useUser()` get the latest info.
      updateUserContext(newProfileState);

      setIsEditing(false); // Exit edit mode
    } catch (err) {
      console.error("ProfilePage: Error saving user profile:", err.message);
      setLocalError(`Failed to save profile: ${err.message}`); // Display specific error to user
    } finally {
      // setIsSaving(false); // If you used a local saving state
    }
  };

  // Render loading state if user context is still loading (initial profile fetch)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-xl font-semibold text-[#00B7C2] dark:text-gray-200">Loading profile...</div>
      </div>
    );
  }

  // Render a global error message if UserContext encountered an error (e.g., "Please log in")
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-md mx-auto p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          {/* Provide a clear call to action, like going to login */}
          <button
            onClick={() => window.location.href = '/login'} // Simple redirect
            className="bg-[#00B7C2] hover:bg-[#009fa9] text-white px-6 py-2 rounded-lg shadow-md transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Main profile content when data is loaded and no global error
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-sky-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 relative overflow-hidden animate-fade-in">
      <div className="max-w-4xl mx-auto p-8 bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-in-down">
        <h2 className="text-4xl font-extrabold mb-10 text-center text-[#00B7C2] dark:text-[#00B7C2] tracking-tight drop-shadow-lg animate-fade-in">
          User Profile
        </h2>

        {/* Display local errors (e.g., from save operation) */}
        {localError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{localError}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setLocalError(null)}>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
          </div>
        )}

        <div className="flex flex-col items-center mb-10">
          <div className="relative group animate-fade-in">
            <img
              src={imagePreview || "https://via.placeholder.com/150?text=No+Image"}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-700 transition-transform duration-500 group-hover:scale-105"
            />
            {isEditing && (
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="absolute bottom-2 right-2 text-xs file:mr-2 file:px-3 file:py-1 file:rounded-full file:border-0 file:text-sm file:bg-[#00B7C2] file:text-white hover:file:bg-[#009fa9] cursor-pointer"
              />
            )}
            {!isEditing && (
              <div className="absolute bottom-2 right-2 bg-[#00B7C2] text-white px-3 py-1 rounded-full text-xs opacity-80 shadow transition-all duration-300 animate-bounce">
                {user?.username || "User"} {/* Display username from context's user object */}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            ["Full Name", "name"],
            ["Username", "username"],
            ["Password", "password"],
            ["Email ID", "email"],
          ].map(([label, key], idx) => (
            <div
              key={key}
              className={`transition-transform duration-300 transform hover:scale-[1.03] animate-fade-in ${idx % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"}`}
              style={{ animationDelay: `${idx * 100 + 200}ms` }}
            >
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1 tracking-wide">
                {label}
              </label>
              <input
                type={key === "password" ? "password" : "text"}
                name={key}
                value={profile[key]}
                disabled={!isEditing && key !== "password"}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B7C2] shadow-sm transition-all duration-300 ${
                  key === "username" ? "bg-sky-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
                }`}
                placeholder={key === "password" && !isEditing ? "********" : ""}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center gap-6">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-[#00B7C2] hover:bg-[#009fa9] text-white px-8 py-2 rounded-xl shadow-lg transition-all duration-300 animate-fade-in"
                disabled={loading} // Disable save button during context loading or local saving if implemented
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleEditToggle}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-2 rounded-xl shadow-lg transition-all duration-300 animate-fade-in"
                disabled={loading} // Disable cancel button during context loading or local saving
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="bg-[#00B7C2] hover:bg-[#009fa9] text-white px-10 py-2 rounded-xl shadow-xl transition-all duration-300 animate-fade-in"
              disabled={loading} // Disable edit button during context loading
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      {/* Animations (kept as is) */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.7s ease both;
          }
          @keyframes slide-in-left {
            from { opacity: 0; transform: translateX(-40px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(40px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes slide-in-down {
            from { opacity: 0; transform: translateY(-40px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-slide-in-down {
            animation: slide-in-down 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-8px);}
          }
          .animate-bounce {
            animation: bounce 1.2s infinite;
          }
        `}
      </style>
    </div>
  );
}