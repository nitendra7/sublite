const User = require('../models/user');
const Payment = require('../models/payment');
const WalletTransaction = require('../models/walletTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// All routes here are assumed to be protected by isAuthenticated middleware in index.js.

/**
 * @desc    Creates a Razorpay order
 */
exports.createRazorpayOrder = async (req, res) => {
    const { amount } = req.body;
    try {
        const options = {
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };
        const order = await razorpayInstance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Error creating Razorpay order" });
    }
};

/**
 * @desc    Verifies payment and updates user wallet
 */
exports.verifyRazorpayPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id; // Uses req.user._id

    try {
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: "Invalid signature." });
        }

        const orderDetails = await razorpayInstance.orders.fetch(razorpay_order_id);
        const amountInRupees = orderDetails.amount / 100;

        await Payment.create({
            userId: userId,
            razorpay_order_id,
            razorpay_payment_id,
            amount: amountInRupees,
            currency: 'INR',
            status: 'success'
        });

        await WalletTransaction.create({
            userId: userId,
            amount: amountInRupees,
            type: 'credit',
            description: `Wallet Top-Up via Razorpay`
        });

        await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amountInRupees } });

        return res.status(200).json({ message: "Payment verified and wallet updated successfully" });

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: `Error verifying payment: ${error.message}` });
    }
};

/**
 * @desc    Get all payment records for the logged-in user
 */
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 }); // Uses req.user._id
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: "Error fetching payments" });
    }
};

/**
 * @desc    Get a single payment record by ID
 */
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id }); // Uses req.user._id
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: "Error fetching payment" });
    }
};