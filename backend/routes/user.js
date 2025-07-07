const express = require('express');
const userController = require('../controllers/userController');
// const admin = require('../middleware/admin'); // Disabled admin for teacher testing
const router = express.Router();

// Get all users
// router.get('/', admin, userController.getAllUsers); // Disabled admin for teacher testing
router.get('/', userController.getAllUsers); // Open access for teacher

// Get user by ID
// router.get('/:id', admin, userController.getUserById); // Disabled admin for teacher testing
router.get('/:id', userController.getUserById); // Open access for teacher

// Create a new user
// router.post('/', admin, userController.createUser); // Disabled admin for teacher testing
router.post('/', userController.createUser); // Open access for teacher

// Update a user by ID
// router.put('/:id', admin, userController.updateUser); // Disabled admin for teacher testing
router.put('/:id', userController.updateUser); // Open access for teacher

// Delete a user by ID
// router.delete('/:id', admin, userController.deleteUser); // Disabled admin for teacher testing
router.delete('/:id', userController.deleteUser); // Open access for teacher

module.exports = router; 