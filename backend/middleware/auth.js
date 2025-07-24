// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Get secrets from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;


/**
 * @desc    Simple JWT Authentication Middleware
 * Verifies JWT tokens and populates req.user with the MongoDB user document.
 * @returns {object} req.user - The authenticated user's document from MongoDB.
 */
/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async function (req, res, next) {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without setting req.user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        return next();
    }

    try {
        if (!ACCESS_TOKEN_SECRET) {
            console.error('ACCESS_TOKEN_SECRET is not set.');
            return next();
        }
        
        const decodedTokenPayload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const userId = decodedTokenPayload.id || decodedTokenPayload.userId;
        
        if (!userId) {
            return next();
        }

        const user = await User.findById(userId).select('-password');
        
        if (user && user.isActive) {
            req.user = user;
        }
        
        next();
        
    } catch (error) {
        // On error, just continue without authentication
        next();
    }
};

/**
 * Required authentication middleware - fails if no valid token
 */
module.exports = async function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No authentication token provided or malformed header.' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token not found.' });
    }

    try {
        // Verify JWT token
        if (!ACCESS_TOKEN_SECRET) {
            console.error('ACCESS_TOKEN_SECRET is not set.');
            return res.status(500).json({ message: 'Server configuration error.' });
        }
        
        const decodedTokenPayload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const userId = decodedTokenPayload.id || decodedTokenPayload.userId;
        
        if (!userId) {
            return res.status(403).json({ message: 'Invalid token payload.' });
        }

        // Find the user in database
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found in database.' });
        }
        
        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated.' });
        }

        // Attach the user object to the request
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Authentication failed:', error.message);
        let errorMessage = 'Invalid or expired authentication token.';
        
        if (error.message && error.message.includes('expired')) {
            errorMessage = 'Your session has expired. Please log in again.';
        }
        
        return res.status(403).json({ message: errorMessage });
    }
};

// Export the optional auth middleware as well
module.exports.optionalAuth = optionalAuth;
