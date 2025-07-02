require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connect = require('./connection/mc.js');
const auth = require('./middleware/auth');

const userRoutes = require('./routes/user');
const serviceRoutes = require('./routes/service');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/review');
const categoryRoutes = require('./routes/category');
const notificationRoutes = require('./routes/notification');
const supportTicketRoutes = require('./routes/supportTicket');
const walletTransactionRoutes = require('./routes/walletTransaction');
const settingRoutes = require('./routes/setting');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());

// Connect to DB
connect();

// Middleware
app.use(express.json());

// Mount routes
app.use('/api/users', auth, userRoutes);
app.use('/api/services', auth, serviceRoutes);
app.use('/api/bookings', auth, bookingRoutes);
app.use('/api/payments', auth, paymentRoutes);
app.use('/api/reviews', auth, reviewRoutes);
app.use('/api/categories', auth, categoryRoutes);
app.use('/api/notifications', auth, notificationRoutes);
app.use('/api/support-tickets', auth, supportTicketRoutes);
app.use('/api/wallet-transactions', auth, walletTransactionRoutes);
app.use('/api/settings', auth, settingRoutes);
app.use('/api/auth', authRoutes);

module.exports = app; 