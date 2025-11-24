// Security middleware for API protection

const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  
  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize request body, query params, and URL params
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
};

// API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Validate API key (implement your validation logic)
  // const isValid = validateKey(apiKey);
  
  // if (!isValid) {
  //   return res.status(403).json({ error: 'Invalid API key' });
  // }
  
  next();
};

// IP whitelist middleware
const ipWhitelist = (allowedIps = []) => {
  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    
    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
      return res.status(403).json({ error: 'Access denied from this IP' });
    }
    
    next();
  };
};

// Request size limiter
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > parseSize(maxSize)) {
      return res.status(413).json({ error: 'Request entity too large' });
    }
    
    next();
  };
};

// Helper function to parse size string
const parseSize = (size) => {
  const units = { kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.match(/^(\d+)(kb|mb|gb)?$/i);
  
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = (match[2] || 'b').toLowerCase();
  
  return value * (units[unit] || 1);
};

// SQL injection prevention (for SQL databases)
const preventSqlInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(union.*select)/gi,
    /(;.*--)/g,
    /('|")/g
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const checkObject = (obj) => {
    for (const key in obj) {
      if (checkValue(obj[key]) || (typeof obj[key] === 'object' && checkObject(obj[key]))) {
        return true;
      }
    }
    return false;
  };
  
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({ error: 'Invalid input detected' });
  }
  
  next();
};

// Export security middlewares
module.exports = {
  securityHeaders,
  sanitizeInput,
  validateApiKey,
  ipWhitelist,
  requestSizeLimiter,
  preventSqlInjection
};
