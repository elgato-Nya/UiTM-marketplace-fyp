/**
 * Date Utility Functions
 *
 * PURPOSE: Common date formatting and manipulation functions
 * USAGE: Import and use for consistent date handling across the app
 */

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted relative time string
 */
export const formatDistanceToNow = (date) => {
  try {
    const now = new Date();
    const targetDate = typeof date === "string" ? new Date(date) : date;

    if (isNaN(targetDate.getTime())) {
      return "Invalid date";
    }

    const diffInSeconds = Math.floor((now - targetDate) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown";
  }
};

/**
 * Format a date as a readable string (e.g., "Jan 15, 2024")
 * @param {string|Date} date - The date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  try {
    const targetDate = typeof date === "string" ? new Date(date) : date;

    if (isNaN(targetDate.getTime())) {
      return "Invalid date";
    }

    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return new Intl.DateTimeFormat("en-US", defaultOptions).format(targetDate);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown";
  }
};

/**
 * Format a date with time (e.g., "Jan 15, 2024 at 3:30 PM")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  return formatDate(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/**
 * Check if a date is today
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
  try {
    const targetDate = typeof date === "string" ? new Date(date) : date;
    const today = new Date();

    return (
      targetDate.getDate() === today.getDate() &&
      targetDate.getMonth() === today.getMonth() &&
      targetDate.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is within the last N days
 * @param {string|Date} date - The date to check
 * @param {number} days - Number of days to check
 * @returns {boolean} True if the date is within the last N days
 */
export const isWithinLastDays = (date, days) => {
  try {
    const targetDate = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now - targetDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return diffInDays <= days && diffInDays >= 0;
  } catch (error) {
    return false;
  }
};

/**
 * Get start and end dates for a period
 * @param {string} period - "week", "month", or "year"
 * @returns {object} Object with startDate and endDate
 */
export const getPeriodDates = (period) => {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
  };
};
