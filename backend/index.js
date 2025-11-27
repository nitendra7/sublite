const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./lib/db");
const { start } = require("./jobs/bookingScheduler");
const { startCleanupScheduler, runStartupCleanup } = require("./jobs/cleanupOrphanedServices");
const cache = require("./utils/cache");
const logger = require("./utils/logger");

const authRoutes = require("./routes/auth");
const clerkSyncRoutes = require("./routes/clerkSync");
const userRoutes = require("./routes/user");
const serviceRoutes = require("./routes/service");
const bookingRoutes = require("./routes/booking");
const paymentRoutes = require("./routes/payment");
const reviewRoutes = require("./routes/review");
const notificationRoutes = require("./routes/notification");
const supportTicketRoutes = require("./routes/supportTicket");
const categoryRoutes = require("./routes/category");
const settingRoutes = require("./routes/setting");
const walletTransactionRoutes = require("./routes/walletTransaction");
const adminRoutes = require("./routes/admin");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5001",
      "https://sublite.vercel.app",
      "https://sublite-wmu2.onrender.com",
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === "production") {
        callback(new Error("Not allowed by CORS policy"));
      } else {
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", clerkSyncRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/support-tickets", supportTicketRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/settings", settingRoutes);
app.use("/api/v1/wallettransactions", walletTransactionRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/", (_req, res) => res.send("Sublite API is running successfully!"));
app.get("/api/v1/status", (_req, res) => {
  res.json({
    status: "running",
    services: { database: "connected", authentication: "enabled" },
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);
app.use((req, res) => res.status(404).json({ status: 404, message: "API route not found" }));

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const requiredEnvVars = ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
    const hasMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!hasMongoUri) {
      requiredEnvVars.push('MONGODB_URI or MONGO_URI');
    }

    const missingVars = requiredEnvVars.filter(varName => {
      if (varName.includes('MONGO')) return false;
      return !process.env[varName];
    });

    if (missingVars.length > 0 || !hasMongoUri) {
      logger.error('CRITICAL: Missing required environment variables:',
        !hasMongoUri ? [...missingVars, 'MONGODB_URI or MONGO_URI'] : missingVars
      );
      logger.error('Please set these variables in your .env file or deployment environment');
      process.exit(1);
    }

    await connectDB();
    await cache.connect();
    start();
    startCleanupScheduler();
    await runStartupCleanup();

    app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
