// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
let clerkBackend = null;
try {
    // Lazy require to avoid crashing if Clerk is not installed
    clerkBackend = require('@clerk/backend');
} catch (e) {
    clerkBackend = null;
}

// Get secrets from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;


/**
 * @desc    Simple JWT Authentication Middleware
 * Verifies JWT tokens and populates req.user with the MongoDB user document.
 * @returns {object} req.user - The authenticated user's document from MongoDB.
 */
/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
async function verifyClerkAndAttachUser(req) {
    if (!clerkBackend || !CLERK_SECRET_KEY) return null;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split('Bearer ')[1];
    if (!token) return null;

    try {
        const { verifyToken } = clerkBackend;
        const verified = await verifyToken(token, {
            secretKey: CLERK_SECRET_KEY,
            // audience can be set via env if using JWT templates
            // audience: process.env.CLERK_JWT_AUD,
        });
        // Clerk user identification
        const clerkUserId = verified.sub;
        const primaryEmail = verified.email || (Array.isArray(verified.email_addresses) ? verified.email_addresses[0]?.email_address : undefined);
        const firstName = verified.first_name || verified.given_name;
        const lastName = verified.last_name || verified.family_name;
        const name = [firstName, lastName].filter(Boolean).join(' ') || 'Clerk User';

        if (!clerkUserId || !primaryEmail) return null;
        // Upsert local user using Clerk identity
        // Upsert local user using Clerk identity
        const user = await User.findOneAndUpdate(
            { email: primaryEmail },
            {
                $setOnInsert: { name },
                $set: {
                    email: primaryEmail,
                    isVerified: true,
                    isActive: true,
                    isSocialLogin: true,
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).select('-password');

        return user;
    } catch (err) {
        return null;
    }
}

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
        // On error, attempt Clerk verification as a fallback
        try {
            const clerkUser = await verifyClerkAndAttachUser(req);
            if (clerkUser) {
                req.user = clerkUser;
            }
        } catch (_) { }
        next();
    }
};

/**
 * Required authentication middleware - fails if no valid token
 */
module.exports = async function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Try Clerk fallback even without explicit Bearer? Keep consistent: require Bearer header
        return res.status(401).json({ message: 'No authentication token provided or malformed header.' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token not found.' });
    }

    try {
        // Verify JWT token
        if (!ACCESS_TOKEN_SECRET) {
            console.error('❌ CRITICAL: ACCESS_TOKEN_SECRET is not set in environment variables');
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        const decodedTokenPayload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const userId = decodedTokenPayload.id || decodedTokenPayload.userId;

        if (!userId) {
            console.error('❌ Token payload missing userId. Payload:', JSON.stringify(decodedTokenPayload));
            return res.status(403).json({ message: 'Invalid token payload.' });
        }

        // Find the user in database
        const user = await User.findById(userId).select('-password');

        if (!user) {
            console.error(`❌ User not found in database for userId: ${userId}`);
            return res.status(404).json({ message: 'User not found in database.' });
        }

        if (!user.isActive) {
            console.error(`❌ User account is deactivated: ${userId}`);
            return res.status(403).json({ message: 'Your account has been deactivated.' });
        }

        // Attach the user object to the request
        req.user = user;
        next();

    } catch (error) {
        console.error('❌ Authentication failed:', {
            error: error.message,
            name: error.name,
            tokenPreview: token ? token.substring(0, 20) + '...' : 'no token',
            hasSecret: !!ACCESS_TOKEN_SECRET,
            secretLength: ACCESS_TOKEN_SECRET ? ACCESS_TOKEN_SECRET.length : 0
        });

        // If our local JWT verification fails, attempt Clerk verification before rejecting
        try {
            const clerkUser = await verifyClerkAndAttachUser(req);
            if (clerkUser) {
                req.user = clerkUser;
                return next();
            }
        } catch (_) { }

        let errorMessage = 'Invalid or expired authentication token.';
        if (error.name === 'TokenExpiredError') {
            errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Invalid authentication token. Please log in again.';
        }
        return res.status(403).json({ message: errorMessage });
    }
};

// Export the optional auth middleware as well
module.exports.optionalAuth = optionalAuth;
