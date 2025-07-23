// Import core libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import custom modules
const connectDB = require('./lib/db');
const { initializeScheduler } = require('./utils/bookingScheduler');

// Firebase Admin SDK Import
const admin = require('firebase-admin');

// For custom JWT verification
const jwt = require('jsonwebtoken');

// Firebase Admin SDK Initialization from environment variable
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set!');
  process.error('Exiting due to missing Firebase service account key.');
}

try {
  const serviceAccount = JSON.parse(serviceAccountJson);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (parseError) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY JSON:', parseError);
  console.error('Exiting due to malformed Firebase service account key JSON.');
  process.error('Exiting due to malformed Firebase service account key JSON.');
}


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


const app = express();

// Core Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Hybrid Authentication Middleware
const isAuthenticated = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: No token provided or malformed header.');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const firebaseDecodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            ...firebaseDecodedToken,
            _id: firebaseDecodedToken.uid,
            tokenType: 'firebase'
        };
        return next();
    } catch (firebaseError) {
        try {
            const customDecodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = {
                ...customDecodedToken,
                _id: customDecodedToken.id,
                tokenType: 'custom_jwt'
            };
            return next();
        } catch (customJwtError) {
            console.error('Authentication Error:', customJwtError.message);
            return res.status(403).send('Unauthorized: Invalid or expired token.');
        }
    }
};


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', isAuthenticated, userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', isAuthenticated, bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/wallettransactions', walletTransactionRoutes);


const PORT = process.env.PORT || 5000;

app.get('/', (_req, res) => {
  res.send('Sublite API is running successfully!');
});

const startServer = async () => {
  try {
    await connectDB();
    await initializeScheduler();
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
};

startServer();