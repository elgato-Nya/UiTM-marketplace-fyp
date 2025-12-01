const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const { createValidationError } = require("../utils/errors");
const logger = require("../utils/logger");

/** Number of salt rounds for bcrypt */
const SALT_ROUNDS = 12;

/**
 * Generates a cryptographically secure random token.
 * @param {number} length - Length in bytes.
 * @returns {string} Hex string token.
 */
const generateRandomToken = (length = 32) => {
  if (typeof length !== "number" || length <= 0) {
    logger.error("Invalid token length", {
      action: "generate_random_token",
      length,
    });
    throw createValidationError("Token length must be a positive number");
  }
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Hashes a token using bcrypt.
 * @param {string} token
 * @returns {Promise<string>} Hashed token.
 */
const hashToken = async (token) => {
  if (typeof token !== "string" || !token) {
    logger.error("Invalid token for hashing", {
      action: "hash_token",
      token,
    });
    throw createValidationError("Token must be a non-empty string");
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(token, salt);
};

/**
 * Compares a plain token to a hashed token.
 * @param {string} token
 * @param {string} hashedToken
 * @returns {Promise<boolean>}
 */
const compareToken = async (token, hashedToken) => {
  if (typeof token !== "string" || typeof hashedToken !== "string") {
    logger.error("Invalid token or hashedToken", {
      action: "compare_token",
      token,
      hashedToken,
    });
    throw createValidationError("Both token and hashedToken must be strings");
  }
  return await bcrypt.compare(token, hashedToken);
};

/**
 * Generates a token with an expiry date.
 * @param {number} length - Length in bytes of the token.
 * @param {number} expiresIn - Expiry time in minutes (default: 15).
 * @returns {{token: string, expiresAt: Date}}
 */
const generateTokenWithExpiry = (length = 32, expiresInMinutes = 15) => {
  const token = generateRandomToken(length);
  const expiryDate = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  return { token, expiresAt: expiryDate };
};

/**
 * Parses expiry string to milliseconds.
 * @param {string} expiry - e.g. "1h", "30m"
 * @returns {number}
 */
const parseTimeToMs = (time) => {
  if (typeof time !== "string" || time.length < 2) {
    logger.error("Invalid time format", {
      action: "parse_time_to_ms",
      time,
    });
    throw createValidationError("Expiry must be a string like '1h', '30m'", {
      action: "parse_time_to_ms",
      time,
    });
  }
  const timeValue = parseInt(time.slice(0, -1), 10);
  const timeUnit = time.slice(-1);
  if (isNaN(timeValue) || timeValue <= 0) {
    logger.error("Invalid time value in expiry", {
      action: "parse_time_to_ms",
      time,
    });
    throw createValidationError("Invalid time value in expiry", {
      action: "parse_time_to_ms",
      time,
    });
  }
  switch (timeUnit) {
    case "s":
      return timeValue * 1000;
    case "m":
      return timeValue * 60 * 1000;
    case "h":
      return timeValue * 60 * 60 * 1000;
    case "d":
      return timeValue * 24 * 60 * 60 * 1000;
    default:
      throw new Error("Invalid time unit in expiry");
  }
};

const tokenService = {
  generateRandomToken,
  hashToken,
  compareToken,
  generateTokenWithExpiry,
  parseTimeToMs,
};

module.exports = tokenService;
