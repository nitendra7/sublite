const Booking = require('../models/booking');
const User = require('../models/user');
const Service = require('../models/service');
const Payment = require('../models/payment');
const Notification = require('../models/notification');
const { isProviderActive } = require('../utils/availability');
// CHANGED: Import functions from bookingScheduler
const { scheduleBookingCancellation, clearCancellationTimer } = require('../utils/bookingScheduler');

// REMOVED: cancellationTimers and CANCELLATION_WINDOW_MS are now managed by bookingScheduler.js
// const cancellationTimers = new Map();
// const CANCELLATION_WINDOW_MS = 15 * 60 * 1000;


const createBooking = async (req, res) => {
  const { serviceId, paymentMethod = 'wallet' } = req.body;
  const clientId = req.user.id;
  let service;

  try {
    service = await Service.findById(serviceId).populate('providerId');
    const client = await User.findById(clientId);

    if (!service) return res.status(404).json({ message: 'Service not found.' });
    if (service.providerId._id.equals(clientId)) return res.status(400).json({ message: 'You cannot book your own service.' });
    if (service.availableSlots <= 0) return res.status(400).json({ message: 'No available slots for this service.' });
    if (client.walletBalance < service.rentalPrice) return res.status(400).json({ message: 'Insufficient wallet balance.' });

    client.walletBalance -= service.rentalPrice;
    await client.save();

    const payment = await Payment.create({
        userId: clientId,
        providerId: service.providerId._id,
        amount: service.rentalPrice,
        paymentMethod,
        status: 'success',
        type: 'service-payment'
    });

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + service.rentalDuration);

    const booking = await Booking.create({
      clientId,
      providerId: service.providerId._id,
      serviceId,
      paymentId: payment._id,
      bookingDetails: {
        serviceName: service.serviceName,
        rentalPrice: service.rentalPrice,
        startDate: new Date(), // ADDED: startDate to bookingDetails for scheduler
        endDate,
      },
      bookingStatus: 'confirmed',
    });

    service.availableSlots -= 1;
    await service.save();

    // CHANGED: Use the scheduler to set the timer
    scheduleBookingCancellation(booking._id.toString()); 

    await Notification.create({
        userId: service.providerId._id,
        title: 'New Booking!',
        message: `${client.username} has booked your service: ${service.serviceName}. Please send access details within 15 minutes.`,
        type: 'booking',
        relatedId: booking._id
    });

    let responseMessage = 'Booking confirmed! Waiting for provider to send access details.';
    if (!isProviderActive(service.providerId)) {
        responseMessage = 'Booking confirmed! Provider is outside active hours. If no response in 15 mins, you will be refunded.';
    }

    res.status(201).json({ message: responseMessage, booking });

  } catch (err) {
    if(service && service.rentalPrice) {
        await User.findByIdAndUpdate(clientId, { $inc: { walletBalance: service.rentalPrice } });
    }
    res.status(500).json({ message: 'Server error during booking creation.', error: err.message });
  }
};

const sendMessageToBooking = async (req, res) => {
    const { bookingId } = req.params;
    const providerId = req.user.id;

    try {
        const booking = await Booking.findById(bookingId).populate('serviceId');
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        if (booking.providerId.toString() !== providerId) return res.status(403).json({ message: 'Not authorized.' });
        if (booking.bookingStatus !== 'confirmed') return res.status(400).json({ message: 'Booking not in a state to receive messages.' });

        // CHANGED: Use the scheduler to clear the timer
        clearCancellationTimer(bookingId.toString());

        // The check for already cancelled booking might be redundant if clearCancellationTimer always succeeds for valid cases
        // but it's good for robustness if the timer was somehow missed by clearCancellationTimer.
        const freshBooking = await Booking.findById(bookingId);
        if (freshBooking.bookingStatus === 'cancelled') {
            return res.status(400).json({ message: 'This booking was already cancelled due to a timeout.' });
        }
        
        // This 'messages' array is not in your current booking model schema.
        // If you want to store messages directly on the booking, you need to add it to booking.js
        // For now, I'm commenting it out to avoid errors based on provided schemas.
        // If you have a separate Message model, you would create a new message there.
        /*
        booking.messages.push({
            senderId: providerId,
            message: booking.serviceId.accessInstructionsTemplate, // Assuming accessInstructionsTemplate from service
        });
        */
        // If `accessInstructionsTemplate` is just a string to send, you might just send it as part of a notification
        // or a dedicated 'BookingAccess' model.

        booking.sharedCredentials = { // Assuming these fields exist in your booking model
            username: booking.serviceId.credentials.username,
            password: booking.serviceId.credentials.password,
            profileName: booking.serviceId.credentials.profileName,
            accessInstructions: booking.serviceId.accessInstructionsTemplate || "No specific instructions provided." // Add this field to service model if not present
        };

        booking.bookingStatus = 'active';
        await booking.save();

        // Transfer funds from client's wallet to provider's wallet upon activation
        // This was already done on booking creation, ensure you don't double charge/transfer
        // The original logic was: client.walletBalance -= service.rentalPrice on create.
        // Then, await User.findByIdAndUpdate(providerId, { $inc: { walletBalance: booking.bookingDetails.rentalPrice } });
        // This suggests it's a transfer upon activation.
        // Make sure `rentalPrice` is indeed the amount to transfer to provider.
        await User.findByIdAndUpdate(providerId, { $inc: { walletBalance: booking.bookingDetails.rentalPrice } });

        await Notification.create({
            userId: booking.clientId,
            title: 'Access Details Received!',
            message: `The provider has sent access details for your booking: ${booking.bookingDetails.serviceName}.`,
            type: 'booking',
            relatedId: booking._id
        });

        res.status(200).json(booking);

    } catch (err) {
        res.status(500).json({ message: 'Server error while sending message.', error: err.message });
    }
};

// REMOVED: cancelBookingDueToTimeout is now in bookingScheduler.js
/*
async function cancelBookingDueToTimeout(bookingId) {
    try {
        const booking = await Booking.findById(bookingId);
        if (booking && booking.bookingStatus === 'confirmed') {
            booking.bookingStatus = 'cancelled';
            await booking.save();
            cancellationTimers.delete(bookingId.toString());

            await User.findByIdAndUpdate(booking.clientId, { $inc: { walletBalance: booking.bookingDetails.rentalPrice } });
            await Service.findByIdAndUpdate(booking.serviceId, { $inc: { availableSlots: 1 } });

            await Notification.create({ userId: booking.clientId, title: 'Booking Cancelled', message: 'Your booking was cancelled due to a provider timeout and you have been fully refunded.', type: 'booking' });
            await Notification.create({ userId: booking.providerId, title: 'Booking Missed', message: `You did not respond to a booking for ${booking.bookingDetails.serviceName} in time. It has been cancelled.`, type: 'booking' });

            console.log(`Booking ${bookingId} cancelled due to timeout.`);
        }
    } catch (error) {
        console.error(`Error cancelling booking ${bookingId}:`, error);
    }
}
*/

const getAllBookingsForUser = async (req, res) => {
    try {
        const bookings = await Booking.find({ $or: [{ clientId: req.user.id }, { providerId: req.user.id }] })
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMyJoinedBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ clientId: req.user.id })
            .populate('providerId', 'name username')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch your joined subscriptions: ' + err.message });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, $or: [{ clientId: req.user.id }, { providerId: req.user.id }] });
        if (!booking) return res.status(404).json({ error: 'Booking not found or you are not authorized.' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createBooking,
    sendMessageToBooking,
    getAllBookingsForUser,
    getMyJoinedBookings,
    getBookingById
};