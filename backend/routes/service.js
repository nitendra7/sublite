const express = require('express');
const serviceController = require('../controllers/serviceController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// --- Public Routes ---
// Get all active and available services
router.get('/', serviceController.getAllServices);

// Get a single service by its ID
router.get('/:id', serviceController.getServiceById);


// --- Protected Routes (for logged-in users/providers) ---
// Create a new service
router.post('/', auth, serviceController.createService);

// Update a service that you own
router.put('/:id', auth, serviceController.updateService);

module.exports = router;