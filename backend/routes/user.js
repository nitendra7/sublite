const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth'); // Import the authentication middleware
const admin = require('../middleware/admin'); // Import the admin middleware
const upload = require('../middleware/upload'); // Import the Multer upload middleware (for Cloudinary)

const router = express.Router();

// Get all users (Admin protected)
router.get('/', admin, userController.getAllUsers);

// Get user by ID (Authenticated user can get their own profile, admin can get any)
router.get('/:id', auth, userController.getUserById);

// Create a new user (Admin protected - typically for backend creation, not user registration)
router.post('/', admin, userController.createUser);

// Update a user by ID (Protected: User can update their own profile, with file upload capability)
// 'auth' middleware ensures user is logged in.
// 'upload' middleware processes 'profilePicture' file and sends it to Cloudinary.
router.put('/:id', auth, upload, userController.updateUser);

// Delete a user by ID (Admin protected)
router.delete('/:id', admin, userController.deleteUser);

module.exports = router;