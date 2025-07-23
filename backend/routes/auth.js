const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);
// Refresh token
router.post('/refresh', authController.refreshToken);
// Logout
router.post('/logout', authController.logout);
// Google login
router.post('/google-login', authController.googleLogin); 

module.exports = router; 