// PUBLIC
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);

// PROTECTED
router.post('/', authMiddleware, reviewController.createReview);
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);