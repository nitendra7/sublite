const { User } = require('../models/user');
const Payment = require('../models/payment');
const WalletTransaction = require('../models/walletTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

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
    const userId = req.user?._id; // Uses req.user._id

    try {
        console.log("[VerifyPayment] userId:", userId, "order_id:", razorpay_order_id, "payment_id:", razorpay_payment_id);

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        console.log("[VerifyPayment] Expected signature:", expectedSign, "Provided signature:", razorpay_signature);

        if (razorpay_signature !== expectedSign) {
            console.warn("[VerifyPayment] Invalid signature for user", userId);
            return res.status(400).json({ message: "Invalid signature." });
        }

        // Simplified: Fetch order details with error handling
        let orderDetails;
        try {
            orderDetails = await razorpayInstance.orders.fetch(razorpay_order_id);
            console.log("[VerifyPayment] Fetched order details:", orderDetails);
        } catch (err) {
            console.error("[VerifyPayment] Error fetching order details from Razorpay:", {
                errorMessage: err.message,
                errorStack: err.stack,
                razorpay_order_id,
                step: "Razorpay order fetch"
            });
            return res.status(502).json({ message: "Error fetching order details from Razorpay", error: err.message });
        }

        const amountInRupees = orderDetails.amount / 100;

        // Simplified: Single try block for DB operations, let errors bubble to outer catch
        await Payment.create({
            userId: userId,
            razorpay_order_id,
            razorpay_payment_id,
            amount: amountInRupees,
            currency: 'INR',
            status: 'success'
        });
        console.log("[VerifyPayment] Payment record created.");

        await WalletTransaction.create({
            userId: userId,
            amount: amountInRupees,
            type: 'credit',
            description: `Wallet Top-Up via Razorpay`
        });
        console.log("[VerifyPayment] WalletTransaction record created.");

        await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amountInRupees } });
        console.log("[VerifyPayment] User wallet balance updated.");

        return res.status(200).json({ message: "Payment verified and wallet updated successfully" });

    } catch (error) {
        console.error("[VerifyPayment] Error verifying payment:", {
            errorMessage: error.message,
            errorStack: error.stack,
            requestBody: req.body,
            userId: userId,
            step: "See previous logs for step context"
        });
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