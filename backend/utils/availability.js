const moment = require('moment-timezone');

/**
 * Checks if a provider is currently within their active hours.
 * @param {object} provider - The provider user object from the database.
 * @returns {boolean} - True if the provider is active, false otherwise.
 */
exports.isProviderActive = (provider) => {
  if (!provider || !provider.providerSettings) {
    return false; // Default to inactive if no settings
  }

  const { start, end } = provider.providerSettings.activeHours;
  const timezone = provider.providerSettings.timezone || 'UTC';

  try {
    const now = moment().tz(timezone);
    const startTime = moment.tz(`${now.format('YYYY-MM-DD')} ${start}`, 'YYYY-MM-DD HH:mm', timezone);
    const endTime = moment.tz(`${now.format('YYYY-MM-DD')} ${end}`, 'YYYY-MM-DD HH:mm', timezone);

    // Handle overnight schedules (e.g., 22:00 to 02:00)
    if (endTime.isBefore(startTime)) {
      endTime.add(1, 'day'); // Adjust end time to the next day
      if (now.isBefore(startTime)) {
        startTime.subtract(1, 'day');
      }
    }
    
    return now.isBetween(startTime, endTime);

  } catch (error) {
    console.error("Error checking provider availability:", error);
    return false; // Fail safely
  }
};