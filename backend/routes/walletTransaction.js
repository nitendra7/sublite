const express = require('express');
const walletTransactionController = require('../controllers/walletTransactionController');
const router = express.Router();

router.get('/', walletTransactionController.getAllWalletTransactions);
router.get('/:id', walletTransactionController.getWalletTransactionById);
router.post('/', walletTransactionController.createWalletTransaction);

module.exports = router; 