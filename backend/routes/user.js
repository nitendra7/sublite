const express = require('express');
const userController = require('../controllers/userController');
// const admin = require('../middleware/admin'); // Disabled admin for teacher testing
const router = express.Router();

// Get all users
router.get('/', admin, userController.getAllUsers); // Disabled admin for teacher testing
// Get user by ID
router.get('/:id', admin, userController.getUserById); // Disabled admin for teacher testing
// Create a new user
router.post('/', admin, userController.createUser); // Disabled admin for teacher testing
// Update a user by ID
router.put('/:id', admin, userController.updateUser); // Disabled admin for teacher testing
// Delete a user by ID
router.delete('/:id', admin, userController.deleteUser); // Disabled admin for teacher testing
module.exports = router; 