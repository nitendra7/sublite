const express = require('express');
const app = express();


require('dotenv').config();
const cors = require('cors');
const connect = require('./lib/db');
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



app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
  credentials: true, // Allow credentials
}));
// Middleware
app.use(express.json());

// Mount routes
app.use('/api/users', auth, userRoutes); // Disabled auth for teacher testing
 app.use('/api/services', auth, serviceRoutes); // Disabled auth for teacher testing
 app.use('/api/bookings', auth, bookingRoutes); // Disabled auth for teacher testing
 app.use('/api/payments', auth, paymentRoutes); // Disabled auth for teacher testing
 app.use('/api/reviews', auth, reviewRoutes); // Disabled auth for teacher testing
app.use('/api/categories', auth, categoryRoutes); // Disabled auth for teacher testing
app.use('/api/notifications', auth, notificationRoutes); // Disabled auth for teacher testing
 app.use('/api/support-tickets', auth, supportTicketRoutes); // Disabled auth for teacher testing
 app.use('/api/wallet-transactions', auth, walletTransactionRoutes); // Disabled auth for teacher testing
 app.use('/api/settings', auth, settingRoutes); // Disabled auth for teacher testing
app.use('/api/auth', authRoutes);





const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('Hello World');
});
// Connect to DB
connect();

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});