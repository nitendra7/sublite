// Rate limiting utilities

class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  // Check if request should be allowed
  checkLimit(identifier, limit = 100, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out requests outside the time window
    const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    
    // Check if limit exceeded
    if (recentRequests.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: recentRequests[0] + windowMs
      };
    }
    
    // Add new request timestamp
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return {
      allowed: true,
      remaining: limit - recentRequests.length,
      resetTime: now + windowMs
    };
  }

  // Clear old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [identifier, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(timestamp => now - timestamp < 60 * 60 * 1000);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }

  // Reset limits for a specific identifier
  reset(identifier) {
    this.requests.delete(identifier);
  }

  // Get current request count for identifier
  getCount(identifier) {
    return (this.requests.get(identifier) || []).length;
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Cleanup every hour
setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1000);

module.exports = rateLimiter;
