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
        console.log("[VerifyPayment] Starting verification - req.user details:", {
            userId,
            userExists: !!req.user,
            fullUser: req.user
        });
        console.log("[VerifyPayment] Request body:", req.body, "order_id:", razorpay_order_id, "payment_id:", razorpay_payment_id);

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        console.log("[VerifyPayment] Signature verification - Expected:", expectedSign, "Provided:", razorpay_signature);

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
        console.log("[VerifyPayment] Calculated amount:", amountInRupees, "from order.amount:", orderDetails.amount);

        // Simplified: Single try block for DB operations, let errors bubble to outer catch
        console.log("[VerifyPayment] Attempting Payment.create with data:", {
            userId,
            type: 'wallet-topup',
            transactionId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: amountInRupees,
            paymentMethod: 'razorpay',
            status: 'success'
        });
        const newPayment = await Payment.create({
            userId: userId,
            type: 'wallet-topup',
            transactionId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: amountInRupees,
            paymentMethod: 'razorpay',
            status: 'success'
        });
        console.log("[VerifyPayment] Payment record created successfully:", newPayment._id);

        console.log("[VerifyPayment] Attempting WalletTransaction.create with data:", {
            userId,
            amount: amountInRupees,
            type: 'credit',
            description: `Wallet Top-Up via Razorpay (Order: ${razorpay_order_id})`,
            relatedId: newPayment._id,
            relatedType: 'payment'
        });
        const newWalletTransaction = await WalletTransaction.create({
            userId: userId,
            amount: amountInRupees,
            type: 'credit',
            description: `Wallet Top-Up via Razorpay (Order: ${razorpay_order_id})`,
            relatedId: newPayment._id,
            relatedType: 'payment'
        });
        console.log("[VerifyPayment] WalletTransaction record created successfully:", newWalletTransaction._id);

        console.log("[VerifyPayment] Attempting User.update - Current wallet balance before increment.");
        const updateResult = await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amountInRupees } }, { new: true });
        console.log("[VerifyPayment] User wallet balance updated successfully. New balance:", updateResult?.walletBalance);

        return res.status(200).json({ message: "Payment verified and wallet updated successfully", newBalance: updateResult?.walletBalance });

    } catch (error) {
        console.error("[VerifyPayment] Unexpected error during verification:", {
            errorMessage: error.message,
            errorStack: error.stack,
            errorCode: error.code,
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