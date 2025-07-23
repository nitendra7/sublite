const express = require('express');
const router = express.Router();

// Import controllers
const reviewController = require('../controllers/reviewController');

// Import auth middleware correctly (assuming default export is a function)
const auth = require('../middleware/auth');

// PUBLIC routes
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);

// PROTECTED routes (requires authentication)
router.post('/', auth, reviewController.createReview);
router.put('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
