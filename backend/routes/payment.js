const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);

module.exports = router; 