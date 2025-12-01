/**
 * Analytics Constants
 * Centralized configuration for analytics features
 */

// Period options for analytics filtering
export const PERIODS = {
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
};

export const PERIOD_LABELS = {
  [PERIODS.WEEK]: "Last 7 Days",
  [PERIODS.MONTH]: "Last 30 Days",
  [PERIODS.YEAR]: "Last 12 Months",
};

// Chart colors for consistent theming
export const CHART_COLORS = {
  primary: "#1976d2",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
  purple: "#9c27b0",
  teal: "#009688",
  orange: "#ff9800",
};

// Status colors
export const STATUS_COLORS = {
  pending: CHART_COLORS.warning,
  confirmed: CHART_COLORS.info,
  completed: CHART_COLORS.success,
  cancelled: CHART_COLORS.error,
};

// Format currency
export const formatCurrency = (amount, currency = "MYR") => {
  if (amount === null || amount === undefined) return "MYR 0.00";

  const formatter = new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return "0%";

  const formatted = Number(value).toFixed(decimals);
  return `${formatted}%`;
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";

  return new Intl.NumberFormat("ms-MY").format(num);
};

// Get trend direction
export const getTrendDirection = (value) => {
  if (value === null || value === undefined) return "neutral";
  return value > 0 ? "up" : value < 0 ? "down" : "neutral";
};

// Get trend color
export const getTrendColor = (value) => {
  const direction = getTrendDirection(value);
  return direction === "up"
    ? "success"
    : direction === "down"
      ? "error"
      : "default";
};

// Date format options
export const DATE_FORMATS = {
  SHORT: "dd MMM",
  MEDIUM: "dd MMM yyyy",
  LONG: "dd MMMM yyyy",
  TIME: "HH:mm",
  DATETIME: "dd MMM yyyy, HH:mm",
};
