const WalletTransaction = require('../models/walletTransaction');

exports.getAllWalletTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWalletTransactionById = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createWalletTransaction = async (req, res) => {
  try {
    const transaction = new WalletTransaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateWalletTransaction = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteWalletTransaction = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    res.json({ message: 'Wallet transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 