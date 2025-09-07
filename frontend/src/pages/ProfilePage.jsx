import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import {
  Loader2,
  Camera,
  User,
  Mail,
  Phone,
  Lock,
  Wallet,
  CheckCircle,
  AlertCircle,
  Star,
  Edit3,
  Save,
  X,
} from "lucide-react";
import Loading from "../components/ui/Loading";
import OtpModal from "../components/ui/OtpModal";
import api from "../utils/api";

export default function ProfilePage() {
  const { user, loading, error, updateUserContext } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    profilePicture: "",
    userType: "",
    isVerified: false,
    isActive: true,
    rating: 0,
    totalRatings: 0,
    walletBalance: 0,
  });
  const [initialProfile, setInitialProfile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user && !loading) {
      const fetchedProfile = {
        name: user.name || "",
        username: user.username || "",
        password: "",
        email: user.email || "",
        phone: user.phone || "",
        profilePicture: user.profilePicture || "",
        userType: user.userType || "",
        isVerified: user.isVerified || false,
        isActive: user.isActive !== undefined ? user.isActive : true,
        rating: user.rating || 0,
        totalRatings: user.totalRatings || 0,
        walletBalance: user.walletBalance || 0,
      };
      setProfile(fetchedProfile);
      setInitialProfile({ ...fetchedProfile });
    }
  }, [user, loading]);

  useEffect(() => {
    if (profile.profilePicture && typeof profile.profilePicture !== "string") {
      const objectUrl = URL.createObjectURL(profile.profilePicture);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (
      profile.profilePicture &&
      typeof profile.profilePicture === "string"
    ) {
      setImagePreview(profile.profilePicture);
    } else {
      setImagePreview(null);
    }
  }, [profile.profilePicture]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture" && files && files[0]) {
      setProfile((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
      setActiveField(name);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setProfile({ ...initialProfile });
      setImagePreview(initialProfile?.profilePicture || null);
      setOtpVerified(false);
      setChangePasswordMode(false);
      setLocalError(null);
      setSaveSuccess(false);
      setActiveField(null);
    }
    setIsEditing(!isEditing);
  };

  const handleOtpVerify = async (otp) => {
    setOtpLoading(true);
    setOtpError("");
    try {
      await api.post(`/auth/verify-profile-change-otp`, { otp });
      setOtpVerified(true);
      setChangePasswordMode(true);
      setShowOtpModal(false);
    } catch (err) {
      setOtpError(err.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setLocalError(null);
    setSaveSuccess(false);

    if (!token) {
      setLocalError("No authentication token found. Please log in again.");
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", profile.name || "");
      formData.append("username", profile.username || "");
      formData.append("phone", profile.phone || "");
      if (profile.password) formData.append("password", profile.password);

      if (profile.profilePicture instanceof File) {
        formData.append("profilePicture", profile.profilePicture);
      }

      const res = await api.put(`/users/me`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateUserContext(res.data);
      setSaveSuccess(true);
      setIsEditing(false);
      setInitialProfile(profile);
      setActiveField(null);
    } catch (err) {
      setLocalError(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in bg-[#141b2a]">
        <div className="text-center text-red-400">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";
  };

  return (
    <div className="min-h-screen bg-[#141b2a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-400">
                {isEditing
                  ? "You're in edit mode. Make changes and save."
                  : "Manage your account information"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-gray-600 text-white hover:bg-gray-700"
                >
                  <X size={18} />
                  Cancel
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-[#2bb6c4] text-white hover:bg-[#1ea1b0]"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-xl flex items-center gap-3 text-green-400">
            <CheckCircle size={20} />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {localError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <span>{localError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#1e2633] rounded-2xl p-8 border border-gray-700 h-fit sticky top-8">
              {/* Profile Picture */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#2bb6c4] to-[#1ea1b0] p-1">
                  <label
                    className={`w-full h-full rounded-full bg-[#1e2633] flex items-center justify-center overflow-hidden relative ${isEditing ? "cursor-pointer hover:bg-[#252f3e] transition-colors" : ""}`}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[#5ed1dc]">
                        {getInitials(profile.name)}
                      </span>
                    )}
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          name="profilePicture"
                          onChange={handleChange}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200">
                          <Camera
                            size={20}
                            className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200"
                          />
                        </div>
                      </>
                    )}
                  </label>
                </div>

                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#2bb6c4] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1ea1b0] transition-colors shadow-lg">
                    <Camera size={18} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      name="profilePicture"
                      onChange={handleChange}
                    />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profile.name || "User"}
                </h2>
                <p className="text-gray-400 mb-4">@{profile.username}</p>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {profile.isVerified ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 border border-green-700 rounded-full text-green-400 text-sm font-medium">
                      <CheckCircle size={14} />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-full text-gray-400 text-sm font-medium">
                      <AlertCircle size={14} />
                      Unverified
                    </div>
                  )}

                  {profile.rating > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-900/30 border border-yellow-700 rounded-full text-yellow-400 text-sm font-medium">
                      <Star size={14} />
                      {profile.rating.toFixed(1)} ({profile.totalRatings})
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="bg-[#2a3343] rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={18} className="text-[#5ed1dc]" />
                  <span className="text-gray-300 text-sm font-medium">
                    Wallet Balance
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#5ed1dc]">
                  ₹{profile.walletBalance?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="space-y-6">
              <div
                className={`bg-[#1e2633] rounded-2xl p-6 border transition-all duration-300 ${
                  isEditing ? "border-[#2bb6c4]/50" : "border-gray-700"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        activeField === "name" && isEditing
                          ? "text-[#5ed1dc]"
                          : "text-gray-300"
                      }`}
                    >
                      <User size={16} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      onFocus={() => setActiveField("name")}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border bg-[#2a3343] text-white placeholder-gray-400 transition-all duration-200 ${
                        isEditing
                          ? activeField === "name"
                            ? "border-[#2bb6c4] ring-1 ring-[#2bb6c4]/50 focus:outline-none"
                            : "border-gray-600 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]/50 focus:outline-none"
                          : "border-gray-600 cursor-not-allowed opacity-60"
                      }`}
                      required
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        activeField === "username" && isEditing
                          ? "text-[#5ed1dc]"
                          : "text-gray-300"
                      }`}
                    >
                      <User size={16} />
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={handleChange}
                      onFocus={() => setActiveField("username")}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border bg-[#2a3343] text-white placeholder-gray-400 transition-all duration-200 ${
                        isEditing
                          ? activeField === "username"
                            ? "border-[#2bb6c4] ring-1 ring-[#2bb6c4]/50 focus:outline-none"
                            : "border-gray-600 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]/50 focus:outline-none"
                          : "border-gray-600 cursor-not-allowed opacity-60"
                      }`}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Mail size={16} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-[#1a2030] text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        activeField === "phone" && isEditing
                          ? "text-[#5ed1dc]"
                          : "text-gray-300"
                      }`}
                    >
                      <Phone size={16} />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      onFocus={() => setActiveField("phone")}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border bg-[#2a3343] text-white placeholder-gray-400 transition-all duration-200 ${
                        isEditing
                          ? activeField === "phone"
                            ? "border-[#2bb6c4] ring-1 ring-[#2bb6c4]/50 focus:outline-none"
                            : "border-gray-600 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]/50 focus:outline-none"
                          : "border-gray-600 cursor-not-allowed opacity-60"
                      }`}
                    />
                  </div>
                </div>

                {/* Password Section */}
                <div className="mt-4 space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Lock size={16} />
                    Password
                  </label>
                  {isEditing ? (
                    !changePasswordMode ? (
                      <button
                        type="button"
                        onClick={() => setShowOtpModal(true)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#2bb6c4] bg-[#2bb6c4]/10 text-[#5ed1dc] hover:bg-[#2bb6c4]/20 transition-colors text-left"
                      >
                        Click to change password
                      </button>
                    ) : otpVerified ? (
                      <input
                        type="password"
                        name="password"
                        value={profile.password}
                        onChange={handleChange}
                        onFocus={() => setActiveField("password")}
                        placeholder="Enter new password"
                        className={`w-full px-4 py-2.5 rounded-lg border bg-[#2a3343] text-white placeholder-gray-400 transition-all duration-200 ${
                          activeField === "password"
                            ? "border-[#2bb6c4] ring-1 ring-[#2bb6c4]/50 focus:outline-none"
                            : "border-gray-600 focus:border-[#2bb6c4] focus:ring-1 focus:ring-[#2bb6c4]/50 focus:outline-none"
                        }`}
                      />
                    ) : (
                      <div className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-[#1a2030] text-gray-400 cursor-not-allowed">
                        Verify OTP to change password
                      </div>
                    )
                  ) : (
                    <div className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-[#1a2030] text-gray-400 cursor-not-allowed">
                      ••••••••
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="mt-6 md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-8 py-3 bg-[#2bb6c4] text-white rounded-lg font-medium hover:bg-[#1ea1b0] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-[#2bb6c4]/20"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleOtpVerify}
        loading={otpLoading}
        error={otpError}
        title="Verify Identity"
        description="Please enter the OTP sent to your email to change your password."
      />
    </div>
  );
}
