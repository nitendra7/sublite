const express = require('express');
const userController = require('../controllers/userController');
// const admin = require('../middleware/admin'); // Disabled admin for teacher testing
const router = express.Router();
const admin = require('../middleware/admin');

// Get all users
router.get('/', admin, userController.getAllUsers); // Disabled admin for teacher testing
// Get user by ID
router.get('/:id', userController.getUserById); // User can get their own profile, admin can get any
// Create a new user
router.post('/', admin, userController.createUser); // Disabled admin for teacher testing
// Update a user by ID
router.put('/:id', userController.updateUser); // User can update their own profile, admin can update any
// Delete a user by ID
router.delete('/:id', admin, userController.deleteUser); // Disabled admin for teacher testing
module.exports = router; 