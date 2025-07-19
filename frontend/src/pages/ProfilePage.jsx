import React, { useState, useEffect } from "react";

export default function ProfilePage() {
  const userId = localStorage.getItem("userId");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    image: null,
  });

  const API_BASE = 'https://sublite-wmu2.onrender.com';

  useEffect(() => {
    fetch(`${API_BASE}/api/users/${userId}`)
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
    delete updatedProfile.image;

    fetch(`${API_BASE}/users/${userId}`, {
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-sky-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 relative overflow-hidden animate-fade-in">
      <div className="max-w-4xl mx-auto p-8 bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-in-down">
        <h2 className="text-4xl font-extrabold mb-10 text-center text-[#00B7C2] dark:text-[#00B7C2] tracking-tight drop-shadow-lg animate-fade-in">
          User Profile
        </h2>

        <div className="flex flex-col items-center mb-10">
          <div className="relative group animate-fade-in">
            <img
              src={
                profile.image
                  ? URL.createObjectURL(profile.image)
                  : "https://via.placeholder.com/150"
              }
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
                {profile.username || "User"}
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
                disabled={!isEditing}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B7C2] shadow-sm transition-all duration-300 ${
                  key === "username" ? "bg-sky-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
                }`}
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
              >
                Save Changes
              </button>
              <button
                onClick={handleEditToggle}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-2 rounded-xl shadow-lg transition-all duration-300 animate-fade-in"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="bg-[#00B7C2] hover:bg-[#009fa9] text-white px-10 py-2 rounded-xl shadow-xl transition-all duration-300 animate-fade-in"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      {/* Animations */}
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