const rateLimit = require("express-rate-limit");

const emailVerificationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts per window
  message: "Too many verification requests, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: "Too many password reset requests, try again later",
});

module.exports = {
  emailVerificationLimit,
  passwordResetLimit,
};
