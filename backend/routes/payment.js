const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Route to create a Razorpay order
router.post('/create-order', authMiddleware, paymentController.createRazorpayOrder);

// Route to verify the payment
router.post('/verify', authMiddleware, paymentController.verifyRazorpayPayment);

// Route to get all payments
router.get('/', paymentController.getAllPayments);

module.exports = router;