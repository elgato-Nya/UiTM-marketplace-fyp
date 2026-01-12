const {
  DeliveryMethod,
  PaymentMethod,
  PaymentStatus,
} = require("../../utils/enums/order.enum");
const { UserValidator, AddressValidator } = require("../user");

const { isValidMongoId, isValidUsername, isValidEmail, isValidPhoneNumber } =
  UserValidator;
const {
  isValidRecipientName,
  isValidCampusAddress,
  isValidCampusDetails,
  isValidPersonalAddress,
  isValidPersonalDetails,
  isValidPickupDetails,
} = AddressValidator;

class OrderValidator {
  static isValidOrderNumber(orderNumber) {
    if (typeof orderNumber !== "string") return false;
    const parts = orderNumber.split("-");
    if (parts.length !== 3) return false;

    // Check prefix
    if (parts[0] !== "ORD") return false;

    // Check date part
    const datePart = parts[1];
    if (!/^\d{8}$/.test(datePart)) return false;
    const year = parseInt(datePart.slice(0, 4));
    const month = parseInt(datePart.slice(4, 6));
    const day = parseInt(datePart.slice(6, 8));

    // Validate date components
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;

    // Use UTC dates to avoid timezone issues
    const date = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed in Date constructor
    const today = new Date();

    // Verify the date is actually valid (handles invalid dates like Feb 30)
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return false;
    }

    // Remove time for comparison (use UTC)
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
    if (date > todayUTC) return false;

    // Check random string part
    const randomPart = parts[2];
    if (!/^[A-Z0-9]{6}$/.test(randomPart)) return false;

    return true;
  }

  static isValidBuyerInfo(buyer) {
    if (!buyer || typeof buyer !== "object") return false;
    const { userId, username, email, phone } = buyer;
    return (
      isValidMongoId(userId) &&
      isValidUsername(username) &&
      isValidEmail(email) &&
      isValidPhoneNumber(phone)
    );
  }

  static isValidSellerInfo(seller) {
    if (!seller || typeof seller !== "object") return false;
    const { userId, name, email, phone } = seller;
    return (
      isValidMongoId(userId) &&
      isValidRecipientName(name) &&
      isValidEmail(email) &&
      isValidPhoneNumber(phone)
    );
  }

  static isValidTotalAmounts(
    itemsTotal,
    shippingFee,
    totalDiscount,
    totalAmount
  ) {
    const calculated = itemsTotal + shippingFee - totalDiscount;
    return Math.abs(calculated - totalAmount) < 0.01; // Allow for floating point errors
  }

  // Alias for compatibility with tests
  static isValidAmounts(itemsTotal, shippingFee, totalDiscount, totalAmount) {
    return this.isValidTotalAmounts(
      itemsTotal,
      shippingFee,
      totalDiscount,
      totalAmount
    );
  }

  /**
   * Validate status transition
   * Enterprise marketplace pattern: Allow flexible status transitions
   * - Sellers can skip intermediate steps for efficiency
   * - Example: confirmed -> completed (for in-person pickup orders)
   */
  static isValidStatusTransition(currentStatus, newStatus) {
    const transitions = {
      // Pending: Can confirm, process directly, or cancel
      pending: ["confirmed", "processing", "cancelled"],
      // Confirmed: Can process, ship directly, or even complete (for pickup), or cancel
      confirmed: ["processing", "shipped", "completed", "cancelled"],
      // Processing: Can ship, deliver directly, complete, or cancel
      processing: ["shipped", "delivered", "completed", "cancelled"],
      // Shipped: Can mark delivered or complete
      shipped: ["delivered", "completed"],
      // Delivered: Can complete
      delivered: ["completed"],
      // Terminal states
      completed: [],
      cancelled: [],
      refunded: [],
    };

    return transitions[currentStatus]?.includes(newStatus) || false;
  }

  static isValidOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0) return false;

    return items.every((item) => {
      // For order creation, we only need listingId and quantity
      // Other details are fetched from the listing in the service
      return (
        isValidMongoId(item.listingId) &&
        OrderValidator.isValidQuantity(item.quantity)
      );
    });
  }

  static isValidQuantity(quantity) {
    return Number.isInteger(quantity) && quantity > 0;
  }

  static isValidDiscount(discount, price) {
    return typeof discount === "number" && discount >= 0 && discount <= price;
  }

  static isValidPaymentMethod(paymentMethod) {
    if (!paymentMethod || typeof paymentMethod !== "string") return false;
    const validMethod = [
      ...Object.values(PaymentMethod),
      ...Object.keys(PaymentStatus),
    ];
    return validMethod.includes(paymentMethod);
  }

  static isValidPaymentStatus(paymentStatus) {
    if (!paymentStatus || typeof paymentStatus !== "string") return false;
    const validStatuses = [
      ...Object.values(PaymentStatus),
      ...Object.keys(PaymentStatus),
    ];
    return validStatuses.includes(paymentStatus);
  }

  // Below are used in validation middleware
  static isValidDeliveryDetails(deliveryMethod, deliveryAddress) {
    if (
      !deliveryMethod ||
      typeof deliveryMethod !== "string" ||
      !deliveryAddress ||
      typeof deliveryAddress !== "object"
    ) {
      return false;
    }

    if (!Object.values(DeliveryMethod).includes(deliveryMethod)) return false;

    // Validate recipient details first
    if (!isValidRecipientName(deliveryAddress.recipientName)) return false;
    if (!isValidPhoneNumber(deliveryAddress.recipientPhone)) return false;

    switch (deliveryMethod) {
      case DeliveryMethod.CAMPUS_DELIVERY:
      case DeliveryMethod.ROOM_DELIVERY:
        return isValidCampusDetails(deliveryAddress.campusAddress);
      case DeliveryMethod.DELIVERY:
        return isValidPersonalDetails(deliveryAddress.personalAddress);
      case DeliveryMethod.MEETUP:
      case DeliveryMethod.SELF_PICKUP:
        return isValidPickupDetails(deliveryAddress.pickupDetails);
      default:
        return false;
    }
  }

  static isValidEndDate(startDate, endDate) {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    return end >= start;
  }
}

const orderErrorMessages = {
  orderNumber: {
    required: "Order number is required",
    unique: "Order number must be unique",
    invalid: "Invalid order number format",
  },
  buyer: {
    required: "Buyer information is required",
    invalid: "Invalid buyer information structure",
  },
  seller: {
    required: "Seller information is required",
    invalid: "Invalid seller information structure",
  },
  requiredId: {
    buyer: "Buyer ID is required",
    seller: "Seller ID is required",
    listing: "Listing ID is required",
  },
  items: {
    required: "Order must contain at least one item",
    invalid:
      "Invalid order items structure - each item must have listingId and valid quantity",
    empty: "Order items cannot be empty",
  },
  quantity: {
    required: "Quantity is required",
    invalid: "Quantity must be a whole number greater than 0",
  },
  deliveryAddress: {
    required: "Delivery address is required",
    invalid: "Delivery address details are invalid for the chosen method",
  },
  deliveryMethod: {
    required: "Delivery method is required",
    invalid: "Invalid delivery method",
  },
  paymentMethod: {
    required: "Payment method is required",
    invalid: "Invalid payment method",
  },
  paymentStatus: {
    required: "Payment status is required",
    invalid: "Invalid payment status",
  },
  status: {
    required: "Order status is required",
    invalid: "Invalid order status",
    invalidTransition: "Invalid status transition",
  },
  cancelReason: {
    required: "Cancellation reason is required",
    invalid: "Invalid cancellation reason",
  },
  itemsTotal: {
    required: "Items total amount is required",
    negative: "Items total cannot be negative",
  },
  shippingFee: {
    required: "Shipping fee is required",
    negative: "Shipping fee cannot be negative",
  },
  discount: {
    negative: "Discount cannot be negative",
    exceedsTotal:
      "Discount cannot exceed the sum of items total and shipping fee",
    exceedsPrice: "Discount cannot exceed item price",
  },
  amounts: {
    required: "Total amount is required",
    calculationError:
      "Total amount calculation doesn't match individual amounts",
    negative: "Amounts cannot be negative",
    invalid: "Invalid pricing structure",
  },
  notes: {
    invalid: "Notes must be a string not exceeding 250 characters",
  },
};

module.exports = { OrderValidator, orderErrorMessages };
