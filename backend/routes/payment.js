const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

// --- Dependencies for Razorpay Integration ---
const Razorpay = require('razorpay');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have auth middleware to get req.user

// --- Razorpay Instance Initialization ---
// IMPORTANT: These keys should be stored securely in your .env file
// and loaded using process.env.RAZORPAY_KEY_ID
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// =================================================================
// ==      NEW ROUTES FOR RAZORPAY PAYMENT FLOW                   ==
// =================================================================

/**
 * @route   POST /api/payments/create-order
 * @desc    Creates a Razorpay order
 * @access  Private
 */
router.post('/create-order', authMiddleware, async (req, res) => {
    const { amount } = req.body; // Amount in INR from the frontend

    try {
        const options = {
            amount: Number(amount) * 100, // Amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"), // Generate a unique receipt id
        };

        const order = await razorpayInstance.orders.create(options);

        if (!order) {
            return res.status(500).send("Error creating Razorpay order");
        }

        // Send the created order details back to the frontend
        res.json(order);
    } catch (error) {
        console.error("Error in /create-order:", error);
        res.status(500).send(error.message);
    }
});


/**
 * @route   POST /api/payments/verify
 * @desc    Verifies the payment after completion on the frontend
 * @access  Private
 */
router.post('/verify', authMiddleware, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id; // Get userId from your authentication middleware

    try {
        // Create a signature using Node's built-in crypto module
        // This is a crucial security step
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        // Compare the signature from Razorpay with the one we generated
        if (razorpay_signature === expectedSign) {
            // --- PAYMENT IS SUCCESSFUL AND VERIFIED ---
            // TODO: Add your database logic here.
            // 1. Find the order details to get the amount.
            // 2. Create a new document in your 'payments' collection.
            // 3. Create a new 'credit' transaction in your 'wallettransactions' collection.
            // 4. Find the user by `userId` and update their `walletBalance`.

            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent." });
        }
    } catch (error) {
        console.error("Error in /verify:", error);
        res.status(500).send(error.message);
    }
});


// =================================================================
// ==      YOUR EXISTING PAYMENT ROUTES                           ==
// =================================================================

router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);

module.exports = router;