const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.ObjectId, ref: 'Booking', required: true },
  clientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.ObjectId, ref: 'Service', required: true },

  rating: { type: Number, required: true },
  comment: String,
  serviceQuality: Number,
  responseTime: Number,
  overallExperience: Number,

  isVerified: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

reviewSchema.index({ serviceId: 1 });
reviewSchema.index({ providerId: 1 });
reviewSchema.index({ clientId: 1 });
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
