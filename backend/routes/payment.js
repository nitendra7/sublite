const express = require('express');
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const router = express.Router();

// Route to create a Razorpay order
router.post('/create-order', auth, paymentController.createRazorpayOrder);

// Route to verify the payment
router.post('/verify', auth, paymentController.verifyRazorpayPayment);

// Route to get all payments for the logged-in user
router.get('/', auth, paymentController.getAllPayments);

module.exports = router;