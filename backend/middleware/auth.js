// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const admin = require('firebase-admin'); // Firebase Admin SDK import

// Get secrets from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
// REFRESH_TOKEN_SECRET is not directly used for verification in middleware, but needed in authController.
const FIREBASE_SERVICE_ACCOUNT_KEY = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Firebase Admin SDK Initialization (MOVED HERE)
if (!admin.apps.length) { // Check if app is already initialized to prevent re-initialization errors in dev mode
    if (!FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is NOT set. Firebase Admin SDK will not function.');
        // Don't exit process, but Firebase verification will fail.
    } else {
        try {
            const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin SDK initialized in middleware.');
        } catch (parseError) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY JSON in middleware:', parseError);
            // Don't exit process, but Firebase verification will fail.
        }
    }
}


/**
 * @desc    Hybrid Authentication Middleware
 * Verifies either a Custom JWT (for manual logins) or a Firebase ID Token (for Google/social logins).
 * Populates req.user with the MongoDB user document.
 * @returns {object} req.user - The authenticated user's document from MongoDB.
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

    let decodedTokenPayload; // Will hold the decoded JWT or Firebase ID token payload
    let userIdentityKey;    // Will hold the key to find user in DB (either _id or firebaseUid)
    let tokenSource;        // 'custom_jwt' or 'firebase'

    try {
        // Attempt 1: Verify as Custom JWT
        if (!ACCESS_TOKEN_SECRET) {
            console.warn('ACCESS_TOKEN_SECRET is not set. Custom JWT verification skipped.');
            // Skip this block if secret is missing to avoid crashing.
            throw new Error('Custom JWT secret missing'); // Throw to go to next catch block
        }
        decodedTokenPayload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        userIdentityKey = decodedTokenPayload.id; // Assuming 'id' is in your custom JWT payload
        tokenSource = 'custom_jwt';

    } catch (customJwtError) {
        // If Custom JWT failed, attempt 2: Verify as Firebase ID Token
        if (!admin.apps.length || !FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.warn('Firebase Admin SDK not initialized or key missing. Firebase ID Token verification skipped.');
            return res.status(403).json({ message: 'Authentication failed: Server config error or missing Firebase key.' });
        }
        try {
            decodedTokenPayload = await admin.auth().verifyIdToken(token);
            userIdentityKey = decodedTokenPayload.uid; // Firebase UID
            tokenSource = 'firebase';
        } catch (firebaseError) {
            // If neither token type works
            console.error('Authentication failed: Custom JWT error:', customJwtError.message, 'Firebase error:', firebaseError.message);
            let errorMessage = 'Invalid or expired authentication token.';
            if (customJwtError.message && customJwtError.message.includes('expired')) {
                errorMessage = 'Your session has expired. Please log in again.';
            } else if (firebaseError.code === 'auth/id-token-expired') {
                errorMessage = 'Your Firebase session has expired. Please log in again.';
            }
            return res.status(403).json({ message: errorMessage });
        }
    }

    // Now, find the user in your database using the identified key
    let user;
    if (tokenSource === 'custom_jwt') {
        user = await User.findById(userIdentityKey).select('-password');
    } else if (tokenSource === 'firebase') {
        user = await User.findOne({ firebaseUid: userIdentityKey }).select('-password');
    }

    if (!user) {
        return res.status(404).json({ message: 'User not found in database.' });
    }
    if (!user.isActive) {
        return res.status(403).json({ message: 'Your account has been deactivated.' });
    }

    // Attach the full user object from your DB to the request
    req.user = user;
    next();
};