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

const {
  AppError,
  createServerError,
  createDuplicateError,
} = require("../utils/errors");
const logger = require("../utils/logger");
const { toMalaysianISO } = require("../utils/datetime");

// Handle specific MongoDB/Mongoose errors and convert to AppError
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, "INVALID_DATA");
};

const handleDuplicateFieldsDB = (err) => {
  // Check if it's a MongooseError with custom message from schema
  if (err.name === "MongooseError" && err.message) {
    // Use the custom message from the schema unique constraint
    return createDuplicateError(err.message, null, err.action);
  }

  // Handle standard MongoDB E11000 duplicate key error
  if (err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    // Create a generic message for E11000 errors
    // const message = `${field.replace(/^profile\./,"")} '${value}' already exists`;
    // ! use a more generic message that handles nested fields

    const message = `${
      field.includes(".") ? field.split(".")[1] : field
    } '${value}' already exists`;
    return createDuplicateError(message, null, err.action);
  }

  // Fallback for unknown duplicate errors
  return createDuplicateError("Duplicate value detected", null, err.action);
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
  const logContext = {
    action: err.action || "unknown_action",
    originalUrl: req.originalUrl,
    method: req.method,
    userId: req.user?.id || req.user?._id || "undefined",
    environment: "development",
    body: req.body, // Logger will sanitize this automatically
    ...(Object.keys(req.params).length > 0 && { params: req.params }),
    ...(Object.keys(req.query).length > 0 && { query: req.query }),
  };

  logger.errorWithStack(err, logContext);

  return res.status(err.statusCode).json({
    success: false,
    error: {
      statusCode: err.statusCode,
      status: err.status,
      code: err.code,
      isOperational: err.isOperational,
      action: err.action || null,
      requestContext: err.requestContext || {
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.id || req.user?._id || "anonymous",
      },
      message: err.message,
      name: err.name,
      ...(err.details && { details: err.details }), // Include validation details
    },
    timestamp: toMalaysianISO(),
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
      requestContext: err.requestContext,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details }), // Include validation details in production too
      timestamp: toMalaysianISO(),
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
      requestContext: err.requestContext,
    });

    throw createServerError(
      "Something went wrong! Please try again later.",
      "SERVER_ERROR"
    );
  }
};

// Main error handling middleware - MUST be last middleware in the stack
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Handle specific error types and convert to AppError in ALL environments
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Process MongoDB/Mongoose errors
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (
    error.code === 11000 ||
    (error.name === "MongooseError" && error.message.includes("already exists"))
  ) {
    error = handleDuplicateFieldsDB(error);
  }
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// Handle 404 errors for undefined routes
const handleNotFound = (req, res, next) => {
  const err = new AppError(
    `It is unfortunate to say that ${req.originalUrl} WAS NOT FOUND on this server!`,
    404,
    "ROUTE_NOT_FOUND"
  );
  next(err);
};

module.exports = {
  globalErrorHandler,
  handleNotFound,
};
