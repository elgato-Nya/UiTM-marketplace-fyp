const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Import centralized config (validates environment variables on startup)
const config = require("./config/env.config");

const corsOptions = require("./config/cors.config");
const helmetConfig = require("./config/helmet.config");
const { generalLimiter, authLimiter } = require("./config/limiter.config");
const database = require("./config/database.config");
const logger = require("./utils/logger");
const { toMalaysianISO } = require("./utils/datetime");
const {
  globalErrorHandler,
  handleNotFound,
} = require("./middleware/errorHandler");
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require("./routes/user/auth.route");
const userRoutes = require("./routes/user/user.route");
const addressRoutes = require("./routes/user/address.route");
const merchantRoutes = require("./routes/user/merchant.route");
const listingRoutes = require("./routes/listing/listing.route");
const orderRoutes = require("./routes/order/order.route");
const uploadRoutes = require("./routes/upload/upload.route");
const cartRoutes = require("./routes/cart/cart.route");
const wishlistRoutes = require("./routes/wishlist/wishlist.route");
const checkoutRoutes = require("./routes/checkout/checkout.route");
const analyticsRoutes = require("./routes/analytic/analytics.route");
const contactRoutes = require("./routes/contact/contact.route");
const adminMerchantRoutes = require("./routes/admin/merchant.routes");
const adminUserRoutes = require("./routes/admin/users.route");

logger.info("All route modules loaded successfully", {
  routes: [
    "auth",
    "user",
    "address",
    "merchant",
    "listing",
    "order",
    "upload",
    "cart",
    "wishlist",
    "checkout",
    "analytics",
    "contact",
    "admin/merchants",
    "admin/users",
  ],
});

const app = express();

app.disable("x-powered-by"); // Explicitly remove X-Powered-By header

// Trust proxy - CRITICAL for rate limiting behind AWS ELB/Nginx
// Use specific value to prevent IP spoofing attacks
// See: https://express-rate-limit.github.io/ERR_ERL_PERMISSIVE_TRUST_PROXY/
if (process.env.NODE_ENV === "production") {
  // Production: Only trust first proxy (AWS ELB/CloudFront)
  // This prevents users from spoofing X-Forwarded-For
  app.set("trust proxy", 1);
} else {
  // Development: Trust localhost reverse proxies
  // Use loopback addresses for local testing with Nginx/Docker
  app.set("trust proxy", "loopback");
}

// ================== SECURITY MIDDLEWARE ========================
app.use(helmetConfig);

// Apply rate limiters BEFORE body parsing to prevent DoS attacks
// that send large payloads just to consume resources
app.use("/api/", generalLimiter);
app.use("/api/auth/", authLimiter);

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: "10mb", strict: true })); // Increase body size limit for large requests
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Increase body size limit for form data

// Compress response bodies for better performance
app.use(
  compression({
    level: 6, // Compression level (0-9), 6 is a good balance between speed and compression ratio
    threshold: 1024, // Compress responses larger than 1KB
    // Filter function - what to compress
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers["x-no-compression"]) {
        return false;
      }

      // Use compression default filter
      return compression.filter(req, res);
    },
  })
);

// ================== API ROUTES ========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/contact", contactRoutes);

// Admin routes
app.use("/api/admin/merchants", adminMerchantRoutes);
logger.info("✅ Admin merchants route loaded");
app.use("/api/admin/users", adminUserRoutes);
logger.info("✅ Admin users route loaded");

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: toMalaysianISO(),
    environment: process.env.NODE_ENV,
  });
});

// ================== ERROR HANDLING ========================
// Handle undefined routes (404) - must come before global error handler
app.use(handleNotFound);

// Global error handling middleware - MUST be last middleware in the stack
app.use(globalErrorHandler);

// ================== START SERVER ========================
// Move scheduler functions to module scope for graceful shutdown
let startAnalyticsScheduler, stopAnalyticsScheduler;

const startServer = async () => {
  try {
    logger.info("Starting e-commerce server...");

    // Try to connect to database, but don't fail if it's not available in development
    try {
      // Import scheduler functions BEFORE connection attempt
      const analyticsJob = require("./jobs/analytics.job");
      startAnalyticsScheduler = analyticsJob.startAnalyticsScheduler;
      stopAnalyticsScheduler = analyticsJob.stopAnalyticsScheduler;

      // Connect to database and wait for it to be fully ready
      await database.connect();

      // Start analytics scheduler after successful connection
      try {
        // Check if connection is ready (might already be open)
        if (mongoose.connection.readyState === 1) {
          logger.info("MongoDB connected, starting analytics scheduler...");
          startAnalyticsScheduler();
        } else {
          // If not ready yet, wait for 'open' event
          mongoose.connection.once("open", () => {
            logger.info("MongoDB ready, starting analytics scheduler...");
            startAnalyticsScheduler();
          });
        }
      } catch (schedulerError) {
        // Scheduler error should not crash the server
        logger.warn("Analytics scheduler failed to start", {
          error: schedulerError.message,
        });
      }
    } catch (dbError) {
      if (process.env.NODE_ENV === "development") {
        logger.warn(
          "Database connection failed in development mode, continuing without database",
          {
            error: dbError.message,
          }
        );
      } else {
        throw dbError; // In production, database is required
      }
    }

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(
        `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });

    // Graceful shutdown handling
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully");
      if (stopAnalyticsScheduler) {
        stopAnalyticsScheduler();
      }
      server.close(() => {
        logger.info("Process terminated");
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully");
      if (stopAnalyticsScheduler) {
        stopAnalyticsScheduler();
      }
      server.close(() => {
        logger.info("Process terminated");
      });
    });
  } catch (error) {
    logger.errorWithStack(error, {
      action: "starting_server",
      environment: process.env.NODE_ENV,
      port: PORT,
      error: error.message,
    });
    process.exit(1); // Exit the process if server fails to start
  }
};

// Debug: Check if this code is being reached
logger.info("Reached end of index.js", {
  requireMain: require.main?.filename,
  moduleFilename: module.filename,
  isMainModule: require.main === module,
});

// Only start server if this file is run directly (not imported as a module)
if (require.main === module) {
  logger.info("Starting server from main module...");

  // Start server and handle any unhandled promise rejections
  startServer()
    .then(() => {
      logger.info("startServer() promise resolved successfully");
    })
    .catch((error) => {
      logger.error("Unhandled error during server startup:", {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });
} else {
  // If imported as a module, just export the app
  logger.info("Server module loaded (not starting server in this process)");
}

module.exports = app;
