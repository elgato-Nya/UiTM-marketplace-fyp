/**
 * Checkout Validation Utilities
 *
 * PURPOSE: Centralized validation logic for checkout flow
 * USAGE: Import and use in CheckoutPage or other checkout components
 */

/**
 * Validate checkout form before submission
 *
 * @param {Object} formData - The form data to validate
 * @param {string} formData.selectedAddressId - Selected delivery address ID
 * @param {string} formData.deliveryMethod - Selected delivery method
 * @param {string} formData.paymentMethod - Selected payment method
 * @param {boolean} formData.cardReady - Whether Stripe card element is ready
 * @param {Object} session - Checkout session data
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateCheckoutForm = (formData, session) => {
  const errors = {};
  const { selectedAddressId, deliveryMethod, paymentMethod, cardReady } =
    formData;

  // Address validation
  if (!selectedAddressId) {
    errors.address = "Please select a delivery address";
  }

  // Delivery method validation
  if (!deliveryMethod) {
    errors.delivery = "Please select a delivery method";
  }

  // Payment method validation
  if (!paymentMethod) {
    errors.payment = "Please select a payment method";
  }

  // Cash on Delivery (COD) specific validations
  if (paymentMethod === "cash_on_delivery") {
    if (deliveryMethod !== "cash_on_delivery") {
      errors.payment = "Cash on Delivery payment requires COD delivery method";
    }

    const totalAmount = session?.pricing?.totalAmount || 0;
    if (totalAmount > 500) {
      errors.payment =
        "Cash on Delivery is not available for orders over RM 500";
    }
  }

  // Card payment validation
  if (paymentMethod === "card" && !cardReady) {
    errors.payment = "Please enter valid card details";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Constants for validation
 */
export const VALIDATION_CONSTANTS = {
  COD_LIMIT: 500, // Maximum amount for Cash on Delivery in RM
  PAYMENT_METHODS: {
    CARD: "card",
    FPX: "fpx",
    COD: "cash_on_delivery",
  },
  DELIVERY_METHODS: {
    STANDARD: "standard",
    EXPRESS: "express",
    COD: "cash_on_delivery",
  },
};

/**
 * Check if COD is allowed for given amount
 *
 * @param {number} amount - Total amount
 * @returns {boolean}
 */
export const isCodAllowed = (amount) => {
  return amount <= VALIDATION_CONSTANTS.COD_LIMIT;
};

/**
 * Check if payment method matches delivery method for COD
 *
 * @param {string} paymentMethod
 * @param {string} deliveryMethod
 * @returns {boolean}
 */
export const isCodMethodsMatching = (paymentMethod, deliveryMethod) => {
  if (paymentMethod === VALIDATION_CONSTANTS.PAYMENT_METHODS.COD) {
    return deliveryMethod === VALIDATION_CONSTANTS.DELIVERY_METHODS.COD;
  }
  return true; // Other payment methods don't have this requirement
};

/**
 * Get user-friendly error message for validation errors
 *
 * @param {string} errorKey - Error key (e.g., 'address', 'payment')
 * @param {Object} context - Additional context for error message
 * @returns {string}
 */
export const getValidationErrorMessage = (errorKey, context = {}) => {
  const messages = {
    address: "Please select a delivery address",
    delivery: "Please select a delivery method",
    payment: "Please select a payment method",
    cardNotReady: "Please enter valid card details",
    codLimit: `Cash on Delivery is not available for orders over RM ${context.limit || 500}`,
    codMethodMismatch: "Cash on Delivery payment requires COD delivery method",
    sessionExpired: "Your checkout session has expired. Please try again.",
    paymentFailed: "Payment confirmation failed. Please try again.",
    stripeNotLoaded: "Payment system is not ready. Please refresh the page.",
  };

  return messages[errorKey] || "Validation error occurred";
};
