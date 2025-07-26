const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.ObjectId, ref: 'Service', required: true },
  paymentId: { type: mongoose.Schema.ObjectId, ref: 'Payment', required: false }, 

  bookingDetails: {
   serviceName: { type: String, required: true },
    rentalPrice: { type: Number, required: true },
    rentalDuration: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true }
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

  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, { timestamps: true });

bookingSchema.index({ clientId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ clientId: 1, serviceId: 1, bookingStatus: 1 }); // Compound index for duplicate booking checks
bookingSchema.index({ completedAt: 1 }); // Index for recent completed bookings check

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
