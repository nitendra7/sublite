// dateUtils.js - Shared date formatting utilities

/**
 * Formats a date string to a localized date format
 * @param {string|Date} dateStr - The date string or Date object to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string or empty string if invalid
 */
export function formatDate(dateStr, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!dateStr) return '';

  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.warn('Invalid date format:', dateStr);
    return '';
  }
}

/**
 * Formats a date to a more detailed format with time
 * @param {string|Date} dateStr - The date string or Date object to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(dateStr) {
  return formatDate(dateStr, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a date to show relative time (e.g., "2 days ago", "in 3 hours")
 * @param {string|Date} dateStr - The date string or Date object to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';

  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 30) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else {
      return formatDate(date);
    }
  } catch (error) {
    console.warn('Invalid date format:', dateStr);
    return '';
  }
}

/**
 * Checks if a date is in the past
 * @param {string|Date} dateStr - The date string or Date object to check
 * @returns {boolean} True if date is in the past
 */
export function isPastDate(dateStr) {
  if (!dateStr) return false;

  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return false;

    return date.getTime() < new Date().getTime();
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a date is today
 * @param {string|Date} dateStr - The date string or Date object to check
 * @returns {boolean} True if date is today
 */
export function isToday(dateStr) {
  if (!dateStr) return false;

  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return false;

    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
}
