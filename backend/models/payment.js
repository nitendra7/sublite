const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.ObjectId, ref: 'User' }, // Only for service payments
  bookingId: { type: mongoose.Schema.ObjectId, ref: 'Booking' }, // Only for service payments
  
  type: { // ADDED
    type: String,
    enum: ['wallet-topup', 'service-payment', 'withdrawal', 'refund'],
    required: true
  },

  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  providerAmount: { type: Number }, // Amount credited to provider after fee

  paymentMethod: { type: String, enum: ['wallet', 'razorpay'] },
  transactionId: String, // For external gateway transaction IDs
  gatewayResponse: Object,

  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },

  processedAt: Date
}, { timestamps: true });

paymentSchema.index({ userId: 1 });
paymentSchema.index({ providerId: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;
