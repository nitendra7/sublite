const express = require('express');
const walletTransactionController = require('../controllers/walletTransactionController');
const auth = require('../middleware/auth');
const router = express.Router();

// All wallet transaction routes require authentication
router.get('/', auth, walletTransactionController.getAllWalletTransactions);
router.get('/:id', auth, walletTransactionController.getWalletTransactionById);
router.post('/', auth, walletTransactionController.createWalletTransaction);
router.put('/:id', auth, walletTransactionController.updateWalletTransaction);
router.delete('/:id', auth, walletTransactionController.deleteWalletTransaction);

module.exports = router;
