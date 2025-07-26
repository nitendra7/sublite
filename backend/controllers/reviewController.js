const Review = require('../models/review');
const Booking = require('../models/booking');
const { User } = require('../models/user');
const Service = require('../models/service');

// Get all reviews (public)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .populate('serviceId', 'serviceName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reviews by service ID
exports.getReviewsByService = async (req, res) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .populate('serviceId', 'serviceName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reviews by provider ID
exports.getReviewsByProvider = async (req, res) => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId })
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .populate('serviceId', 'serviceName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reviews by current user (as client)
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ clientId: req.user._id })
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .populate('serviceId', 'serviceName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get completed bookings that can be reviewed by current user
exports.getReviewableBookings = async (req, res) => {
  try {
    // Get completed bookings where user is the client and hasn't reviewed yet
    const completedBookings = await Booking.find({
      clientId: req.user._id,
      bookingStatus: 'completed'
    }).populate('serviceId', 'serviceName')
      .populate('providerId', 'name');

    // Filter out bookings that already have reviews
    const reviewableBookings = [];
    for (const booking of completedBookings) {
      const existingReview = await Review.findOne({ bookingId: booking._id });
      if (!existingReview) {
        reviewableBookings.push(booking);
      }
    }

    res.json(reviewableBookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .populate('serviceId', 'serviceName');
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, serviceQuality, responseTime, overallExperience } = req.body;

    // Validate required fields
    if (!bookingId || !rating) {
      return res.status(400).json({ error: 'Booking ID and rating are required' });
    }

    // Check if booking exists and belongs to current user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only review your own bookings' });
    }

    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({ error: 'You can only review completed bookings' });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this booking' });
    }

    // Create the review
    const review = new Review({
      bookingId,
      clientId: req.user._id,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      rating,
      comment,
      serviceQuality,
      responseTime,
      overallExperience
    });

    await review.save();

    // Populate the review with user and service details
    const populatedReview = await Review.findById(review._id)
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .populate('serviceId', 'serviceName');

    res.status(201).json(populatedReview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns this review
    if (review.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('clientId', 'name')
     .populate('providerId', 'name')
     .populate('serviceId', 'serviceName');

    res.json(updatedReview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns this review
    if (review.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.helpfulCount += 1;
    await review.save();

    res.json({ helpfulCount: review.helpfulCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};