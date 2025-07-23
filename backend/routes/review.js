const express = require('express');
const router = express.Router();

// Import controllers
const reviewController = require('../controllers/reviewController');

// Import auth middleware correctly (assuming default export is a function)
const authMiddleware = require('../middleware/authMiddleware');

// PUBLIC routes
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);

// PROTECTED routes (requires authentication)
router.post('/', authMiddleware, reviewController.createReview);
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
