// Application constants

const CONSTANTS = {
  // User roles
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    PROVIDER: 'provider',
    CUSTOMER: 'customer'
  },

  // Booking statuses
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },

  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // Notification types
  NOTIFICATION_TYPES: {
    BOOKING: 'booking',
    PAYMENT: 'payment',
    REVIEW: 'review',
    SYSTEM: 'system',
    PROMOTION: 'promotion'
  },

  // Support ticket statuses
  TICKET_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  },

  // Transaction types
  TRANSACTION_TYPES: {
    CREDIT: 'credit',
    DEBIT: 'debit',
    REFUND: 'refund',
    WITHDRAWAL: 'withdrawal'
  },

  // Service categories
  SERVICE_TYPES: {
    SUBSCRIPTION: 'subscription',
    ONE_TIME: 'one_time',
    RECURRING: 'recurring'
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // File upload limits
  UPLOAD_LIMITS: {
    IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
    DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword']
  },

  // Time constants
  TIME: {
    ONE_HOUR: 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
    ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
    ONE_MONTH: 30 * 24 * 60 * 60 * 1000
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },

  // Error codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    SERVER_ERROR: 'SERVER_ERROR'
  }
};

module.exports = CONSTANTS;
