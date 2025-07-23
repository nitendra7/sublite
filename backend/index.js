const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./lib/db');
const { initializeScheduler } = require('./jobs/bookingScheduler');

const admin = require('firebase-admin');
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set!');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(serviceAccountJson);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized.');
} catch (parseError) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY JSON:', parseError);
  process.exit(1);
}

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

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

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

app.get('/', (_req, res) => {
  res.send('Sublite API is running successfully!');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await initializeScheduler();
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database or initialize scheduler:', error);
    process.exit(1);
  }
};

startServer();
