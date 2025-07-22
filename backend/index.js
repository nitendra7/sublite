// Import core libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import custom modules
const connectDB = require('./lib/db');

// --- Import all route files with direct names ---
const auth = require('./routes/auth');
const user = require('./routes/user');
const service = require('./routes/service');
const booking = require('./routes/booking');
const payment = require('./routes/payment');
const review = require('./routes/review');
const notification = require('./routes/notification');
const supportTicket = require('./routes/supportTicket');
const category = require('./routes/category');
const setting = require('./routes/setting');
const walletTransaction = require('./routes/walletTransaction');


// --- Initialize Express App ---
const app = express();


// --- Core Middleware ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
  credentials: true,
}));
app.use(express.json());


// --- API Routes ---
// Mount all the route handlers using the direct names
app.use('/api/auth', auth);
app.use('/api/users', user);
app.use('/api/services', service);
app.use('/api/bookings', booking);
app.use('/api/payments', payment);
app.use('/api/reviews', review);
app.use('/api/notifications', notification);
app.use('/api/support-tickets', supportTicket);
app.use('/api/categories', category);
app.use('/api/settings', setting);
app.use('/api/wallettransactions', walletTransaction);


// --- Server Initialization ---
const PORT = process.env.PORT || 5000;

app.get('/', (_req, res) => {
  res.send('Sublite API is running successfully!');
});

const startServer = async () => {
  try {
    await connectDB();
    
    bookingScheduler.start(); 

    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
};

startServer();