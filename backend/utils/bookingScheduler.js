const Booking = require('../models/booking');
const Service = require('../models/service');
const User = require('../models/user');
const Notification = require('../models/notification');

// Define the cancellation window (15 minutes in milliseconds)
// This should match the constant used in bookingController.js for consistency
const CANCELLATION_WINDOW_MS = 15 * 60 * 1000;

// A Map to store active setTimeout timers for booking cancellations
const cancellationTimers = new Map();

/**
 * Handles the automatic cancellation of a booking if the provider
 * fails to send access details within the specified window.
 * Refunds the client and frees up the service slot.
 * @param {string} bookingId - The ID of the booking to potentially cancel.
 */
async function cancelBookingDueToTimeout(bookingId) {
    try {
        const booking = await Booking.findById(bookingId);

        // Only proceed if the booking exists and is still in 'confirmed' status
        if (booking && booking.bookingStatus === 'confirmed') {
            console.log(`Attempting to cancel booking ${bookingId} due to timeout.`);

            // Update booking status
            booking.bookingStatus = 'cancelled';
            await booking.save();

            // Remove the timer from the map (even if it just fired)
            cancellationTimers.delete(bookingId.toString());

            // Refund client's wallet balance
            await User.findByIdAndUpdate(booking.clientId, { $inc: { walletBalance: booking.bookingDetails.rentalPrice } });
            console.log(`Refunded ${booking.bookingDetails.rentalPrice} to client ${booking.clientId} for booking ${bookingId}.`);

            // Increment available slots for the service
            await Service.findByIdAndUpdate(booking.serviceId, { $inc: { availableSlots: 1 } });
            console.log(`Freed up a slot for service ${booking.serviceId} related to booking ${bookingId}.`);

            // Send notifications to client and provider
            await Notification.create({
                userId: booking.clientId,
                title: 'Booking Cancelled',
                message: `Your booking for "${booking.bookingDetails.serviceName}" was cancelled due to the provider not sending access details in time. You have been fully refunded.`,
                type: 'booking',
                relatedId: booking._id
            });
            await Notification.create({
                userId: booking.providerId,
                title: 'Booking Missed',
                message: `You did not send access details for booking "${booking.bookingDetails.serviceName}" (ID: ${bookingId}) within the 15-minute window. The booking has been cancelled and refunded.`,
                type: 'booking',
                relatedId: booking._id
            });

            console.log(`Booking ${bookingId} successfully cancelled due to timeout.`);
        } else if (booking && booking.bookingStatus !== 'confirmed') {
            console.log(`Booking ${bookingId} is no longer in 'confirmed' status. No cancellation needed.`);
            // If the booking is already active/completed/cancelled, clear its timer just in case
            cancellationTimers.delete(bookingId.toString());
        } else {
            console.log(`Booking ${bookingId} not found for timeout cancellation.`);
        }
    } catch (error) {
        console.error(`Error during booking cancellation for ${bookingId}:`, error);
        // Implement robust error handling (e.g., logging, alerting)
    }
}

/**
 * Schedules a cancellation timer for a newly created 'confirmed' booking.
 * This should be called from bookingController.createBooking.
 * @param {string} bookingId - The ID of the new booking.
 */
const scheduleBookingCancellation = (bookingId) => {
    // Clear any existing timer for this booking to prevent duplicates, though unlikely for new bookings
    clearCancellationTimer(bookingId);

    const timerId = setTimeout(() => cancelBookingDueToTimeout(bookingId), CANCELLATION_WINDOW_MS);
    cancellationTimers.set(bookingId, timerId);
    console.log(`Scheduled cancellation timer for booking ${bookingId}. Will fire in ${CANCELLATION_WINDOW_MS / (60 * 1000)} minutes.`);
};

/**
 * Clears the cancellation timer for a booking.
 * This should be called when the provider sends access details.
 * @param {string} bookingId - The ID of the booking whose timer should be cleared.
 */
const clearCancellationTimer = (bookingId) => {
    const timerId = cancellationTimers.get(bookingId);
    if (timerId) {
        clearTimeout(timerId);
        cancellationTimers.delete(bookingId);
        console.log(`Cleared cancellation timer for booking ${bookingId}.`);
    }
};

/**
 * Initializes the scheduler on server startup.
 * - Reschedules timers for 'confirmed' bookings that haven't timed out yet.
 * - Immediately cancels 'confirmed' bookings that have already timed out while the server was down.
 */
const initializeScheduler = async () => {
    console.log('Initializing booking scheduler...');
    try {
        const now = new Date();
        const bookingsToProcess = await Booking.find({
            bookingStatus: 'confirmed',
            'bookingDetails.startDate': { $exists: true } // Ensure startDate exists for calculation
        }).select('_id bookingDetails.startDate'); // Select only necessary fields

        let rescheduledCount = 0;
        let cancelledOverdueCount = 0;

        for (const booking of bookingsToProcess) {
            const bookingStartTime = booking.bookingDetails.startDate.getTime();
            const timeoutTime = bookingStartTime + CANCELLATION_WINDOW_MS;

            if (now.getTime() < timeoutTime) {
                // Booking still within the cancellation window, reschedule timer
                const remainingTime = timeoutTime - now.getTime();
                const timerId = setTimeout(() => cancelBookingDueToTimeout(booking._id.toString()), remainingTime);
                cancellationTimers.set(booking._id.toString(), timerId);
                rescheduledCount++;
                // console.log(`Rescheduled timer for booking ${booking._id}. Remaining: ${remainingTime / 1000}s`);
            } else {
                // Booking has already passed its cancellation window, process immediately
                await cancelBookingDueToTimeout(booking._id.toString());
                cancelledOverdueCount++;
                // console.log(`Immediately processed overdue booking ${booking._id}.`);
            }
        }
        console.log(`Booking scheduler initialized: ${rescheduledCount} timers rescheduled, ${cancelledOverdueCount} overdue bookings processed.`);

    } catch (error) {
        console.error('Error during booking scheduler initialization:', error);
    }
};

module.exports = {
    scheduleBookingCancellation,
    clearCancellationTimer,
    initializeScheduler
};