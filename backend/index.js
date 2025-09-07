const express = require("express");
const cors = require("cors");
require("dotenv").config();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./lib/db");
const { start } = require("./jobs/bookingScheduler");
const {
  startCleanupScheduler,
  runStartupCleanup,
} = require("./jobs/cleanupOrphanedServices");
const httpLogger = require("./middleware/httpLogger");
const cache = require("./utils/cache");

const authRoutes = require("./routes/auth");
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

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins for debugging, but in production you should be more specific
      const allowed = (
        process.env.CORS_ORIGINS ||
        "http://localhost:3000,http://localhost:3001,http://localhost:3002,https://sublite.vercel.app"
      )
        .split(",")
        .map((s) => s.trim());
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));

 // HTTP request logging (disabled in production)
if (process.env.NODE_ENV !== "production") {
  app.use(httpLogger);
}

const helmetConfig = {
  contentSecurityPolicy:
    process.env.NODE_ENV === "production" ? undefined : false,
};
app.use(helmet(helmetConfig));

const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
if (process.env.NODE_ENV == "production") {
  app.use(apiRateLimiter);
}

app.use("/api/v1/auth", authRoutes);
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

// Specific routes before error handler
app.get("/", (_req, res) => {
  res.send("Sublite API is running successfully!");
});

app.head("/", (_req, res) => {
  res.sendStatus(200);
});

app.get("/api/v1/status", (_req, res) => {
  res.json({
    status: "running",
    services: {
      database: "connected",
      authentication: "enabled",
    },
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handling middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "API route not found",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await cache.connect(); // Connect to Redis cache
    start();

    // Initialize cleanup jobs
    startCleanupScheduler();
    await runStartupCleanup();

    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to connect to the database, cache, or initialize scheduler:",
      error,
    );
    process.exit(1);
  }
};

startServer();
