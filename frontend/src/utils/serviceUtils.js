// serviceUtils.js - Utilities for handling services and provider validation

/**
 * Filters out services that have null or missing providers
 * @param {Array} services - Array of service objects
 * @returns {Array} - Array of valid services with existing providers
 */
export const filterValidServices = (services) => {
  if (!Array.isArray(services)) return [];

  return services.filter((service) => {
    // Check if service exists and has a valid providerId
    if (!service || !service.providerId) {
      return false;
    }

    // If providerId is populated as an object, check if it has valid data
    if (typeof service.providerId === 'object') {
      if (!service.providerId._id || !service.providerId.name) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Validates if a service has a valid provider
 * @param {Object} service - Service object to validate
 * @returns {boolean} - True if service has valid provider
 */
export const hasValidProvider = (service) => {
  if (!service || !service.providerId) return false;

  // If providerId is just an ID string/ObjectId
  if (typeof service.providerId === 'string') return true;

  // If providerId is populated as an object
  if (typeof service.providerId === 'object') {
    return service.providerId._id && service.providerId.name;
  }

  return false;
};

/**
 * Gets provider information from a service
 * @param {Object} service - Service object
 * @returns {Object|null} - Provider info or null if not available
 */
export const getProviderInfo = (service) => {
  if (!service || !service.providerId) return null;

  // If providerId is populated as an object
  if (typeof service.providerId === 'object') {
    return {
      id: service.providerId._id,
      name: service.providerId.name,
      username: service.providerId.username,
      rating: service.providerId.rating,
      providerSettings: service.providerId.providerSettings,
    };
  }

  // If providerId is just an ID, return minimal info
  return {
    id: service.providerId,
    name: 'Unknown Provider',
    username: null,
    rating: null,
    providerSettings: null,
  };
};

/**
 * Cleans up services array by removing invalid entries and logging cleanup
 * @param {Array} services - Array of services to clean
 * @returns {Object} - Object with cleaned services and stats
 */
export const cleanupServices = (services) => {
  if (!Array.isArray(services)) {
    return { validServices: [], removedCount: 0 };
  }

  const originalCount = services.length;
  const validServices = filterValidServices(services);
  const removedCount = originalCount - validServices.length;

  if (removedCount > 0) {
    // Services removed
  }

  return {
    validServices,
    removedCount,
    originalCount,
  };
};

/**
 * Formats service data for display, handling missing provider gracefully
 * @param {Object} service - Service object
 * @returns {Object} - Formatted service object
 */
export const formatServiceForDisplay = (service) => {
  if (!service) return null;

  const provider = getProviderInfo(service);

  return {
    ...service,
    providerName: provider?.name || 'Unknown Provider',
    providerUsername: provider?.username || 'N/A',
    providerRating: provider?.rating || 0,
    isProviderValid: hasValidProvider(service),
    formattedPrice: service.rentalPrice ? `₹${service.rentalPrice}` : 'Price not set',
    availabilityText: service.availableSlots > 0
      ? `${service.availableSlots} slots available`
      : 'No slots available',
  };
};

/**
 * Groups services by provider status
 * @param {Array} services - Array of services
 * @returns {Object} - Object with valid and invalid services grouped
 */
export const groupServicesByProviderStatus = (services) => {
  if (!Array.isArray(services)) {
    return { validServices: [], invalidServices: [] };
  }

  const validServices = [];
  const invalidServices = [];

  services.forEach((service) => {
    if (hasValidProvider(service)) {
      validServices.push(service);
    } else {
      invalidServices.push(service);
    }
  });

  return {
    validServices,
    invalidServices,
  };
};

/**
 * Default export with all utilities
 */
export default {
  filterValidServices,
  hasValidProvider,
  getProviderInfo,
  cleanupServices,
  formatServiceForDisplay,
  groupServicesByProviderStatus,

};
