const express = require('express');
const authController = require('../controllers/authController');
const { validate, registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } = require('../middleware/validation');
const router = express.Router();

// Register
router.post('/register', validate(registerSchema), authController.register);
// Login
router.post('/login', validate(loginSchema), authController.login);
// Forgot Password
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
// Verify OTP
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
// Reset Password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
// Refresh token
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
// Logout
router.post('/logout', authController.logout);
// Verify Reset OTP
router.post('/verify-reset-otp', validate(verifyOtpSchema), authController.verifyResetOtp);

module.exports = router;
