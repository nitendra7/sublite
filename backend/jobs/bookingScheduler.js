const cron = require('node-cron');
const Booking = require('../models/booking');
const Notification = require('../models/notification');

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

      // 2. Create a notification for the Client
      await Notification.create({
        userId: booking.clientId._id,
        title: 'Your rental has ended',
        message: `Your rental for "${booking.serviceId.serviceName}" has now been completed. We hope you enjoyed it!`,
        type: 'booking',
        relatedId: booking._id
      });

      // 3. Create a notification for the Provider
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

// This function starts the scheduler
const start = () => {
  // Schedule the task to run once every hour ('0 * * * *')
  cron.schedule('0 * * * *', completeExpiredBookings);
  console.log('✅ Booking completion scheduler has been started.');
};

module.exports = { start };