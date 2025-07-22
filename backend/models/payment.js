const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  
  bookingId: { type: mongoose.Schema.ObjectId, ref: 'Booking' },
  providerId: { type: mongoose.Schema.ObjectId, ref: 'User' },

  amount: { type: Number, required: true },
  platformFee: Number,
  providerAmount: Number,

  paymentMethod: { type: String, enum: ['wallet', 'card', 'upi', 'razorpay'] },
  transactionId: String,
  gatewayResponse: Object,

  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now },
  processedAt: Date
});

paymentSchema.index({ userId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ providerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;