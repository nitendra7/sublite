const Booking = require('../models/booking');
const User = require('../models/user');
const Service = require('../models/service');
const Payment = require('../models/payment');
const Notification = require('../models/notification');
const { isProviderActive } = require('../utils/availability');
const { scheduleBookingCancellation, clearCancellationTimer } = require('../utils/bookingScheduler');

// All routes here are assumed to be protected by isAuthenticated middleware in index.js.

const createBooking = async (req, res) => {
  const { serviceId, paymentMethod = 'wallet' } = req.body;
  const clientId = req.user._id; // Uses req.user._id
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
        startDate: new Date(),
        endDate,
      },
      bookingStatus: 'confirmed',
    });

    service.availableSlots -= 1;
    await service.save();

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
    const providerId = req.user._id; // Uses req.user._id

    try {
        const booking = await Booking.findById(bookingId).populate('serviceId');
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        if (booking.providerId.toString() !== providerId) return res.status(403).json({ message: 'Not authorized.' });
        if (booking.bookingStatus !== 'confirmed') return res.status(400).json({ message: 'Booking not in a state to receive messages.' });

        clearCancellationTimer(bookingId.toString());

        const freshBooking = await Booking.findById(bookingId);
        if (freshBooking.bookingStatus === 'cancelled') {
            return res.status(400).json({ message: 'This booking was already cancelled due to a timeout.' });
        }

        booking.sharedCredentials = {
            username: booking.serviceId.credentials.username,
            password: booking.serviceId.credentials.password,
            profileName: booking.serviceId.credentials.profileName,
            accessInstructions: booking.serviceId.accessInstructionsTemplate || "No specific instructions provided."
        };

        booking.bookingStatus = 'active';
        await booking.save();

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

const getAllBookingsForUser = async (req, res) => {
    try {
        const bookings = await Booking.find({ $or: [{ clientId: req.user._id }, { providerId: req.user._id }] }) // Uses req.user._id
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMyJoinedBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ clientId: req.user._id }) // Uses req.user._id
            .populate('providerId', 'name username')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch your joined subscriptions: ' + err.message });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, $or: [{ clientId: req.user._id }, { providerId: req.user._id }] }); // Uses req.user._id
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