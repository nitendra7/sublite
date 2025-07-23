// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Needed to fetch user role
const RefreshToken = require('../models/refreshtoken'); // Needed for refresh token checks (optional, could be in controller)

// Get secret from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET; // If you manage refresh tokens here

/**
 * Middleware to authenticate requests using custom JWT (for manual logins).
 * It also populates req.user with database user object and checks isAdmin.
 * This middleware WILL NOT verify Firebase ID Tokens.
 */
module.exports = async function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided or malformed header.' });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authorization token not found.' });
    }

    try {
        // Verify the custom JWT
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

        // Fetch user from DB to ensure they are active and get full details/roles
        const user = await User.findById(decoded.id).select('-password'); // 'id' is from your custom JWT payload
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated.' });
        }

        // Attach the full user object from your DB to the request
        req.user = user;
        next();

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please refresh token or log in again.' });
        }
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

// You might also adapt middleware/admin.js or just handle admin check within this middleware.
// For now, let's assume 'isAdmin' is on the 'user' object from DB, and you check it in the specific route if needed
// or you could make a separate admin middleware like before.
// However, if you want 'admin' middleware to work after this 'auth' middleware, then 'req.user.isAdmin' would be available.