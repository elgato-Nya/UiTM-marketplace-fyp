/**
 * Shared Analytics Helper Functions
 * Date utilities and calculation helpers used across merchant & platform analytics
 */

/**
 * Get date ranges for analytics periods
 * @param {string} period - 'today', 'week', 'month', 'year'
 * @returns {Object} { start, end, previous } date objects
 */
const getDateRange = (period = "week") => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  let start, end, previous;

  switch (period) {
    case "today":
      start = startOfDay;
      end = endOfDay;
      previous = new Date(startOfDay);
      previous.setDate(previous.getDate() - 1);
      break;

    case "week":
      start = new Date(startOfDay);
      start.setDate(start.getDate() - 6); // Last 7 days including today
      end = endOfDay;
      previous = new Date(start);
      previous.setDate(previous.getDate() - 7);
      break;

    case "month":
      start = new Date(startOfDay);
      start.setDate(start.getDate() - 29); // Last 30 days
      end = endOfDay;
      previous = new Date(start);
      previous.setDate(previous.getDate() - 30);
      break;

    case "year":
      start = new Date(startOfDay);
      start.setDate(start.getDate() - 364); // Last 365 days
      end = endOfDay;
      previous = new Date(start);
      previous.setDate(previous.getDate() - 365);
      break;

    default:
      start = startOfDay;
      end = endOfDay;
      previous = new Date(startOfDay);
      previous.setDate(previous.getDate() - 1);
  }

  return { start, end, previous };
};

/**
 * Calculate percentage growth rate
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {number} Growth rate percentage (e.g., 25.5 for 25.5% growth)
 */
const calculateGrowthRate = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

/**
 * Fill missing dates in trend data with zeros
 * Ensures continuous timeline for charts
 * @param {Array} data - Array of {date, count, revenue}
 * @param {Date} startDate - Period start
 * @param {Date} endDate - Period end
 * @returns {Array} Complete timeline with missing dates filled
 */
const fillMissingDates = (data, startDate, endDate) => {
  const filled = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const existingData = data.find(
      (item) => item.date.toISOString().split("T")[0] === dateStr
    );

    filled.push({
      date: new Date(currentDate),
      count: existingData?.count || 0,
      revenue: existingData?.revenue || 0,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return filled;
};

module.exports = {
  getDateRange,
  calculateGrowthRate,
  fillMissingDates,
};
