const express = require('express');
const serviceController = require('../controllers/serviceController');
const router = express.Router();

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Create a new service
router.post('/', serviceController.createService);

// Update a service by ID
router.put('/:id', serviceController.updateService);

// Delete a service by ID
router.delete('/:id', serviceController.deleteService);

module.exports = router; 