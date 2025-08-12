/**
 * Custom Application Error Class
 *
 * PURPOSE: Standardize error objects across the application
 *
 * FEATURES:
 * - Consistent error structure
 * - Built-in HTTP status codes
 * - Error categorization (operational vs programming errors)
 * - Stack trace preservation
 * - Custom error codes for client handling
 *
 * USAGE:
 * throw new AppError('User not found', 404, 'USER_NOT_FOUND');
 *
 * OPERATIONAL vs PROGRAMMING ERRORS:
 * - Operational: Expected errors we can predict (validation, auth, not found)
 * - Programming: Bugs in our code (syntax errors, undefined variables)
 */

class AppError extends Error {
  constructor(message, statusCode, code = null, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.code = code;
    this.isOperational = isOperational; // Distinguishes operational vs programming errors

    // Capture stack trace (excluding constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
