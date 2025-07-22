const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth'); // Import your auth middleware
const router = express.Router();

// NEW ROUTE for wallet payments
router.post('/pay-from-wallet', authMiddleware, bookingController.createBookingFromWallet);


// --- Your Existing Routes (now secured) ---
router.get('/', authMiddleware, bookingController.getAllBookings);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.post('/', authMiddleware, bookingController.createBooking); // Should be admin-only?
router.put('/:id', authMiddleware, bookingController.updateBooking);
router.delete('/:id', authMiddleware, bookingController.deleteBooking);

module.exports = router;