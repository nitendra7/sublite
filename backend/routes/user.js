const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); 

const router = express.Router();

// --- User-specific Routes ---

// Check if Firebase is enabled
const isFirebaseEnabled = () => {
    return process.env.FIREBASE_SERVICE_ACCOUNT_KEY && 
           process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim() !== '';
};

// This route is for onboarding/syncing user profile data after Firebase signup/login.
// Only available if Firebase is configured
if (isFirebaseEnabled()) {
    router.post('/onboard-profile', auth, userController.onboardProfile);
} else {
    router.post('/onboard-profile', (req, res) => {
        res.status(503).json({ 
            message: 'Social login is currently disabled. Firebase configuration is missing.',
            error: 'FIREBASE_NOT_CONFIGURED' 
        });
    });
}

// Get the currently logged-in user's profile
// Now 'auth' correctly refers to the middleware function
router.get('/me', auth, userController.getMe);

// Update the currently logged-in user's profile
router.put('/me', auth, userController.updateMe);

// Deactivate the currently logged-in user's account
router.delete('/me', auth, userController.deactivateMe);


// --- Admin-only Routes ---
// Get all users
// Now 'auth' and 'admin' correctly refer to the middleware functions
router.get('/', auth, admin, userController.getAllUsers);

// Get a single user by their ID
router.get('/:id', auth, admin, userController.getUserById);

module.exports = router;
