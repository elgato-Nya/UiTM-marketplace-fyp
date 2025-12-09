const rateLimit = require("express-rate-limit");
const logger = require("../../utils/logger");

/**
 * Email Verification Rate Limiter
 * Prevents spam and abuse of verification email sending
 */
const emailVerificationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts per window
  message: {
    success: false,
    message: "Too many verification requests, try again later",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: 900, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn("Email verification rate limit exceeded", {
      ip: req.ip,
      email: req.body?.email,
    });
    res.status(429).json({
      success: false,
      message:
        "Too many verification requests. Please try again in 15 minutes.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: 900,
    });
  },
});

/**
 * Password Reset Rate Limiter
 * Prevents brute force attacks on password reset
 */
const passwordResetLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many password reset requests, try again later",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn("Password reset rate limit exceeded", {
      ip: req.ip,
      email: req.body?.email,
    });
    res.status(429).json({
      success: false,
      message:
        "Too many password reset attempts. Please try again in 15 minutes.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: 900,
    });
  },
});

module.exports = {
  emailVerificationLimit,
  passwordResetLimit,
};
