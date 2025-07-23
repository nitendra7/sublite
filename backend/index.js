// Import core libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import custom modules
const connectDB = require('./lib/db');
const { initializeScheduler } = require('./utils/bookingScheduler');

// Firebase Admin SDK Import
const admin = require('firebase-admin');

// For custom JWT verification (for manual logins)
const jwt = require('jsonwebtoken');

// Firebase Admin SDK Initialization
const serviceAccount = require('./config/serviceAccountKey.json'); // Adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Define your custom JWT secret (for manual logins)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// --- Import all route files ---
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


// --- Initialize Express App ---
const app = express();


// --- Core Middleware ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// --- Hybrid Authentication Middleware ---
const isAuthenticated = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: No token provided or malformed header.');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Attempt to verify as a Firebase ID Token first
        const firebaseDecodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            ...firebaseDecodedToken,
            _id: firebaseDecodedToken.uid, // Map Firebase UID to _id for consistency with MongoDB
            tokenType: 'firebase'
        };
        return next();

    } catch (firebaseError) {
        // If not a valid Firebase ID Token, try to verify as a custom JWT
        try {
            const customDecodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
            req.user = {
                ...customDecodedToken,
                _id: customDecodedToken.id, // Map custom JWT 'id' to _id (assuming your custom JWT uses 'id')
                tokenType: 'custom_jwt'
            };
            return next();
        } catch (customJwtError) {
            console.error('Authentication Error:', customJwtError.message);
            return res.status(403).send('Unauthorized: Invalid or expired token.');
        }
    }
};


// --- API Routes ---
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


// --- Server Initialization ---
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