import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Info,
  Shield,
  Tag,
  IndianRupee,
  Users,
  Calendar,
  FileText,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import api from "../utils/api";

const AddServicePage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showLocationFields, setShowLocationFields] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    serviceName: "",
    serviceType: "Streaming",
    description: "",
    originalPrice: "",
    maxUsers: "",
    subscriptionExpiry: "",
    accessInstructionsTemplate: "",
    features: "",
    credentials: {
      username: "",
      password: "",
      profileName: "",
    },
    terms: "",
    location: {
      city: "",
      state: "",
      country: "",
    },
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.serviceName.trim()) {
        errors.serviceName = "Service name is required";
      }
      if (!formData.description.trim()) {
        errors.description = "Description is required";
      }
    }

    if (step === 2) {
      if (!formData.originalPrice || formData.originalPrice <= 0) {
        errors.originalPrice = "Valid price is required";
      }
      if (
        !formData.maxUsers ||
        formData.maxUsers <= 0 ||
        formData.maxUsers > 10
      ) {
        errors.maxUsers = "Max users should be between 1-10";
      }
    }

    if (step === 3) {
      if (!formData.credentials.username.trim()) {
        errors.username = "Username/Email is required";
      }
      if (!formData.credentials.password.trim()) {
        errors.password = "Password is required";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      credentials: { ...prev.credentials, [name]: value },
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [name]: value },
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const submitData = {
        ...formData,
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f),
      };

      // Don't send location if not provided
      if (
        !showLocationFields ||
        (!formData.location.city &&
          !formData.location.state &&
          !formData.location.country)
      ) {
        delete submitData.location;
      }

      const response = await api.post(`/services`, submitData);
      const result = response.data;

      setSuccess(
        `Service "${result.serviceName}" added successfully! The rental price is ₹${result.rentalPrice}/slot.`,
      );
      setTimeout(() => {
        navigate("/dashboard/subscriptions");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (step) => {
    if (step < currentStep)
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (step === currentStep)
      return (
        <div className="w-5 h-5 bg-[#2bb6c4] rounded-full flex items-center justify-center text-white text-xs font-bold">
          {step}
        </div>
      );
    return (
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs font-bold">
        {step}
      </div>
    );
  };

  const calculatedRentalPrice =
    formData.originalPrice && formData.maxUsers
      ? Math.ceil(
          (parseFloat(formData.originalPrice) / parseInt(formData.maxUsers)) *
            1.1,
        )
      : 0;

  return (
    <div className="p-4 md:p-8 min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Go back to previous step"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Add New Service
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Share your subscription and earn by splitting costs
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStepIcon(1)}
              <span
                className={`text-sm font-medium ${currentStep >= 1 ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
              >
                Service Info
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600 mx-4"></div>
            <div className="flex items-center gap-2">
              {getStepIcon(2)}
              <span
                className={`text-sm font-medium ${currentStep >= 2 ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
              >
                Pricing
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600 mx-4"></div>
            <div className="flex items-center gap-2">
              {getStepIcon(3)}
              <span
                className={`text-sm font-medium ${currentStep >= 3 ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
              >
                Credentials & Publish
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Service Details */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="w-6 h-6 text-[#2bb6c4]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Service Information
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      name="serviceName"
                      value={formData.serviceName}
                      onChange={handleChange}
                      placeholder="e.g., Netflix Premium Family Plan"
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        fieldErrors.serviceName
                          ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent`}
                    />
                    {fieldErrors.serviceName && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldErrors.serviceName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Type
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent"
                    >
                      <option value="Streaming">🎬 Streaming</option>
                      <option value="Music">🎵 Music</option>
                      <option value="Gaming">🎮 Gaming</option>
                      <option value="Education">📚 Education</option>
                      <option value="Software">💻 Software</option>
                      <option value="Other">📱 Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what's included, plan benefits, and any important details..."
                    rows="4"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                      fieldErrors.description
                        ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent`}
                  />
                  {fieldErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldErrors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Features (Optional)
                  </label>
                  <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    placeholder="e.g., 4K Quality, Ad-free, Multiple Devices"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent"
                  />
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Separate multiple features with commas
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Capacity */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <IndianRupee className="w-6 h-6 text-[#2bb6c4]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pricing & Capacity
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Subscription Price *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        placeholder="999"
                        min="1"
                        step="0.01"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                          fieldErrors.originalPrice
                            ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent`}
                      />
                    </div>
                    {fieldErrors.originalPrice && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldErrors.originalPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Users *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        name="maxUsers"
                        value={formData.maxUsers}
                        onChange={handleChange}
                        placeholder="4"
                        min="1"
                        max="10"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                          fieldErrors.maxUsers
                            ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent`}
                      />
                    </div>
                    {fieldErrors.maxUsers && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldErrors.maxUsers}
                      </p>
                    )}
                  </div>
                </div>

                {calculatedRentalPrice > 0 && (
                  <div className="bg-[#2bb6c4]/5 dark:bg-[#5ed1dc]/5 border border-[#2bb6c4]/20 dark:border-[#5ed1dc]/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc]" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Calculated Rental Price: ₹{calculatedRentalPrice} per
                          slot
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Users will choose their rental duration when booking
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subscription Expiry Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="date"
                        name="subscriptionExpiry"
                        value={formData.subscriptionExpiry}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Access Instructions
                    </label>
                    <input
                      type="text"
                      name="accessInstructionsTemplate"
                      value={formData.accessInstructionsTemplate}
                      onChange={handleChange}
                      placeholder="e.g., Use Profile 3, Don't change settings"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Credentials & Final Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Credentials */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-[#2bb6c4]" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Account Credentials
                  </h2>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">
                        Security Notice
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                        Credentials will only be shared with confirmed group
                        members and are encrypted for security.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username / Email *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.credentials.username}
                        onChange={handleCredentialChange}
                        placeholder="your.email@example.com"
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          fieldErrors.username
                            ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent`}
                      />
                      {fieldErrors.username && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldErrors.username}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.credentials.password}
                          onChange={handleCredentialChange}
                          placeholder="Enter account password"
                          className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                            fieldErrors.password
                              ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                          } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="profileName"
                      value={formData.credentials.profileName}
                      onChange={handleCredentialChange}
                      placeholder="e.g., Family, Shared Profile, Profile 1"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-[#2bb6c4]" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Terms & Guidelines
                  </h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rules for Group Members
                  </label>
                  <textarea
                    name="terms"
                    value={formData.terms}
                    onChange={handleChange}
                    placeholder="e.g., Don't change password, Use only assigned profile, No downloading for offline viewing"
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent resize-none"
                  />
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Set clear expectations to avoid conflicts
                  </p>
                </div>
              </div>

              {/* Optional Location */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-[#2bb6c4]" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Location Information
                    </h2>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Add location details
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showLocationFields}
                        onChange={(e) =>
                          setShowLocationFields(e.target.checked)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-11 h-6 rounded-full transition-colors ${
                          showLocationFields
                            ? "bg-[#2bb6c4]"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            showLocationFields
                              ? "translate-x-6"
                              : "translate-x-1"
                          } mt-1`}
                        ></div>
                      </div>
                    </div>
                  </label>
                </div>

                {showLocationFields && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.location.city}
                      onChange={handleLocationChange}
                      placeholder="City"
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent"
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.location.state}
                      onChange={handleLocationChange}
                      placeholder="State"
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent"
                    />
                    <input
                      type="text"
                      name="country"
                      value={formData.location.country}
                      onChange={handleLocationChange}
                      placeholder="Country"
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent"
                    />
                  </div>
                )}

                <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                  Location helps users find nearby group members for better
                  streaming quality
                </p>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-600 dark:text-green-400 text-sm">
                  {success}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <div className="flex-1"></div>

            {currentStep < 3 && (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-[#2bb6c4] hover:bg-[#1ea1b0] dark:bg-[#5ed1dc] dark:hover:bg-[#2bb6c4] text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                Next
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 bg-[#2bb6c4] hover:bg-[#1ea1b0] dark:bg-[#5ed1dc] dark:hover:bg-[#2bb6c4] text-white rounded-lg font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Publish Service
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServicePage;
