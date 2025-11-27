const WalletTransaction = require('../models/walletTransaction');
const { User } = require('../models/user');

exports.getAllWalletTransactions = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const transactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 });
    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getWalletTransactionById = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const transaction = await WalletTransaction.findOne({ _id: req.params.id, userId });
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    return res.json(transaction);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.createWalletTransaction = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { amount, description, type } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ message: 'Invalid amount' });
    if (!['credit', 'debit'].includes(type)) return res.status(400).json({ message: 'Invalid type' });

    const transaction = await WalletTransaction.create({
      userId,
      amount,
      description,
      type
    });

    const incAmount = type === 'credit' ? amount : -amount;
    await User.findByIdAndUpdate(userId, { $inc: { walletBalance: incAmount } });

    return res.status(201).json(transaction);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.updateWalletTransaction = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const transaction = await WalletTransaction.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    return res.json(transaction);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.deleteWalletTransaction = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const transaction = await WalletTransaction.findOneAndDelete({
      _id: req.params.id,
      userId
    });
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    return res.json({ message: 'Wallet transaction deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
