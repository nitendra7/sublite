const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.ObjectId, ref: 'Service', required: true },

  bookingDetails: {
    serviceName: String,
    rentalPrice: Number,
    rentalDuration: Number, // in days
    startDate: Date,
    endDate: Date
  },

  paymentDetails: {
    amount: Number,
    paymentMethod: { type: String, enum: ['wallet', 'card', 'upi'] },
    transactionId: String,
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paidAt: Date
  },

  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },

  sharedCredentials: {
    username: String,
    password: String,
    profileName: String,
    accessInstructions: String
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  completedAt: Date
});

bookingSchema.index({ clientId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model("booking", bookingSchema);
module.exports = Booking;