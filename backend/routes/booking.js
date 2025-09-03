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

router.post('/', auth, createBooking);

router.get('/all', auth, getAllBookingsForUser);

router.get('/my-bookings', auth, getMyJoinedBookings);
router.get('/my-joined', auth, getMyJoinedBookings);

router.get('/:id', auth, getBookingById);

router.post('/:bookingId/send-message', auth, sendMessageToBooking);

router.patch('/:id/confirm', auth, confirmBooking);

module.exports = router;