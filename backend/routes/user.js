const express = require('express');
const userController = require('../controllers/userController');
const admin = require('../middleware/admin');
const router = express.Router();

// Get all users
router.get('/', admin, userController.getAllUsers);

// Get user by ID
router.get('/:id', admin, userController.getUserById);

// Create a new user
router.post('/', admin, userController.createUser);

// Update a user by ID
router.put('/:id', admin, userController.updateUser);

// Delete a user by ID
router.delete('/:id', admin, userController.deleteUser);

module.exports = router; 