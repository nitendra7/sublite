const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); 

const router = express.Router();

// --- User-specific Routes ---

// Note: Firebase onboard-profile route has been removed as we've simplified auth to JWT-only

// Get the currently logged-in user's profile
// Now 'auth' correctly refers to the middleware function
router.get('/me', auth, userController.getMe);

const upload = require('../middleware/upload');
// Update the currently logged-in user's profile (with profile picture upload support)
router.put('/me', auth, upload, userController.updateMe);

// Deactivate the currently logged-in user's account
router.delete('/me', auth, userController.deactivateMe);


// --- Admin-only Routes ---
// Get all users
// Now 'auth' and 'admin' correctly refer to the middleware functions
router.get('/', auth, admin, userController.getAllUsers);

// Get a single user by their ID
router.get('/:id', auth, admin, userController.getUserById);

// Delete a user by their ID (Admin only)
router.delete('/:id', auth, admin, userController.deleteUserById);

// Update a user's admin status (Admin only)
router.patch('/:id/role', auth, admin, userController.updateUserRole);

module.exports = router;
