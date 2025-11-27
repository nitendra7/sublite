const { User } = require('../models/user');
const Payment = require('../models/payment');
const WalletTransaction = require('../models/walletTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }
  try {
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: crypto.randomBytes(10).toString('hex')
    };
    const order = await razorpayInstance.orders.create(options);
    return res.json(order);
  } catch (err) {
    console.error('createRazorpayOrder error', err);
    return res.status(500).json({ message: 'Error creating Razorpay order' });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing payment fields' });
  }

  try {
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    let orderDetails;
    try {
      orderDetails = await razorpayInstance.orders.fetch(razorpay_order_id);
    } catch (err) {
      console.error('Razorpay fetch error', { err, razorpay_order_id });
      return res.status(502).json({ message: 'Error fetching order details from Razorpay' });
    }

    const amountInRupees = (orderDetails.amount || 0) / 100;

    const newPayment = await Payment.create({
      userId,
      type: 'wallet-topup',
      transactionId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: amountInRupees,
      paymentMethod: 'razorpay',
      status: 'success'
    });

    const newWalletTransaction = await WalletTransaction.create({
      userId,
      amount: amountInRupees,
      type: 'credit',
      description: `Wallet Top-Up via Razorpay (Order: ${razorpay_order_id})`,
      relatedId: newPayment._id,
      relatedType: 'payment'
    });

    const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amountInRupees } }, { new: true });

    return res.status(200).json({
      message: 'Payment verified and wallet updated successfully',
      paymentId: newPayment._id,
      walletTransactionId: newWalletTransaction._id,
      newBalance: updatedUser ? updatedUser.walletBalance : undefined
    });
  } catch (err) {
    console.error('verifyRazorpayPayment unexpected error', { err, body: req.body, userId });
    return res.status(500).json({ message: 'Error verifying payment' });
  }
};

exports.getAllPayments = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    return res.json(payments);
  } catch (err) {
    console.error('getAllPayments error', err);
    return res.status(500).json({ message: 'Error fetching payments' });
  }
};

exports.getPaymentById = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Missing payment id' });
  try {
    const payment = await Payment.findOne({ _id: id, userId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    return res.json(payment);
  } catch (err) {
    console.error('getPaymentById error', { err, id, userId });
    return res.status(500).json({ message: 'Error fetching payment' });
  }
};
