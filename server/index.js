const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });
require("./config/env.config");

const corsOptions = require("./config/cors.config");
const helmetConfig = require("./config/helmet.config");
const {
  globalLimiter,
  authLimiter,
} = require("./middleware/limiters.middleware");
const database = require("./config/database.config");
const logger = require("./utils/logger");
const { toMalaysianISO } = require("./utils/datetime");
const {
  globalErrorHandler,
  handleNotFound,
} = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

const PORT = Number(process.env.PORT || 5000);

const app = express();
const httpServer = http.createServer(app);

// Route modules
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
const adminFinanceRoutes = require("./routes/admin/finance.route");
const adminUserRoutes = require("./routes/admin/users.route");
const quoteRoutes = require("./routes/quote/quote.route");
const paymentRoutes = require("./routes/payment/payment.route");
const notificationRoutes = require("./routes/notification/notification.route");
const chatRoutes = require("./routes/chat/chat.route");

// Security and parser middleware
app.disable("x-powered-by");
app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : "loopback");
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use("/api/", globalLimiter);
app.use("/api/auth/", authLimiter);
app.use(cookieParser());
app.use(express.json({ limit: "10mb", strict: true }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  }),
);
app.use(requestLogger);

// API routes
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
app.use("/api/quotes", quoteRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin/merchants", adminMerchantRoutes);
app.use("/api/admin", adminFinanceRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: toMalaysianISO(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use(handleNotFound);
app.use(globalErrorHandler);

let stopAnalyticsScheduler;
let stopNotificationCleanupScheduler;
let stopPaymentScheduler;

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  try {
    if (typeof stopAnalyticsScheduler === "function") {
      stopAnalyticsScheduler();
    }
    if (typeof stopNotificationCleanupScheduler === "function") {
      stopNotificationCleanupScheduler();
    }
    if (typeof stopPaymentScheduler === "function") {
      stopPaymentScheduler();
    }
    const { closeSocket } = require("./socket");
    closeSocket();
    await database.disconnect();
  } catch (error) {
    logger.warn("Error during graceful shutdown", { error: error.message });
  } finally {
    httpServer.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  }
};

const startServer = async () => {
  await database.connect();
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once("open", resolve));
  }

  const analyticsJob = require("./jobs/analytics.job");
  analyticsJob.startAnalyticsScheduler();
  stopAnalyticsScheduler = analyticsJob.stopAnalyticsScheduler;

  const notificationJob = require("./jobs/notification.job");
  notificationJob.startNotificationCleanupScheduler();
  stopNotificationCleanupScheduler =
    notificationJob.stopNotificationCleanupScheduler;

  const paymentJob = require("./jobs/payment.job");
  paymentJob.startPaymentScheduler();
  stopPaymentScheduler = paymentJob.stopPaymentScheduler;

  const { initializeSocket } = require("./socket");
  initializeSocket(httpServer);

  await new Promise((resolve) => {
    httpServer.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      resolve();
    });
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    logger.errorWithStack(error, {
      action: "starting_server",
      environment: process.env.NODE_ENV,
      port: PORT,
    });
    process.exit(1);
  });

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

module.exports = { app, httpServer, startServer };
