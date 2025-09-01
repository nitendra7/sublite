// Import core libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import custom modules
const connectDB = require('./lib/db');
const { start: initializeScheduler } = require('./jobs/bookingScheduler');


// Import all route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const serviceRoutes = require('./routes/service');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/review');
const notificationRoutes = require('./routes/notification');
const supportTicketRoutes = require('./routes/supportTicket');
const categoryRoutes = require('./routes/category');
const settingRoutes = require('./routes/setting');
const walletTransactionRoutes = require('./routes/walletTransaction');
const adminRoutes = require('./routes/admin');


const app = express();

// Core Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://sublite.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// API Routes
// Authentication middleware is applied within individual route files (middleware/auth.js).
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/wallettransactions', walletTransactionRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (_req, res) => {
  res.send('Sublite API is running successfully!');
});

// System status endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'running',
    services: {
      database: 'connected',
      authentication: 'enabled'
    },
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    await connectDB();
    initializeScheduler();
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database or initialize scheduler:", error);
    process.exit(1);
  }
};

startServer();