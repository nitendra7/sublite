const express = require('express');
const router = express.Router();
const {
    createBooking,
    sendMessageToBooking,
    getAllBookingsForUser,
    getBookingById,
    getMyJoinedBookings
} = require('../controllers/bookingController');

// All routes here are assumed to be protected by isAuthenticated middleware in index.js

router.post('/', createBooking);
router.get('/all', getAllBookingsForUser);
router.get('/my-bookings', getMyJoinedBookings);
router.get('/:id', getBookingById);
router.post('/:bookingId/send-message', sendMessageToBooking);

module.exports = router;