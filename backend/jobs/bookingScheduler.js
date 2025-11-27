const cron = require('node-cron');
const Booking = require('../models/booking');
const Notification = require('../models/notification');
const { User } = require('../models/user');
const Service = require('../models/service');
const WalletTransaction = require('../models/walletTransaction');
const logger = require('../utils/logger');

// Store timeout references for booking cancellations
const bookingTimeouts = new Map();

// This function contains the logic for the scheduled task
const completeExpiredBookings = async () => {
  logger.info('Running cron job: Checking for expired bookings...');
  try {
    const now = new Date();
    const fifteenMinsAgo = new Date(now - 15 * 60 * 1000);

    // Find all 'active' bookings where the end date is in the past
    const expiredActiveBookings = await Booking.find({
      bookingStatus: 'active',
      endDate: { $lt: now }
    }).populate('clientId providerId serviceId');

    // Find pending bookings older than 15 minutes (timeout cancellation)
    const expiredPendingBookings = await Booking.find({
      bookingStatus: 'pending',
      createdAt: { $lt: fifteenMinsAgo }
    }).populate('serviceId clientId'); // Populate for notification details

    if (expiredActiveBookings.length === 0 && expiredPendingBookings.length === 0) {
      logger.info('No expired bookings found');
      return;
    }

    logger.info(`Found ${expiredActiveBookings.length} expired active bookings and ${expiredPendingBookings.length} expired pending bookings to process`);

    // Process expired active bookings (mark as completed)
    for (const booking of expiredActiveBookings) {
      // 1. Update the booking status to 'completed'
      booking.bookingStatus = 'completed';
      booking.completedAt = now;
      await booking.save();

      // 2. Decrement currentUsers when booking completes (frees up a slot)
      const serviceDoc = await Service.findById(booking.serviceId._id);
      serviceDoc.currentUsers -= 1;
      // availableSlots will be recalculated by pre-save hook
      await serviceDoc.save();

      // 3. Create a notification for the Client
      await Notification.create({
        userId: booking.clientId._id,
        title: 'Your rental has ended',
        message: `Your rental for "${booking.serviceId.serviceName}" has now been completed. We hope you enjoyed it!`,
        type: 'booking',
        relatedId: booking._id
      });

      // 4. Create a notification for the Provider
      await Notification.create({
        userId: booking.providerId._id,
        title: 'A rental has been completed',
        message: `The rental for "${booking.serviceId.serviceName}" with client ${booking.clientId.username} has ended. Please remember to change your service PIN or password to secure your account.`,
        type: 'booking',
        relatedId: booking._id
      });
    }

    // Process expired pending bookings (cancel and refund)
    for (const booking of expiredPendingBookings) {
      if (!booking.clientId || !booking.serviceId) {
        logger.warn(`Skipping booking ${booking._id}: missing clientId or serviceId`);
        continue;
      }

      // Update booking status to cancelled
      booking.bookingStatus = 'cancelled';
      booking.cancelledAt = now;
      booking.cancellationReason = 'Provider timeout - no response within 15 minutes';
      await booking.save();

      // Refund the client
      await User.findByIdAndUpdate(booking.clientId._id, {
        $inc: { walletBalance: booking.bookingDetails.rentalPrice }
      });

      // Create refund transaction record
      await WalletTransaction.create({
        userId: booking.clientId._id,
        amount: booking.bookingDetails.rentalPrice,
        type: 'credit',
        description: `Refund for cancelled booking: ${booking.serviceId.serviceName}`,
        relatedId: booking._id,
        relatedType: 'booking'
      });

      // Notify the client about the cancellation and refund
      await Notification.create({
        userId: booking.clientId._id,
        title: 'Booking Cancelled - Refund Processed',
        message: `Your booking for "${booking.serviceId.serviceName}" was cancelled because the provider didn't respond within 15 minutes. You have been refunded ₹${booking.bookingDetails.rentalPrice}.`,
        type: 'booking',
        relatedId: booking._id
      });

      // Notify the provider about the missed booking
      await Notification.create({
        userId: booking.providerId,
        title: 'Booking Cancelled Due to Timeout',
        message: `Your booking for "${booking.serviceId.serviceName}" was cancelled because you didn't respond within 15 minutes. The client has been refunded.`,
        type: 'booking',
        relatedId: booking._id
      });
    }

    logger.info('Successfully processed all expired bookings');

  } catch (error) {
    logger.error('Error running the expired bookings cron job:', error);
  }
};

/**
 * Schedule a booking for automatic cancellation if provider doesn't respond within 15 minutes
 * @param {string} bookingId - The booking ID to cancel
 */
const scheduleBookingCancellation = (bookingId) => {
  // Clear any existing timeout for this booking
  if (bookingTimeouts.has(bookingId)) {
    clearTimeout(bookingTimeouts.get(bookingId));
  }

  // Set a new timeout for 15 minutes (900,000 milliseconds)
  const timeoutId = setTimeout(async () => {
    try {
      logger.info(`Attempting to cancel booking ${bookingId} due to timeout`);

      const booking = await Booking.findById(bookingId).populate('serviceId clientId');

      if (!booking) {
        logger.warn(`Booking ${bookingId} not found for cancellation`);
        return;
      }

      // Only cancel if booking is still in 'pending' status
      if (booking.bookingStatus === 'pending') {
        // Update booking status to cancelled
        booking.bookingStatus = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancellationReason = 'Provider timeout - no response within 15 minutes';
        await booking.save();

        // Refund the client
        await User.findByIdAndUpdate(booking.clientId._id, {
          $inc: { walletBalance: booking.bookingDetails.rentalPrice }
        });

        // Create refund transaction record
        await WalletTransaction.create({
          userId: booking.clientId._id,
          amount: booking.bookingDetails.rentalPrice,
          type: 'credit',
          description: `Refund for cancelled booking: ${booking.serviceId.serviceName}`,
          relatedId: booking._id,
          relatedType: 'booking'
        });

        // Note: No need to restore slots since booking was cancelled before becoming active
        // (currentUsers was never incremented for this booking)

        // Notify the client about the cancellation and refund
        await Notification.create({
          userId: booking.clientId._id,
          title: 'Booking Cancelled - Refund Processed',
          message: `Your booking for "${booking.serviceId.serviceName}" was cancelled because the provider didn't respond within 15 minutes. You have been refunded ₹${booking.bookingDetails.rentalPrice}.`,
          type: 'booking',
          relatedId: booking._id
        });

        // Notify the provider about the missed booking
        await Notification.create({
          userId: booking.providerId,
          title: 'Booking Cancelled Due to Timeout',
          message: `Your booking for "${booking.serviceId.serviceName}" was cancelled because you didn't respond within 15 minutes. The client has been refunded.`,
          type: 'booking',
          relatedId: booking._id
        });

        logger.info(`Successfully cancelled booking ${bookingId} due to timeout`);
      } else {
        logger.info(`Booking ${bookingId} status is ${booking.bookingStatus}, no action needed`);
      }

    } catch (error) {
      logger.error(`Error cancelling booking ${bookingId}:`, error);
    } finally {
      // Clean up the timeout reference
      bookingTimeouts.delete(bookingId);
    }
  }, 15 * 60 * 1000); // 15 minutes

  // Store the timeout reference
  bookingTimeouts.set(bookingId, timeoutId);
  logger.info(`Scheduled cancellation for booking ${bookingId} in 15 minutes`);
};

/**
 * Clear the cancellation timeout for a booking (when provider responds)
 * @param {string} bookingId - The booking ID to clear timeout for
 */
const clearCancellationTimer = (bookingId) => {
  if (bookingTimeouts.has(bookingId)) {
    clearTimeout(bookingTimeouts.get(bookingId));
    bookingTimeouts.delete(bookingId);
    logger.info(`Cleared cancellation timeout for booking ${bookingId}`);
  }
};

// This function starts the scheduler
const start = () => {
  cron.schedule('0 * * * *', completeExpiredBookings);
  logger.info('Booking completion scheduler has been started');
};

module.exports = {
  start,
  scheduleBookingCancellation,
  clearCancellationTimer
};
