const express = require('express');
const bookingController = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// --- Core Booking Flow ---
// Create a new booking (client action)
router.post('/', auth, bookingController.createBooking);

// Send access details/message to a booking (provider action)
router.post('/:bookingId/messages', auth, bookingController.sendMessageToBooking);


// --- Data Retrieval ---
// Get all bookings for the currently logged-in user (as either client or provider)
router.get('/', auth, bookingController.getAllBookingsForUser);

// Get a single booking by its ID
router.get('/:id', auth, bookingController.getBookingById);

module.exports = router;