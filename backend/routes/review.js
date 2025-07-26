const express = require('express');
const router = express.Router();

// Import controllers
const reviewController = require('../controllers/reviewController');

// Import auth middleware correctly (assuming default export is a function)
const auth = require('../middleware/auth');

// PUBLIC routes
router.get('/', reviewController.getAllReviews);
router.get('/service/:serviceId', reviewController.getReviewsByService);
router.get('/provider/:providerId', reviewController.getReviewsByProvider);
router.get('/:id', reviewController.getReviewById);

// PROTECTED routes (requires authentication)
router.get('/my/reviews', auth, reviewController.getMyReviews);
router.get('/my/reviewable-bookings', auth, reviewController.getReviewableBookings);
router.post('/', auth, reviewController.createReview);
router.put('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);
router.patch('/:id/helpful', auth, reviewController.markHelpful);

module.exports = router;
