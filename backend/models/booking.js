const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.ObjectId, ref: 'Service', required: true },
  paymentId: { type: mongoose.Schema.ObjectId, ref: 'Payment', required: true }, // REPLACED paymentDetails

  bookingDetails: {
    serviceName: String,
    rentalPrice: Number,
    rentalDuration: Number, // in days
    startDate: { type: Date, default: Date.now },
    endDate: Date
  },

  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },

  sharedCredentials: {
    username: String,
    password: String,
    profileName: String,
    accessInstructions: String
  },

  completedAt: Date
}, { timestamps: true });

bookingSchema.index({ clientId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ bookingStatus: 1 });

const Booking = mongoose.model("booking", bookingSchema);
module.exports = Booking;
