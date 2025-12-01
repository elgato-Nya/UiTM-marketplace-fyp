const {
  DeliveryMethod,
  PaymentMethod,
} = require("../../utils/enums/order.enum");
const { UserValidator, AddressValidator } = require("../user");
const { CartValidator } = require("../cart/cart.validator");
const { OrderValidator } = require("../order/order.validator");

const {
  isValidCampusDetails,
  isValidPersonalDetails,
  isValidPickupDetails,
  isValidRecipientName,
} = AddressValidator;

const { isValidMongoId } = UserValidator;

/**
 * Checkout Validator
 *
 * PURPOSE: Pure validation logic for checkout operations
 * PATTERN: Following your OrderValidator and CartValidator patterns
 * SCOPE: Business rules, reusable validation functions
 */
class CheckoutValidator {
  /**
   * Validate MongoDB ObjectId format
   * @param {string} id - ID to validate
   * @returns {boolean}
   * NOTE: Reuses UserValidator.isValidMongoId for consistency
   */
  static isValidMongoId(id) {
    return isValidMongoId(id);
  }

  /**
   * Validate listing ID format
   * @param {string} listingId - Listing ID to validate
   * @returns {boolean}
   * NOTE: Reuses CartValidator.isValidListingId for consistency
   */
  static isValidListingId(listingId) {
    return CartValidator.isValidListingId(listingId);
  }

  /**
   * Validate session ID format
   * @param {string} sessionId - Session ID to validate
   * @returns {boolean}
   */
  static isValidSessionId(sessionId) {
    return isValidMongoId(sessionId);
  }

  /**
   * Validate quantity value
   * @param {number} quantity - Quantity to validate
   * @returns {boolean}
   */
  static isValidQuantity(quantity) {
    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return false;
    }
    return quantity > 0 && quantity <= 100;
  }

  /**
   * Validate delivery method value
   * @param {string} deliveryMethod - Delivery method to validate
   * @returns {boolean}
   * NOTE: Validates against DeliveryMethod enum (same logic as OrderValidator)
   */
  static isValidDeliveryMethod(deliveryMethod) {
    if (!deliveryMethod || typeof deliveryMethod !== "string") return false;
    return Object.values(DeliveryMethod).includes(deliveryMethod);
  }

  /**
   * Validate payment method value
   * @param {string} paymentMethod - Payment method to validate
   * @returns {boolean}
   * NOTE: Reuses OrderValidator.isValidPaymentMethod for consistency
   */
  static isValidPaymentMethod(paymentMethod) {
    return OrderValidator.isValidPaymentMethod(paymentMethod);
  }

  /**
   * Validate delivery address based on delivery method
   * @param {string} deliveryMethod - Delivery method
   * @param {Object} deliveryAddress - Address object
   * @returns {boolean}
   * NOTE: Reuses OrderValidator.isValidDeliveryDetails for consistency
   */
  static isValidDeliveryAddress(deliveryMethod, deliveryAddress) {
    return OrderValidator.isValidDeliveryDetails(
      deliveryMethod,
      deliveryAddress
    );
  }

  /**
   * Validate payment method is allowed for given amount
   * @param {string} paymentMethod - Payment method
   * @param {number} totalAmount - Total amount
   * @returns {Object} { allowed: boolean, reason?: string }
   */
  static checkPaymentMethodAllowed(paymentMethod, totalAmount) {
    if (!CheckoutValidator.isValidPaymentMethod(paymentMethod)) {
      return {
        allowed: false,
        reason: "Invalid payment method",
      };
    }

    const normalizedMethod = paymentMethod.toLowerCase();

    // COD: Allowed only for amounts <= RM 500
    if (normalizedMethod === PaymentMethod.COD) {
      if (totalAmount > 500) {
        return {
          allowed: false,
          reason:
            "Cash on Delivery is only available for orders up to RM 500. Please use online payment.",
        };
      }
    }

    // All other payment methods (credit_card, bank_transfer, e_wallet) have no restrictions
    // These are processed through Stripe gateway
    return { allowed: true };
  }

  /**
   * Validate checkout items structure (for direct checkout)
   * @param {Object} item - Item object with listingId and quantity
   * @returns {boolean}
   * NOTE: Uses CartValidator for listingId, CheckoutValidator for quantity (has different max)
   */
  static isValidCheckoutItem(item) {
    if (!item || typeof item !== "object") return false;

    return (
      CartValidator.isValidListingId(item.listingId) &&
      CheckoutValidator.isValidQuantity(item.quantity)
    );
  }

  /**
   * Validate session status
   * @param {string} status - Session status
   * @returns {boolean}
   */
  static isValidSessionStatus(status) {
    const validStatuses = [
      "pending",
      "payment_pending",
      "completed",
      "expired",
      "cancelled",
    ];
    if (!status || typeof status !== "string") return false;
    return validStatuses.includes(status.toLowerCase());
  }

  /**
   * Validate session type
   * @param {string} sessionType - Session type
   * @returns {boolean}
   */
  static isValidSessionType(sessionType) {
    const validTypes = ["cart", "direct"];
    if (!sessionType || typeof sessionType !== "string") return false;
    return validTypes.includes(sessionType.toLowerCase());
  }

  /**
   * Validate address ID format (optional field)
   * @param {string} addressId - Address ID
   * @returns {boolean}
   */
  static isValidAddressId(addressId) {
    // Address ID is optional, so null/undefined is valid
    if (!addressId) return true;
    return isValidMongoId(addressId);
  }
}

/**
 * Checkout Error Messages
 *
 * PURPOSE: Centralized error messages for checkout validation
 * PATTERN: Following orderErrorMessages and cartErrorMessages patterns
 */
const checkoutErrorMessages = {
  session: {
    required: "Checkout session is required",
    notFound: "Checkout session not found",
    expired: "Checkout session has expired. Please create a new checkout.",
    invalid: "Invalid checkout session",
    alreadyCompleted: "Checkout session is already completed",
    notModifiable: "Cannot modify checkout session in current status",
  },
  sessionId: {
    required: "Session ID is required",
    invalid: "Invalid session ID format",
  },
  listingId: {
    required: "Listing ID is required",
    invalid: "Invalid listing ID format",
  },
  quantity: {
    required: "Quantity is required",
    invalid: "Quantity must be a positive integer between 1 and 100",
    exceedsStock: "Requested quantity exceeds available stock",
  },
  deliveryMethod: {
    required: "Delivery method is required",
    invalid: "Invalid delivery method",
  },
  deliveryAddress: {
    required: "Delivery address is required for selected delivery method",
    invalid: "Invalid delivery address for selected delivery method",
    recipientNameRequired: "Recipient name is required",
    recipientPhoneRequired: "Recipient phone number is required",
  },
  paymentMethod: {
    required: "Payment method is required",
    invalid: "Invalid payment method",
    notAllowed: "Selected payment method is not allowed for this order amount",
    codLimitExceeded:
      "Cash on Delivery is only available for orders up to RM 500",
  },
  addressId: {
    invalid: "Invalid address ID format",
  },
  items: {
    required: "At least one item is required for checkout",
    invalid: "Invalid checkout items structure",
    unavailable: "Some items are no longer available",
    insufficientStock: "Insufficient stock for some items",
  },
  payment: {
    intentCreationFailed: "Failed to create payment intent",
    intentNotFound: "Payment intent not found",
    stripeNotConfigured: "Stripe payment is not configured on this server",
    invalidAmount: "Invalid payment amount",
  },
  cart: {
    notFound: "Cart not found",
    empty: "Cart is empty. Please add items before checkout.",
  },
  listing: {
    notFound: "Listing not found",
    unavailable: "Listing is currently unavailable",
  },
  stock: {
    reservationFailed: "Failed to reserve stock for items",
    insufficientStock: "Insufficient stock available",
  },
  validation: {
    failed: "Checkout validation failed",
    itemsValidationFailed: "Some items failed validation",
  },
};

module.exports = { CheckoutValidator, checkoutErrorMessages };
