
import React, { useState, useEffect } from "react";

export default function ProfilePage() {
  const userId = localStorage.getItem("userId"); // Ensure userId is stored in localStorage after login
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    image: null,
  });

  useEffect(() => {
    fetch(`http://localhost:3000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setProfile({ ...data, image: null }))
      .catch((err) => console.error("Error fetching user:", err));
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    const updatedProfile = { ...profile };
    delete updatedProfile.image; // Image upload not handled in backend

    fetch(`http://localhost:3000/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProfile),
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile({ ...data, image: null });
        setIsEditing(false);
      })
      .catch((err) => console.error("Error updating user:", err));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-[#00B7C2] dark:text-[#00B7C2]">User Profile</h2>

        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <img
              src={
                profile.image
                  ? URL.createObjectURL(profile.image)
                  : "https://via.placeholder.com/150"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-white dark:border-gray-700"
            />
            {isEditing && (
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="absolute bottom-0 right-0 text-xs file:mr-2 file:px-3 file:py-1 file:rounded-full file:border-0 file:text-sm file:bg-[#00B7C2] file:text-white hover:file:bg-[#009fa9]"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ["Full Name", "name"],
            ["Username", "username"],
            ["Password", "password"],
            ["Email ID", "email"],
          ].map(([label, key]) => (
            <div
              key={key}
              className="transition-transform transform hover:scale-[1.01]"
            >
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                {label}
              </label>
              <input
                type={key === "password" ? "password" : "text"}
                name={key}
                value={profile[key]}
                disabled={!isEditing}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B7C2] shadow-sm ${
                  key === "username" ? "bg-sky-100" : "bg-white"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-6">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-[#00B7C2] hover:bg-[#009fa9] text-white px-6 py-2 rounded-xl shadow-md transition duration-300"
              >
                Save Changes
              </button>
              <button
                onClick={handleEditToggle}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl shadow-md transition duration-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="bg-[#00B7C2] hover:bg-[#009fa9] text-white px-8 py-2 rounded-xl shadow-lg transition duration-300"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
