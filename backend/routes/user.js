const express = require('express');
const userController = require('../controllers/userController');
const admin = require('../middleware/admin'); // Admin middleware is applied after isAuthenticated in index.js

const router = express.Router();

// User-specific routes (protected)
router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.delete('/me', userController.deactivateMe);

// Admin-only routes
router.get('/', admin, userController.getAllUsers);
router.get('/:id', admin, userController.getUserById);

module.exports = router;