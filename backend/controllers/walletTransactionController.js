const WalletTransaction = require('../models/walletTransaction');
const User = require('../models/user'); // You'll need the User model to update balances

// GET all transactions for the logged-in user
exports.getAllWalletTransactions = async (req, res) => {
  try {
    // Only find transactions belonging to the currently authenticated user
    const transactions = await WalletTransaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET a single transaction by ID, ensuring it belongs to the logged-in user
exports.getWalletTransactionById = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findOne({ _id: req.params.id, userId: req.user.id });
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

    // **THE FIX**: Add the userId from the authenticated user (`req.user`)
    const transaction = new WalletTransaction({
      userId: req.user.id,
      amount,
      description,
      type
    });
    
    await transaction.save();

    // Also, update the user's wallet balance after a successful transaction
    if (type === 'credit') {
        await User.findByIdAndUpdate(req.user.id, { $inc: { walletBalance: amount } });
    } else if (type === 'debit') {
        await User.findByIdAndUpdate(req.user.id, { $inc: { walletBalance: -amount } });
    }

    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE a transaction (generally not recommended for financial records)
// Note: It's often better to create a new, counter-transaction than to update an existing one.
exports.updateWalletTransaction = async (req, res) => {
  try {
    // Ensure the transaction being updated belongs to the logged-in user
    const transaction = await WalletTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
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
    // Ensure the transaction being deleted belongs to the logged-in user
    const transaction = await WalletTransaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!transaction) return res.status(404).json({ error: 'Wallet transaction not found' });
    // You would also need logic here to reverse the change to the user's walletBalance
    res.json({ message: 'Wallet transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};