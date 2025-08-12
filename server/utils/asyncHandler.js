/**
 * Async Handler Utility (Enhanced)
 *
 * PURPOSE: Wraps async route handlers to automatically catch errors
 * and pass them to Express error handling middleware
 *
 * BENEFITS:
 * - Eliminates try-catch boilerplate in controllers
 * - Consistent error handling across the application
 * - Prevents server crashes from unhandled promise rejections
 * - Cleaner, more readable controller code
 * - Automatic error forwarding to error middleware
 * - Optional context for better error tracking
 *
 * USAGE:
 * const asyncHandler = require('../utils/asyncHandler');
 *
 * // Basic usage
 * const myController = asyncHandler(async (req, res, next) => {
 *   const data = await SomeModel.find();
 *   res.json(data);
 * });
 *
 * // With action context (recommended for better error tracking)
 * const myController = asyncHandler(async (req, res, next) => {
 *   const data = await SomeModel.find();
 *   res.json(data);
 * }, 'get_users'); // action name helps with debugging
 */

const asyncHandler = (fn, action = null) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    // Promise.resolve() ensures we handle both async functions and regular functions
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Add action context to error if provided
      if (action && !error.action) {
        error.action = action;
      }

      // Add request context for better debugging
      if (!error.requestContext) {
        error.requestContext = {
          method: req.method,
          url: req.originalUrl,
          userId: req.user?._id || req.user?.id || "anonymous",
        };
      }

      next(error);
    });
  };
};

module.exports = asyncHandler;
