// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const helmet = require("helmet");

const connectDB = require("./lib/db");
const { start } = require("./jobs/bookingScheduler");
const { startCleanupScheduler, runStartupCleanup } = require("./jobs/cleanupOrphanedServices");
const httpLogger = require("./middleware/httpLogger");
const cache = require("./utils/cache");

// Import routes
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

// ----------------- CORS Setup -----------------
// Production-ready CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      // Development origins
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5001",
      // Production origins
      "https://sublite.vercel.app",
      "https://sublite-wmu2.onrender.com",
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For security in production, reject unknown origins
      if (process.env.NODE_ENV === "production") {
        callback(new Error("Not allowed by CORS policy"));
      } else {
        // In development, allow all origins for easier testing
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// ----------------- Middlewares -----------------
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));

// HTTP request logging (disabled in production)
// if (process.env.NODE_ENV !== "production") {
//   app.use(httpLogger);
// }

// const helmetConfig = {
//   contentSecurityPolicy:
//     process.env.NODE_ENV === "production" ? undefined : false,
// };
// if (process.env.NODE_ENV === "production") {
//   app.use(helmet(helmetConfig));
// }

// ----------------- Routes -----------------
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

// Health checks
app.get("/", (_req, res) => res.send("Sublite API is running successfully!"));
app.get("/api/v1/status", (_req, res) => {
  res.json({
    status: "running",
    services: { database: "connected", authentication: "enabled" },
    timestamp: new Date().toISOString(),
  });
});

// ----------------- Error handling -----------------
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);
app.use((req, res) => res.status(404).json({ status: 404, message: "API route not found" }));

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    await cache.connect();
    start();

    startCleanupScheduler();
    await runStartupCleanup();

    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
