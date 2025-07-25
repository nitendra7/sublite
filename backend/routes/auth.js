const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);
// Forgot Password
router.post('/forgot-password', authController.forgotPassword);
// Verify OTP
router.post('/verify-otp', authController.verifyOtp);
// Reset Password
router.post('/reset-password', authController.resetPassword);
// Refresh token
router.post('/refresh', authController.refreshToken);
// Logout
router.post('/logout', authController.logout);

module.exports = router; 