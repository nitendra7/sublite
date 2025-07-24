const express = require('express');
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');


const router = express.Router();

// --- Public Routes ---
router.get('/', serviceController.getAllServices);

// --- Protected Routes ---

// IMPORTANT: This route must come BEFORE the '/:id' route
// Get services created by the currently logged-in user
router.get('/my-services', auth, serviceController.getMyServices);

// Create a new service
router.post('/', auth, serviceController.createService);


// --- Routes for a specific service by ID ---

// Get a single service by its ID (can remain public)
router.get('/:id', serviceController.getServiceById);

// Update a service that you own
router.put('/:id', auth, serviceController.updateService);

// Delete a service that you own
router.delete('/:id', auth, serviceController.deleteService);


module.exports = router;