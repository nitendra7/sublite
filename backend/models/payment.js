const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.ObjectId, ref: 'Booking', required: true },
  clientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },

  amount: { type: Number, required: true },
  platformFee: Number,
  providerAmount: Number,

  paymentMethod: { type: String, enum: ['wallet', 'card', 'upi'], required: true },
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

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ clientId: 1 });
paymentSchema.index({ providerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;