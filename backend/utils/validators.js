// Additional validation utilities

const validators = {
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  isValidPhone: (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  },

  // Validate password strength
  isStrongPassword: (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Validate date format (YYYY-MM-DD)
  isValidDate: (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate);
  },

  // Validate time format (HH:MM)
  isValidTime: (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  // Validate URL
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Validate price/amount
  isValidAmount: (amount) => {
    return !isNaN(amount) && parseFloat(amount) >= 0;
  },

  // Sanitize string input
  sanitizeString: (str) => {
    return str.trim().replace(/[<>]/g, '');
  },

  // Validate MongoDB ObjectId
  isValidObjectId: (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
};

module.exports = validators;
