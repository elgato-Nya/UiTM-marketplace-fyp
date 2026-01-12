/**
 * Stripe Configuration
 *
 * PURPOSE: Central configuration for Stripe payment processing
 * FEATURES: API setup, fee calculations, payment rules, environment detection
 * SECURITY: Secret keys from environment variables only
 */

const Stripe = require("stripe");
const logger = require("../utils/logger");

// Detect environment and key mode
const isProduction = process.env.NODE_ENV === "production";
const secretKey = process.env.STRIPE_SECRET_KEY || "";
const isLiveMode = secretKey.startsWith("sk_live_");
const isTestMode = secretKey.startsWith("sk_test_");

// Initialize Stripe with secret key
let stripe = null;

const initializeStripe = () => {
  if (!secretKey) {
    logger.warn(
      "Stripe secret key not found. Payment processing will be disabled."
    );
    return null;
  }

  // Validation: Warn if using test keys in production
  if (isProduction && isTestMode) {
    logger.warn(
      "⚠️  WARNING: Using Stripe TEST keys in PRODUCTION environment! Switch to LIVE keys for real payments."
    );
  }

  // Validation: Info if using live keys in development
  if (!isProduction && isLiveMode) {
    logger.warn(
      "⚠️  WARNING: Using Stripe LIVE keys in DEVELOPMENT environment! This will process REAL payments."
    );
  }

  try {
    stripe = new Stripe(secretKey, {
      apiVersion: "2024-10-28.acacia",
      typescript: false,
    });

    const mode = isLiveMode ? "🔴 LIVE MODE" : "🟢 TEST MODE";
    logger.info(`Stripe initialized successfully - ${mode}`, {
      environment: process.env.NODE_ENV,
      keyType: isLiveMode ? "LIVE" : "TEST",
    });

    return stripe;
  } catch (error) {
    logger.error("Failed to initialize Stripe:", { error: error.message });
    return null;
  }
};

// Initialize on module load
stripe = initializeStripe();

/**
 * Stripe Configuration Object
 */
const stripeConfig = {
  // Environment
  isProduction,
  isLiveMode,
  isTestMode,

  // API Keys
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  secretKey: secretKey,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Currency
  currency: "myr",
  country: "MY",

  // Payment Rules
  minimumAmount: parseFloat(process.env.STRIPE_MINIMUM_AMOUNT) || 10.0, // RM 10.00
  minimumAmountCents: parseInt(process.env.STRIPE_MINIMUM_AMOUNT_CENTS) || 1000, // 1000 cents = RM 10

  // Fee Structure - Tiered Platform Fees
  platformFees: {
    tier1: {
      // RM 0.01 - RM 9.99 (COD only, online payment blocked)
      minAmount: 0.01,
      maxAmount: 9.99,
      percentage: 0, // No fee for COD
      allowOnlinePayment: false,
    },
    tier2: {
      // RM 10.00 - RM 49.99
      minAmount: 10.0,
      maxAmount: 49.99,
      percentage: 3, // 3% platform fee
      allowOnlinePayment: true,
    },
    tier3: {
      // RM 50.00+
      minAmount: 50.0,
      maxAmount: Infinity,
      percentage: 5, // 5% platform fee
      allowOnlinePayment: true,
    },
  },

  // Stripe Fee Structure (Malaysia)
  stripeFees: {
    percentage: 2.9, // 2.9%
    fixedAmount: 1.5, // RM 1.50
  },

  // Payout Settings
  payoutSchedule: {
    interval: "daily",
    delay_days: 2,
  },

  // Session Settings
  checkoutSessionTTL: 600, // 10 minutes in seconds
  stockReservationTTL: 600, // 10 minutes in seconds

  // Webhook retry settings
  webhookRetry: {
    maxAttempts: 3,
    retryDelay: 5000, // 5 seconds
  },
};

// TODO: move below functions to a separate helper file
/**
 * Calculate platform fee based on amount tier
 * @param {Number} amount - Order amount in MYR
 * @returns {Object} Fee details
 */
const calculatePlatformFee = (amount) => {
  const { platformFees } = stripeConfig;

  let tier = null;
  if (amount >= platformFees.tier3.minAmount) {
    tier = platformFees.tier3;
  } else if (amount >= platformFees.tier2.minAmount) {
    tier = platformFees.tier2;
  } else if (amount >= platformFees.tier1.minAmount) {
    tier = platformFees.tier1;
  }

  if (!tier) {
    return {
      platformFee: 0,
      platformFeePercentage: 0,
      allowOnlinePayment: false,
      tier: "none",
    };
  }

  const platformFee = (amount * tier.percentage) / 100;

  return {
    platformFee: parseFloat(platformFee.toFixed(2)),
    platformFeePercentage: tier.percentage,
    allowOnlinePayment: tier.allowOnlinePayment,
    tier: `tier${
      tier === platformFees.tier1 ? 1 : tier === platformFees.tier2 ? 2 : 3
    }`,
  };
};

/**
 * Calculate Stripe fee
 * @param {Number} amount - Order amount in MYR
 * @returns {Number} Stripe fee
 */
const calculateStripeFee = (amount) => {
  const { stripeFees } = stripeConfig;
  const fee = (amount * stripeFees.percentage) / 100 + stripeFees.fixedAmount;
  return parseFloat(fee.toFixed(2));
};

/**
 * Calculate all fees and breakdown
 * @param {Number} subtotal - Order subtotal
 * @param {Number} shippingFee - Shipping fee
 * @returns {Object} Complete fee breakdown
 */
const calculateFeeBreakdown = (subtotal, shippingFee = 0) => {
  const totalAmount = subtotal + shippingFee;

  // Platform fee
  const platformFeeData = calculatePlatformFee(totalAmount);

  // Stripe fee (only for online payments)
  const stripeFee = platformFeeData.allowOnlinePayment
    ? calculateStripeFee(totalAmount)
    : 0;

  // Seller receives
  const sellerReceives = totalAmount - platformFeeData.platformFee - stripeFee;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    shippingFee: parseFloat(shippingFee.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    platformFee: platformFeeData.platformFee,
    platformFeePercentage: platformFeeData.platformFeePercentage,
    stripeFee: parseFloat(stripeFee.toFixed(2)),
    sellerReceives: parseFloat(sellerReceives.toFixed(2)),
    allowOnlinePayment: platformFeeData.allowOnlinePayment,
    tier: platformFeeData.tier,
  };
};

/**
 * Convert MYR to cents for Stripe
 * @param {Number} amount - Amount in MYR
 * @returns {Number} Amount in cents
 */
const convertToCents = (amount) => {
  return Math.round(amount * 100);
};

/**
 * Convert cents to MYR
 * @param {Number} cents - Amount in cents
 * @returns {Number} Amount in MYR
 */
const convertToMYR = (cents) => {
  return parseFloat((cents / 100).toFixed(2));
};

/**
 * Check if Stripe is initialized and ready
 * @returns {Boolean}
 */
const isStripeReady = () => {
  return stripe !== null;
};

/**
 * Get Stripe instance
 * @returns {Stripe|null}
 */
const getStripe = () => {
  if (!stripe) {
    logger.warn("Stripe not initialized. Attempting to initialize...");
    stripe = initializeStripe();
  }
  return stripe;
};

/**
 * Get Stripe mode information
 * @returns {Object} { isLive: boolean, isTest: boolean, environment: string }
 */
const getStripeMode = () => {
  return {
    isLive: isLiveMode,
    isTest: isTestMode,
    environment: isProduction ? "production" : "development",
    mode: isLiveMode ? "LIVE" : "TEST",
  };
};

module.exports = {
  stripe: getStripe(),
  stripeConfig,
  calculatePlatformFee,
  calculateStripeFee,
  calculateFeeBreakdown,
  convertToCents,
  convertToMYR,
  isStripeReady,
  getStripe,
  getStripeMode,
  initializeStripe,
};
