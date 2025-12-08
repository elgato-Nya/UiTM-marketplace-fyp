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

    // Create a more user-friendly message
    const errorCount = formattedErrors.length;
    const primaryError = formattedErrors[0];
    let userMessage = "Validation failed";

    // Provide more context in the main message
    if (errorCount === 1) {
      userMessage = `Invalid ${primaryError.field}: ${primaryError.message}`;
    } else {
      userMessage = `Validation failed: ${errorCount} error${
        errorCount > 1 ? "s" : ""
      } found`;
    }

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
      message: userMessage,
      errors: formattedErrors,
      code: "VALIDATION_ERROR",
      hint:
        errorCount === 1 && primaryError.location === "params"
          ? "The URL parameter is invalid. Please check the route you're accessing."
          : null,
    });
  }

  next();
};

module.exports = {
  handleValidationErrors,
};
