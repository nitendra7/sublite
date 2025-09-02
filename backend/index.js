// Import core libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

// Minimal OpenAPI 3.0 schema for live docs; expand as needed for your endpoints later
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Sublite API',
    version: '1.0.0',
    description: 'Live documentation for all available API endpoints.',
  },
  servers: [{ url: '/api/v1' }],
  paths: {},
};



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
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,https://sublite.vercel.app')
      .split(',')
      .map(s => s.trim());
    // Allow requests with no origin (like mobile apps or curl) or if origin is in whitelist
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Prefer JSON body limit config in future (see other todos)
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// Dynamic, environment-responsive Helmet security configuration
const helmetConfig = {
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
};
// Apply Helmet security middleware
// Helmet already configured
app.use(helmet(helmetConfig));

// Mount Swagger API docs at /api-docs (live and self-updating)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// --- Global API rate limiting middleware ---
// Allow environment override for production/easy tuning in dev
const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min default
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiRateLimiter);
// API Routes
// Authentication middleware is applied within individual route files (middleware/auth.js).
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/support-tickets', supportTicketRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/wallettransactions', walletTransactionRoutes);
app.use('/api/v1/admin', adminRoutes);

// --- Centralized error-handling middleware (standardizes error format & prevents leakage) ---
app.use((err, req, res, next) => {
  // If error has no status, it's a server bug
  const status = err.status || 500;
  res.status(status).json({
    status,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// --- 404 handler for unmatched routes ---
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: 'API route not found'
  });
});

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