/**
 * Global Error Handling Middleware
 *
 * PURPOSE: Centralized error processing for the entire application
 *
 * FEATURES:
 * - Handles all types of errors (operational, programming, validation)
 * - Consistent error response format
 * - Environment-specific error details (more info in dev, secure in prod)
 * - Comprehensive logging with context
 * - Security (doesn't leak sensitive information in production)
 * - Specific handling for common error types (MongoDB, JWT, etc.)
 *
 * FLOW:
 * 1. Error occurs in route/middleware
 * 2. If wrapped with asyncHandler, error is automatically passed to next()
 * 3. Express calls this middleware with the error
 * 4. We format and send appropriate response
 * 5. Log the error for monitoring
 */

const { AppError, createServerError } = require("../utils/errors");
const logger = require("../utils/logger");

// Handle specific MongoDB/Mongoose errors and convert to AppError
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, "INVALID_DATA");
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists`;
  return new AppError(message, 409, "DUPLICATE_FIELD");
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 400, "VALIDATION_ERROR");
};

const handleJWTError = () => {
  return new AppError(
    "Invalid token. Please log in again",
    401,
    "INVALID_TOKEN"
  );
};

const handleJWTExpiredError = () => {
  return new AppError(
    "Your token has expired. Please log in again",
    401,
    "TOKEN_EXPIRED"
  );
};

// Send error response in development environment
const sendErrorDev = (err, req, res) => {
  // Log comprehensive error details in development
  logger.errorWithStack(err, {
    action: err.action || "unknown_action",
    originalUrl: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: req.user?.id || req.user?._id || "anonymous",
    headers: req.headers,
    environment: "development",
    requestContext: err.requestContext || null,
  });

  return res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    code: err.code,
    stack: err.stack,
    action: err.action || null,
    timestamp: new Date().toISOString(),
    request: {
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  });
};

// Send error response in production environment
const sendErrorProd = (err, req, res) => {
  // Only log and send operational errors in production
  if (err.isOperational) {
    logger.error("Operational error", {
      action: err.action || "unknown_action",
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      originalUrl: req.originalUrl,
      method: req.method,
      userId: req.user?.id || req.user?._id || "anonymous",
      environment: "production",
      requestContext: err.requestContext || null,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Programming errors - don't leak details to client
    logger.errorWithStack(err, {
      category: "programming_error",
      action: err.action || "unknown_action",
      originalUrl: req.originalUrl,
      method: req.method,
      userId: req.user?.id || req.user?._id || "anonymous",
      environment: "production",
      severity: "critical",
      requestContext: err.requestContext || null,
    });

    throw createServerError(
      "Something went wrong! Please try again later.",
      "SERVER_ERROR"
    );
  }
};

// Main error handling middleware - MUST be last middleware in the stack
const globalErrorHandler = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    // Create a copy of the error to avoid modifying the original
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // Handle specific error types and convert to AppError
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// Handle 404 errors for undefined routes
const handleNotFound = (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404,
    "ROUTE_NOT_FOUND"
  );
  next(err);
};

module.exports = {
  globalErrorHandler,
  handleNotFound,
};
