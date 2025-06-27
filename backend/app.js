require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connect = require('./connection/mc.js');

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
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/wallet-transactions', walletTransactionRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/auth', authRoutes);

module.exports = app; 