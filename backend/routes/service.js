const express = require('express');
const serviceController = require('../controllers/serviceController');

const router = express.Router();

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Protected routes (authentication handled in index.js)
// IMPORTANT: This route must come BEFORE the '/:id' route if using specific path.
router.get('/my-services', serviceController.getMyServices);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;