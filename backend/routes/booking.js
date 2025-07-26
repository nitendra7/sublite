const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createBooking,
    sendMessageToBooking,
    getAllBookingsForUser,
    getBookingById,
    getMyJoinedBookings,
    confirmBooking
} = require('../controllers/bookingController');

// Debug endpoint to test controller import
router.get('/debug', (req, res) => {
    res.json({
        message: 'Booking controller is working',
        timestamp: new Date().toISOString(),
        environment: {
            nodeEnv: process.env.NODE_ENV,
            hasAccessTokenSecret: !!process.env.ACCESS_TOKEN_SECRET,
            hasMongoUri: !!process.env.MONGODB_URI
        }
    });
});

// Create a new booking
router.post('/', auth, createBooking);

// Get all bookings where the user is either the provider or client
router.get('/all', auth, getAllBookingsForUser);

// Get only the bookings the user has JOINED  
router.get('/my-bookings', auth, getMyJoinedBookings);
router.get('/my-joined', auth, getMyJoinedBookings);

// Get a single booking by its ID
router.get('/:id', auth, getBookingById);

// Provider sends access details for a specific booking
router.post('/:bookingId/send-message', auth, sendMessageToBooking);

// Confirm a booking (mark as confirmed)
router.patch('/:id/confirm', auth, confirmBooking);

module.exports = router;