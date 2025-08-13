const express = require("express");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const corsOptions = require("./config/cors.config");
const helmetConfig = require("./config/helmet.config");
const { generalLimiter, authLimiter } = require("./config/limiter.config");
const database = require("./config/database.config");
const logger = require("./utils/logger");
const {
  globalErrorHandler,
  handleNotFound,
} = require("./middleware/errorHandler");
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require("./routes/user/auth.route");
const userRoutes = require("./routes/user/user.route");

const app = express();

// ================== SECURITY MIDDLEWARE ========================
app.use(helmetConfig);

// set limter for each api route
app.use("/api/", generalLimiter);

// set limiter for auth routes
app.use("/api/auth/", authLimiter);

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: "10mb", strict: true })); // Increase body size limit for large requests
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Increase body size limit for form data
app.use(
  mongoSanitize({
    replaceWith: "_", // Replace with underscore to prevent MongoDB injection
    allowDots: true, // Allow dots in keys
  })
);

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ================== ERROR HANDLING ========================
// Handle undefined routes (404) - must come before global error handler
app.use((req, res, next) => {
  handleNotFound(req, res, next);
});

// Global error handling middleware - MUST be last middleware in the stack
app.use(globalErrorHandler);

// ================== START SERVER ========================
const startServer = async () => {
  try {
    logger.info("Starting e-commerce server...", {
      environment: process.env.NODE_ENV,
      port: PORT,
    });

    // Try to connect to database, but don't fail if it's not available in development
    try {
      await database.connect();
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
        `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
        {
          environment: process.env.NODE_ENV,
          port: PORT,
        }
      );
    });

    // Graceful shutdown handling
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully");
      server.close(() => {
        logger.info("Process terminated");
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully");
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

startServer();

module.exports = app;
