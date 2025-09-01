const User = require('../models/user');
const Booking = require('../models/booking');
const Payment = require('../models/payment');

// Fetch dashboard stats: total users, total bookings, total revenue
exports.getDashboardStats = async (req, res) => {
  try {
    const usersCountPromise = User.countDocuments();
    const bookingsCountPromise = Booking.countDocuments();
    const revenueTotalPromise = Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const [usersCount, bookingsCount, revenueAgg] = await Promise.all([
      usersCountPromise, bookingsCountPromise, revenueTotalPromise
    ]);

    const revenueTotal = (revenueAgg[0] && revenueAgg[0].total) || 0;

    res.json({
      usersCount,
      bookingsCount,
      revenueTotal
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ error: 'Error fetching stats' });
  }
};