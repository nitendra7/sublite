const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createBooking,
    sendMessageToBooking,
    getAllBookingsForUser,
    getBookingById,
    getMyJoinedBookings
} = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

// Create a new booking
router.post('/', auth, createBooking);

// Get all bookings where the user is either the provider or client
router.get('/all', auth, getAllBookingsForUser);

// Get only the bookings the user has JOINED
router.get('/my-bookings', auth, getMyJoinedBookings);

// Get a single booking by its ID
router.get('/:id', auth, getBookingById);

// Provider sends access details for a specific booking
router.post('/:bookingId/send-message', auth, sendMessageToBooking);

module.exports = router;