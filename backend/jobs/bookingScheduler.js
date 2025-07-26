const cron = require('node-cron');
const Booking = require('../models/booking');
const Notification = require('../models/notification');
const { User } = require('../models/user');
const Service = require('../models/service');
const WalletTransaction = require('../models/walletTransaction');

// Store timeout references for booking cancellations
const bookingTimeouts = new Map();

// This function contains the logic for the scheduled task
const completeExpiredBookings = async () => {
  console.log('Running cron job: Checking for expired bookings...');
  try {
    const now = new Date();
    
    // Find all 'active' bookings where the end date is in the past
    const expiredBookings = await Booking.find({
      bookingStatus: 'active',
      endDate: { $lt: now }
    }).populate('clientId providerId serviceId'); // Populate for notification details

    if (expiredBookings.length === 0) {
      console.log('No expired bookings found.');
      return;
    }

    console.log(`Found ${expiredBookings.length} expired bookings to process.`);

    for (const booking of expiredBookings) {
      // 1. Update the booking status to 'completed'
      booking.bookingStatus = 'completed';
      booking.completedAt = now;
      await booking.save();

      // 2. Restore available slots to the service
      await Service.findByIdAndUpdate(booking.serviceId._id, {
        $inc: { availableSlots: 1 }
      });

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

    console.log('Successfully processed all expired bookings.');

  } catch (error) {
    console.error('Error running the expired bookings cron job:', error);
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
      console.log(`Attempting to cancel booking ${bookingId} due to timeout...`);
      
      const booking = await Booking.findById(bookingId).populate('serviceId clientId');
      
      if (!booking) {
        console.log(`Booking ${bookingId} not found for cancellation.`);
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
        
        // Restore available slots to the service
        await Service.findByIdAndUpdate(booking.serviceId._id, {
          $inc: { availableSlots: 1 }
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
        
        console.log(`Successfully cancelled booking ${bookingId} due to timeout.`);
      } else {
        console.log(`Booking ${bookingId} status is ${booking.bookingStatus}, no action needed.`);
      }
      
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
    } finally {
      // Clean up the timeout reference
      bookingTimeouts.delete(bookingId);
    }
  }, 15 * 60 * 1000); // 15 minutes
  
  // Store the timeout reference
  bookingTimeouts.set(bookingId, timeoutId);
  console.log(`Scheduled cancellation for booking ${bookingId} in 15 minutes.`);
};

/**
 * Clear the cancellation timeout for a booking (when provider responds)
 * @param {string} bookingId - The booking ID to clear timeout for
 */
const clearCancellationTimer = (bookingId) => {
  if (bookingTimeouts.has(bookingId)) {
    clearTimeout(bookingTimeouts.get(bookingId));
    bookingTimeouts.delete(bookingId);
    console.log(`Cleared cancellation timeout for booking ${bookingId}.`);
  }
};

// This function starts the scheduler
const start = () => {
  // Schedule the task to run once every hour ('0 * * * *')
  cron.schedule('0 * * * *', completeExpiredBookings);
  console.log('✅ Booking completion scheduler has been started.');
};

module.exports = { 
  start, 
  scheduleBookingCancellation, 
  clearCancellationTimer 
};
