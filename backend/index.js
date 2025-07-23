// Import core libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import custom modules
const connectDB = require('./lib/db');
const { initializeScheduler } = require('./jobs/bookingScheduler');

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
        console.log('Middleware: No token or malformed header.'); // Log the basic failure
        return res.status(401).send('Unauthorized: No token provided or malformed header.');
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Middleware: Token received:', token.substring(0, 30) + '...'); // Log received token (first 30 chars)

    try {
        const firebaseDecodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            ...firebaseDecodedToken,
            _id: firebaseDecodedToken.uid,
            tokenType: 'firebase'
        };
        console.log('Middleware: Firebase Token verified successfully. User UID:', req.user._id); // Log success
        return next();
    } catch (firebaseError) {
        console.log('Middleware: Firebase Token verification failed:', firebaseError.message); // Log Firebase failure reason
        try {
            // Check if ACCESS_TOKEN_SECRET is defined
            if (!process.env.ACCESS_TOKEN_SECRET) {
                console.error('Middleware: ACCESS_TOKEN_SECRET is NOT set!');
                return res.status(500).send('Server Error: ACCESS_TOKEN_SECRET not configured.');
            }
            console.log('Middleware: Attempting custom JWT verification...');
            // Log the secret being used (for debugging only, remove in production)
            // console.log('Middleware: Using secret:', process.env.ACCESS_TOKEN_SECRET);

            const customDecodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = {
                ...customDecodedToken,
                _id: customDecodedToken.id, // Assuming 'id' is in your custom JWT payload
                tokenType: 'custom_jwt'
            };
            console.log('Middleware: Custom JWT Verified successfully. User ID:', req.user._id); // Log success
            return next();
        } catch (customJwtError) {
            console.error('Middleware: Custom JWT Verification Failed! Error:', customJwtError.message); // Log custom JWT failure
            return res.status(403).send('Unauthorized: Invalid or expired token.');
        }
    }
};


// API Routes
app.use('/api/auth', auth);
app.use('/api/users', isAuthenticated, user);
app.use('/api/services', isAuthenticated, service); // <-- ADDED isAuthenticated
app.use('/api/bookings', isAuthenticated, booking);
app.use('/api/payments', isAuthenticated, payment); // <-- ADDED isAuthenticated
app.use('/api/reviews', isAuthenticated, review); // <-- ADDED isAuthenticated (if needed)
app.use('/api/notifications', isAuthenticated, notification); // <-- ADDED isAuthenticated (if needed)
app.use('/api/support-tickets', isAuthenticated, supportTicket); // <-- ADDED isAuthenticated (if needed)
app.use('/api/categories', isAuthenticated, category); // <-- ADDED isAuthenticated (if needed)
app.use('/api/settings', isAuthenticated, setting); // <-- ADDED isAuthenticated (if needed)
app.use('/api/wallettransactions', isAuthenticated, walletTransaction); // <-- ADDED isAuthenticated (if needed)



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