const express = require('express');
const serviceController = require('../controllers/serviceController');
const router = express.Router();

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

module.exports = router; 