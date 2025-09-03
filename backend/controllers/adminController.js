const User = require('../models/user');
const Booking = require('../models/booking');
const Payment = require('../models/payment');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

// Fetch dashboard stats: total users, total bookings, total revenue
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Try to get cached stats first
    const cachedStats = await cache.getCachedAdminStats();
    if (cachedStats) {
      logger.info('Serving admin stats from cache');
      return res.json(cachedStats);
    }

    // If not cached, fetch from database
    const usersCountPromise = User.countDocuments();
    const bookingsCountPromise = Booking.countDocuments();
    const revenueTotalPromise = Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const [usersCount, bookingsCount, revenueAgg] = await Promise.all([
      usersCountPromise, bookingsCountPromise, revenueTotalPromise
    ]);

    const revenueTotal = (revenueAgg[0] && revenueAgg[0].total) || 0;

    const stats = {
      usersCount,
      bookingsCount,
      revenueTotal
    };

    // Cache the stats for 5 minutes
    await cache.cacheAdminStats(stats, 300);
    logger.info('Cached admin stats for 5 minutes');

    res.json(stats);
  } catch (err) {
    logger.error('Error fetching admin stats:', err);
    next(err);
  }
};

// Get all users for admin management
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    logger.error('Error fetching users:', err);
    next(err);
  }
};
