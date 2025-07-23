const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); 

const router = express.Router();

// --- User-specific Routes ---

// This route is for onboarding/syncing user profile data after Firebase signup/login.
router.post('/onboard-profile', auth, userController.onboardProfile);

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
