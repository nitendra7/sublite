// middleware/auth.js 

const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET; // This should be loaded from .env

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // Handle different JWT errors (e.g., TokenExpiredError, JsonWebTokenError)
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Access token expired', expired: true });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user; // Attach decoded user payload to request
    next(); // Proceed to the next middleware/route handler
  });
};
