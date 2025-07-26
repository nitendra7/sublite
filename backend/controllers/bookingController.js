const Booking = require('../models/booking');
const { User } = require('../models/user');
const Service = require('../models/service');
const Payment = require('../models/payment');
const Notification = require('../models/notification');
const WalletTransaction = require('../models/walletTransaction'); // Added WalletTransaction import
const { isProviderActive } = require('../utils/availability');
const { scheduleBookingCancellation, clearCancellationTimer } = require('../jobs/bookingScheduler');

// All routes here are assumed to be protected by isAuthenticated middleware in index.js.

const createBooking = async (req, res) => {
  const { serviceId, rentalDuration, paymentMethod = 'wallet' } = req.body;
  const clientId = req.user._id; // Uses req.user._id
  let service;
  let totalCost = 0;

  try {
    service = await Service.findById(serviceId).populate('providerId');
    const client = await User.findById(clientId);

    if (!service) return res.status(404).json({ message: 'Service not found.' });
    if (!rentalDuration || rentalDuration < 1) return res.status(400).json({ message: 'Valid rental duration is required.' });
    if (service.providerId._id.equals(clientId)) return res.status(400).json({ message: 'You cannot book your own service.' });
    if (service.availableSlots <= 0) return res.status(400).json({ message: 'No available slots for this service.' });
    
    // Calculate total cost based on rental duration (daily rate)
    const dailyRate = service.rentalPrice / 30; // Assuming rentalPrice is monthly, convert to daily
    totalCost = Math.ceil(dailyRate * rentalDuration);
    
    if (client.walletBalance < totalCost) return res.status(400).json({ message: 'Insufficient wallet balance.' });

    client.walletBalance -= totalCost;
    await client.save();

    await WalletTransaction.create({
      userId: clientId,
      amount: totalCost,
      type: 'debit',
      description: `Booking for service: ${service.serviceName}`,
      relatedId: service._id,
      relatedType: 'booking'
    });

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + rentalDuration);

    // 1. Create the booking (without paymentId)
    const booking = await Booking.create({
      clientId,
      providerId: service.providerId._id,
      serviceId,
      bookingDetails: {
        serviceName: service.serviceName,
        rentalPrice: totalCost,
        rentalDuration: rentalDuration,
        startDate: new Date(),
        endDate,
      },
      bookingStatus: 'confirmed',
    });

    // 2. Create the payment with bookingId
    const payment = await Payment.create({
        userId: clientId,
        providerId: service.providerId._id,
        bookingId: booking._id,
        amount: totalCost,
        paymentMethod,
        status: 'success',
        type: 'service-payment'
    });

    // 3. Update the booking with paymentId
    booking.paymentId = payment._id;
    await booking.save();

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
    try {
        if (!isProviderActive(service.providerId)) {
            responseMessage = 'Booking confirmed! Provider is outside active hours. If no response in 15 mins, you will be refunded.';
        }
    } catch (availabilityError) {
        console.warn('Error checking provider availability:', availabilityError.message);
        // Continue with default message if availability check fails
    }

    res.status(201).json({ message: responseMessage, booking });

  } catch (err) {
    console.error('Error in createBooking:', {
      error: err.message,
      stack: err.stack,
      serviceId,
      clientId,
      rentalDuration
    });
    
    // Rollback wallet balance if payment was made
    if(service && totalCost) {
        try {
            await User.findByIdAndUpdate(clientId, { $inc: { walletBalance: totalCost } });
            console.log('Wallet balance rolled back successfully');
        } catch (rollbackErr) {
            console.error('Failed to rollback wallet balance:', rollbackErr.message);
        }
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

        const credentials = booking.serviceId.credentials || {};
        booking.sharedCredentials = {
            username: credentials.username || '',
            password: credentials.password || '',
            profileName: credentials.profileName || '',
            accessInstructions: booking.serviceId.accessInstructionsTemplate || "No specific instructions provided."
        };

        booking.bookingStatus = 'active';
        await booking.save();

        await User.findByIdAndUpdate(providerId, { $inc: { walletBalance: booking.bookingDetails.rentalPrice } });

        await Notification.create({
            userId: booking.clientId,
            title: 'Access Details Received!',
            message: `The provider has sent access details for your booking: ${booking.bookingDetails.serviceName}.
Username: ${booking.sharedCredentials.username}\nPassword: ${booking.sharedCredentials.password}\nProfile: ${booking.sharedCredentials.profileName}\nInstructions: ${booking.sharedCredentials.accessInstructions}`,
            type: 'booking',
            relatedId: booking._id
        });

        res.status(200).json(booking);

    } catch (err) {
        console.error('Error in sendMessageToBooking:', {
            error: err.message,
            stack: err.stack,
            bookingId,
            providerId
        });
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

const confirmBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, providerId: req.user._id });
        if (!booking) return res.status(404).json({ error: 'Booking not found or you are not authorized.' });
        
        // Update booking status to confirmed if it's pending
        if (booking.bookingStatus === 'pending') {
            booking.bookingStatus = 'confirmed';
            await booking.save();
        }
        
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
    getBookingById,
    confirmBooking
};