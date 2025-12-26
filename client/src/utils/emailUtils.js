/**
 * Email Utility Functions
 *
 * PURPOSE: Common email-related utilities
 * FEATURES:
 * - Check if email is UiTM domain
 * - Extract domain from email
 */

/**
 * Check if email is from UiTM domain
 * @param {string} email - Email address to check
 * @returns {boolean} True if email is UiTM domain
 *
 * @example
 * isUiTMEmail("student@uitm.edu.my") // true
 * isUiTMEmail("user@gmail.com") // false
 */
export const isUiTMEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return /^[a-zA-Z0-9]+@[\w.-]*\.?uitm\.edu\.my$/.test(email.toLowerCase());
};

/**
 * Extract domain from email address
 * @param {string} email - Email address
 * @returns {string} Domain part of email or empty string
 *
 * @example
 * getEmailDomain("user@gmail.com") // "gmail.com"
 * getEmailDomain("invalid") // ""
 */
export const getEmailDomain = (email) => {
  if (!email || typeof email !== "string") return "";
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
export const isValidEmailFormat = (email) => {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
};

export default {
  isUiTMEmail,
  getEmailDomain,
  isValidEmailFormat,
};
