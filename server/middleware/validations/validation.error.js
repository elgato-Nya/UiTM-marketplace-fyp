const { validationResult } = require("express-validator");
const logger = require("../../utils/logger");

/**
 * Centralized Validation Error Handler
 *
 * PURPOSE: Handle express-validator validation results consistently across all validation files
 * USAGE: Import and use as the final middleware in validation arrays
 * PATTERN: Used in listing, user, order, and other validation files
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    logger.error("Validation errors:", {
      formattedErrors,
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
      },
      user: req.user
        ? { id: req.user._id.toString(), email: req.user.email }
        : null,
      timestamp: new Date().toISOString(),
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
      code: "VALIDATION_ERROR",
    });
  }

  next();
};

module.exports = {
  handleValidationErrors,
};
