const WalletTransaction = require('../models/walletTransaction');
const { User } = require('../models/user');

// All routes here are assumed to be protected by isAuthenticated middleware in index.js.

// GET all transactions for the logged-in user
exports.getAllWalletTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET a single transaction by ID, ensuring it belongs to the logged-in user
exports.getWalletTransactionById = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findOne({ _id: req.params.id, userId: req.user._id }); // Uses req.user._id
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE a new wallet transaction
exports.createWalletTransaction = async (req, res) => {
  try {
    const { amount, description, type } = req.body;

    const transaction = new WalletTransaction({
      userId: req.user._id, // Uses req.user._id for association
      amount,
      description,
      type
    });

    await transaction.save();

    if (type === 'credit') {
        await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: amount } }); // Uses req.user._id
    } else if (type === 'debit') {
        await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: -amount } }); // Uses req.user._id
    }

    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE a transaction (generally not recommended for financial records)
exports.updateWalletTransaction = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // Uses req.user._id
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE a transaction (also generally not recommended)
exports.deleteWalletTransaction = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); // Uses req.user._id
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    res.json({ message: 'Wallet transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};