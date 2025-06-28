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

// More explicit CORS configuration
app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Debug middleware to log headers
app.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);
  next();
});

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

// Test route for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working',
    headers: req.headers,
    method: req.method,
    url: req.url
  });
});

module.exports = app; 