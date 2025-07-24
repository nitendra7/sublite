const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.ObjectId, ref: 'Booking', required: true, unique: true }, // ADDED unique
  clientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.ObjectId, ref: 'Service', required: true },

  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  
  // Optional detailed ratings
  serviceQuality: { type: Number, min: 1, max: 5 },
  responseTime: { type: Number, min: 1, max: 5 },
  overallExperience: { type: Number, min: 1, max: 5 },

  isVerified: { type: Boolean, default: true }, // A review implies a verified purchase
  helpfulCount: { type: Number, default: 0 },

}, { timestamps: true });

reviewSchema.index({ serviceId: 1 });
reviewSchema.index({ providerId: 1 });

const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
