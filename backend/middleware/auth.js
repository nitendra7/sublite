// middleware/auth.js
const admin = require('firebase-admin'); // Firebase Admin SDK import
const User = require('../models/user'); // Assuming you still fetch user from DB for full profile

// Firebase Admin SDK Initialization (Moved here from index.js)
// This ensures Admin SDK is initialized once when this middleware is first required.
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set!');
  // In a middleware, you can't exit process directly, so throw an error.
  throw new Error('Firebase Admin SDK: Environment variable FIREBASE_SERVICE_ACCOUNT_KEY is not set.');
}

try {
  // Check if app is already initialized to prevent re-initialization errors in dev mode
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized in middleware.');
  }
} catch (parseError) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY JSON in middleware:', parseError);
  throw new Error('Firebase Admin SDK: Error parsing service account key JSON.');
}


/**
 * @desc    Middleware to authenticate requests using Firebase ID Tokens.
 * It verifies the token and fetches the user's full profile from MongoDB.
 * @returns {object} req.user - Populated with the MongoDB user document.
 */
module.exports = async function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No Firebase ID token provided or malformed header.' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Verify the Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        // decodedToken contains Firebase UID, email, etc.
        
        // Fetch the user from your MongoDB using the Firebase UID
        // Assuming your User model has a 'firebaseUid' field to link to Firebase Auth.
        const user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password');

        if (!user) {
            // User not found in your database, potentially a new Firebase user who hasn't completed onboarding.
            // You might redirect them to an onboarding page or create a basic profile here.
            console.warn(`User with Firebase UID ${decodedToken.uid} not found in DB. Consider onboarding logic.`);
            // For now, return unauthorized if no matching user in your DB.
            // Or, you could just attach decodedToken and handle missing profile in controller.
            // For profile access, requiring DB entry is typical.
            return res.status(404).json({ message: 'User profile not found in database.' });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated.' });
        }

        // Attach the full user object from your DB to the request for controllers to use
        req.user = user;
        next();

    } catch (error) {
        console.error('Firebase ID Token verification failed:', error.message);
        // Specific error messages for client-side debugging
        let message = 'Invalid or expired authentication token.';
        if (error.code === 'auth/id-token-expired') {
            message = 'Authentication token expired. Please re-authenticate.';
        } else if (error.code === 'auth/argument-error') {
            message = 'Invalid authentication token format.';
        }
        return res.status(403).json({ message: message });
    }
};