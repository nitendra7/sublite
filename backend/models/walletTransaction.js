const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },

  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: String,

  relatedId: { type: mongoose.Schema.ObjectId },
  relatedType: { type: String, enum: ['booking', 'payment'] },

  balanceBefore: Number,
  balanceAfter: Number,

  createdAt: { type: Date, default: Date.now }
});

walletTransactionSchema.index({ userId: 1 });
walletTransactionSchema.index({ type: 1 });
walletTransactionSchema.index({ relatedType: 1 });
walletTransactionSchema.index({ createdAt: -1 });

const WalletTransaction = mongoose.model("walletTransaction", walletTransactionSchema);
module.exports = WalletTransaction;