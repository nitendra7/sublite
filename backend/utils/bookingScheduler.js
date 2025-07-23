const Booking = require('../models/booking');
const Service = require('../models/service');
const User = require('../models/user');
const Notification = require('../models/notification');

// Cancellation window (15 minutes)
const CANCELLATION_WINDOW_MS = 15 * 60 * 1000;
// Map to store active cancellation timers by bookingId
const cancellationTimers = new Map();

/**
 * Automatically cancels a booking if provider fails to send access details within window.
 * Refunds client wallet and frees service slot.
 * @param {string} bookingId
 */
async function cancelBookingDueToTimeout(bookingId) {
  try {
    const booking = await Booking.findById(bookingId);

    if (booking && booking.bookingStatus === 'confirmed') {
      console.log(`Attempting to cancel booking ${bookingId} due to timeout.`);

      booking.bookingStatus = 'cancelled';

      // Defensive: keep paymentId intact if exists to avoid validation errors
      if (!booking.paymentId) {
        console.warn(`Booking ${bookingId} has no paymentId set, proceeding with cancellation.`);
      }

      await booking.save();

      // Remove timer after cancellation
      cancellationTimers.delete(bookingId.toString());

      // Refund client's wallet (using bookingDetails.rentalPrice)
      await User.findByIdAndUpdate(
        booking.clientId,
        { $inc: { walletBalance: booking.bookingDetails.rentalPrice } }
      );
      console.log(`Refunded ${booking.bookingDetails.rentalPrice} to client ${booking.clientId} for booking ${bookingId}.`);

      // Increment available slots for the booked service
      await Service.findByIdAndUpdate(
        booking.serviceId,
        { $inc: { availableSlots: 1 } }
      );
      console.log(`Freed up a slot for service ${booking.serviceId} related to booking ${bookingId}.`);

      // Send cancellation notifications to client and provider
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
      cancellationTimers.delete(bookingId.toString());
    } else {
      console.log(`Booking ${bookingId} not found for timeout cancellation.`);
    }

  } catch (error) {
    console.error(`Error during booking cancellation for ${bookingId}:`, error);
  }
}

/**
 * Schedules a cancellation timer for a new 'confirmed' booking.
 * @param {string} bookingId
 */
const scheduleBookingCancellation = (bookingId) => {
  clearCancellationTimer(bookingId);

  const timerId = setTimeout(() => cancelBookingDueToTimeout(bookingId), CANCELLATION_WINDOW_MS);
  cancellationTimers.set(bookingId, timerId);
  console.log(`Scheduled cancellation timer for booking ${bookingId}. Will fire in ${CANCELLATION_WINDOW_MS / (60 * 1000)} minutes.`);
};

/**
 * Clears the cancellation timer for a booking.
 * @param {string} bookingId
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
 * Reschedules timers for 'confirmed' bookings that have not timed out,
 * and immediately cancels those overdue.
 */
const initializeScheduler = async () => {
  console.log('Initializing booking scheduler...');
  try {
    const now = new Date();

    const bookingsToProcess = await Booking.find({
      bookingStatus: 'confirmed',
      'bookingDetails.startDate': { $exists: true }
    }).select('_id bookingDetails.startDate');

    let rescheduledCount = 0;
    let cancelledOverdueCount = 0;

    for (const booking of bookingsToProcess) {
      const bookingStartTime = booking.bookingDetails.startDate.getTime();
      const timeoutTime = bookingStartTime + CANCELLATION_WINDOW_MS;

      if (now.getTime() < timeoutTime) {
        // Within cancellation window, reschedule timer
        const remainingTime = timeoutTime - now.getTime();
        const timerId = setTimeout(() => cancelBookingDueToTimeout(booking._id.toString()), remainingTime);
        cancellationTimers.set(booking._id.toString(), timerId);
        rescheduledCount++;
      } else {
        // Timeout passed, cancel immediately
        await cancelBookingDueToTimeout(booking._id.toString());
        cancelledOverdueCount++;
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
