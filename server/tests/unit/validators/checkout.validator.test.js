const {
  CheckoutValidator,
  checkoutErrorMessages,
} = require("../../../validators/checkout/checkout.validator");
const {
  DeliveryMethod,
  PaymentMethod,
} = require("../../../utils/enums/order.enum");

describe("Checkout Validator - Unit Tests", () => {
  describe("isValidMongoId", () => {
    it("should accept valid MongoDB ObjectIds", () => {
      const validIds = [
        "507f1f77bcf86cd799439011",
        "5f8d0d55b54764421b7156c9",
        "6123456789abcdef01234567",
        "000000000000000000000000",
        "ffffffffffffffffffffffff",
        "FFFFFFFFFFFFFFFFFFFFFFFF",
        "AbCdEf0123456789AbCdEf01",
      ];

      validIds.forEach((id) => {
        expect(CheckoutValidator.isValidMongoId(id)).toBe(true);
      });
    });

    it("should reject invalid ObjectIds", () => {
      const invalidIds = [
        "507f1f77bcf86cd79943901g", // Invalid char
        "", // Empty
        null,
        undefined,
        {}, // Object
        "not-an-id", // Invalid string
      ];

      invalidIds.forEach((id) => {
        expect(CheckoutValidator.isValidMongoId(id)).toBe(false);
      });
    });

    it("should accept numbers as valid (mongoose behavior)", () => {
      // mongoose.Types.ObjectId.isValid() returns true for numbers
      expect(CheckoutValidator.isValidMongoId(123)).toBe(true);
      expect(CheckoutValidator.isValidMongoId(1)).toBe(true);
    });
  });

  describe("isValidListingId", () => {
    it("should accept valid listing IDs", () => {
      const validIds = [
        "507f1f77bcf86cd799439011",
        "5f8d0d55b54764421b7156c9",
        "6123456789abcdef01234567",
      ];

      validIds.forEach((id) => {
        expect(CheckoutValidator.isValidListingId(id)).toBe(true);
      });
    });

    it("should reject invalid listing IDs", () => {
      const invalidIds = [
        "invalid",
        "507f1f77bcf86cd79943901", // Too short
        "", // Empty
        null,
        undefined,
      ];

      invalidIds.forEach((id) => {
        expect(CheckoutValidator.isValidListingId(id)).toBe(false);
      });
    });
  });

  describe("isValidSessionId", () => {
    it("should accept valid session IDs", () => {
      const validIds = [
        "507f1f77bcf86cd799439011",
        "5f8d0d55b54764421b7156c9",
        "6123456789abcdef01234567",
      ];

      validIds.forEach((id) => {
        expect(CheckoutValidator.isValidSessionId(id)).toBe(true);
      });
    });

    it("should reject invalid session IDs", () => {
      const invalidIds = [
        "invalid",
        "507f1f77bcf86cd79943901g", // Invalid char
        "", // Empty
        null,
        undefined,
        {}, // Object
      ];

      invalidIds.forEach((id) => {
        expect(CheckoutValidator.isValidSessionId(id)).toBe(false);
      });
    });

    it("should accept numbers as valid (mongoose behavior)", () => {
      expect(CheckoutValidator.isValidSessionId(123)).toBe(true);
    });
  });

  describe("isValidQuantity", () => {
    it("should accept valid quantities", () => {
      const validQuantities = [1, 5, 10, 50, 100];

      validQuantities.forEach((qty) => {
        expect(CheckoutValidator.isValidQuantity(qty)).toBe(true);
      });
    });

    it("should reject invalid quantities", () => {
      const invalidQuantities = [
        0, // Zero
        -1, // Negative
        101, // Exceeds max (100)
        200, // Way exceeds max
        1.5, // Float
        "5", // String
        null,
        undefined,
        NaN,
        Infinity,
      ];

      invalidQuantities.forEach((qty) => {
        expect(CheckoutValidator.isValidQuantity(qty)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(CheckoutValidator.isValidQuantity(1)).toBe(true); // Min
      expect(CheckoutValidator.isValidQuantity(100)).toBe(true); // Max
      expect(CheckoutValidator.isValidQuantity(101)).toBe(false); // Just over max
      expect(CheckoutValidator.isValidQuantity(0)).toBe(false); // Zero
    });
  });

  describe("isValidDeliveryMethod", () => {
    it("should accept valid delivery methods", () => {
      const validMethods = [
        DeliveryMethod.SELF_PICKUP, // "self_pickup"
        DeliveryMethod.DELIVERY, // "delivery"
        DeliveryMethod.MEETUP, // "meetup"
        DeliveryMethod.CAMPUS_DELIVERY, // "campus_delivery"
        DeliveryMethod.ROOM_DELIVERY, // "room_delivery"
        "self_pickup",
        "delivery",
        "meetup",
        "campus_delivery",
        "room_delivery",
      ];

      validMethods.forEach((method) => {
        expect(CheckoutValidator.isValidDeliveryMethod(method)).toBe(true);
      });
    });

    it("should reject invalid delivery methods", () => {
      const invalidMethods = [
        "invalid_method",
        "pickup", // Not in enum (it's "self_pickup")
        "personal_delivery", // Not in enum
        "ship",
        "",
        null,
        undefined,
        123,
        {},
        [],
        true,
      ];

      invalidMethods.forEach((method) => {
        expect(CheckoutValidator.isValidDeliveryMethod(method)).toBe(false);
      });
    });

    it("should handle case sensitivity correctly", () => {
      // Enum values are lowercase, should match exactly
      expect(CheckoutValidator.isValidDeliveryMethod("SELF_PICKUP")).toBe(
        false
      );
      expect(CheckoutValidator.isValidDeliveryMethod("self_pickup")).toBe(true);
      expect(CheckoutValidator.isValidDeliveryMethod("Self_Pickup")).toBe(
        false
      );
    });
  });

  describe("isValidPaymentMethod", () => {
    it("should accept valid payment methods", () => {
      const validMethods = [
        PaymentMethod.COD, // "cod"
        PaymentMethod.BANK_TRANSFER, // "bank_transfer"
        PaymentMethod.E_WALLET, // "e_wallet"
        PaymentMethod.CREDIT_CARD, // "credit_card"
        "COD_CONFIRMED", // PaymentStatus key
        "PAID", // PaymentStatus key
        "cod",
        "bank_transfer",
      ];

      validMethods.forEach((method) => {
        expect(CheckoutValidator.isValidPaymentMethod(method)).toBe(true);
      });
    });

    it("should reject invalid payment methods", () => {
      const invalidMethods = [
        "stripe", // Not in enum
        "invalid_payment",
        "cash",
        "",
        null,
        undefined,
        123,
        {},
      ];

      invalidMethods.forEach((method) => {
        expect(CheckoutValidator.isValidPaymentMethod(method)).toBe(false);
      });
    });
  });

  describe("isValidDeliveryAddress", () => {
    it("should validate pickup methods (pickup details required)", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

      const validPickupAddress = {
        recipientName: "John Doe",
        recipientPhone: "0123456789",
        pickupDetails: {
          location: "Main Gate Entrance",
          specialInstructions: "Call when arrived",
          pickupTime: futureDate.toISOString(),
        },
      };

      expect(
        CheckoutValidator.isValidDeliveryAddress(
          DeliveryMethod.SELF_PICKUP,
          validPickupAddress
        )
      ).toBe(true);
      expect(
        CheckoutValidator.isValidDeliveryAddress(
          DeliveryMethod.MEETUP,
          validPickupAddress
        )
      ).toBe(true);
    });

    it("should validate campus delivery with valid address", () => {
      const validCampusAddress = {
        recipientName: "John Doe",
        recipientPhone: "0123456789",
        campusAddress: {
          campus: "SHAH_ALAM",
          building: "Block A",
          floor: "3",
          room: "301",
        },
      };

      expect(
        CheckoutValidator.isValidDeliveryAddress(
          DeliveryMethod.CAMPUS_DELIVERY,
          validCampusAddress
        )
      ).toBe(true);
      expect(
        CheckoutValidator.isValidDeliveryAddress(
          DeliveryMethod.ROOM_DELIVERY,
          validCampusAddress
        )
      ).toBe(true);
    });

    it("should validate personal delivery with valid address", () => {
      const validPersonalAddress = {
        recipientName: "Jane Smith",
        recipientPhone: "0198765432",
        personalAddress: {
          addressLine1: "123 Main St",
          city: "Shah Alam",
          postcode: "40000",
          state: "SELANGOR",
        },
      };

      expect(
        CheckoutValidator.isValidDeliveryAddress(
          DeliveryMethod.DELIVERY,
          validPersonalAddress
        )
      ).toBe(true);
    });

    it("should reject invalid delivery method", () => {
      expect(
        CheckoutValidator.isValidDeliveryAddress("invalid_method", {})
      ).toBe(false);
    });

    it("should reject null/empty addresses for methods that require address", () => {
      expect(
        CheckoutValidator.isValidDeliveryAddress(DeliveryMethod.DELIVERY, null)
      ).toBe(false);
      expect(
        CheckoutValidator.isValidDeliveryAddress(
          DeliveryMethod.CAMPUS_DELIVERY,
          {}
        )
      ).toBe(false);
    });
  });

  describe("checkPaymentMethodAllowed", () => {
    it("should allow COD for amounts <= RM 500", () => {
      const validAmounts = [1, 50, 100, 250, 499.99, 500];

      validAmounts.forEach((amount) => {
        const result = CheckoutValidator.checkPaymentMethodAllowed(
          PaymentMethod.COD,
          amount
        );
        expect(result.allowed).toBe(true);
        expect(result.reason).toBeUndefined();
      });
    });

    it("should reject COD for amounts > RM 500", () => {
      const invalidAmounts = [500.01, 501, 600, 1000, 9999];

      invalidAmounts.forEach((amount) => {
        const result = CheckoutValidator.checkPaymentMethodAllowed(
          PaymentMethod.COD,
          amount
        );
        expect(result.allowed).toBe(false);
        expect(result.reason).toBeDefined();
        expect(result.reason).toContain("500");
      });
    });

    it("should allow Stripe-processed payment methods for any amount", () => {
      const amounts = [0.01, 1, 100, 500, 500.01, 1000, 9999];
      // These methods are processed through Stripe gateway
      const methods = [
        PaymentMethod.BANK_TRANSFER, // "bank_transfer"
        PaymentMethod.CREDIT_CARD, // "credit_card"
        PaymentMethod.E_WALLET, // "e_wallet" (GrabPay, etc)
      ];

      methods.forEach((method) => {
        amounts.forEach((amount) => {
          const result = CheckoutValidator.checkPaymentMethodAllowed(
            method,
            amount
          );
          expect(result.allowed).toBe(true);
          expect(result.reason).toBeUndefined();
        });
      });
    });

    it("should reject invalid payment method", () => {
      const result = CheckoutValidator.checkPaymentMethodAllowed(
        "invalid_method",
        100
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("Invalid payment method");
    });

    it("should reject 'stripe' as it's a gateway not a payment method", () => {
      // "stripe" is the payment gateway, not a payment method
      // Valid methods are: cod, bank_transfer, credit_card, e_wallet
      const result = CheckoutValidator.checkPaymentMethodAllowed("stripe", 100);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("Invalid payment method");
    });

    it("should handle edge cases", () => {
      // Exactly RM 500 with COD should be allowed
      const exactly500 = CheckoutValidator.checkPaymentMethodAllowed(
        PaymentMethod.COD,
        500
      );
      expect(exactly500.allowed).toBe(true);

      // Just over RM 500 with COD should be rejected
      const justOver500 = CheckoutValidator.checkPaymentMethodAllowed(
        PaymentMethod.COD,
        500.01
      );
      expect(justOver500.allowed).toBe(false);
    });

    it("should handle case sensitivity", () => {
      // Lowercase "cod" is valid (from enum)
      const result = CheckoutValidator.checkPaymentMethodAllowed("cod", 100);
      expect(result.allowed).toBe(true);

      // Uppercase "COD" is invalid (not in enum values or status keys)
      const result2 = CheckoutValidator.checkPaymentMethodAllowed("COD", 100);
      expect(result2.allowed).toBe(false);
    });
  });

  describe("isValidCheckoutItem", () => {
    it("should accept valid checkout items", () => {
      const validItems = [
        { listingId: "507f1f77bcf86cd799439011", quantity: 1 },
        { listingId: "5f8d0d55b54764421b7156c9", quantity: 10 },
        { listingId: "6123456789abcdef01234567", quantity: 100 },
      ];

      validItems.forEach((item) => {
        expect(CheckoutValidator.isValidCheckoutItem(item)).toBe(true);
      });
    });

    it("should reject items with invalid listing IDs", () => {
      const invalidItems = [
        { listingId: "invalid", quantity: 1 },
        { listingId: "507f1f77", quantity: 5 }, // Too short
        { listingId: null, quantity: 1 },
        { listingId: undefined, quantity: 1 },
      ];

      invalidItems.forEach((item) => {
        expect(CheckoutValidator.isValidCheckoutItem(item)).toBe(false);
      });
    });

    it("should reject items with invalid quantities", () => {
      const invalidItems = [
        { listingId: "507f1f77bcf86cd799439011", quantity: 0 },
        { listingId: "507f1f77bcf86cd799439011", quantity: -1 },
        { listingId: "507f1f77bcf86cd799439011", quantity: 101 },
        { listingId: "507f1f77bcf86cd799439011", quantity: 1.5 },
        { listingId: "507f1f77bcf86cd799439011", quantity: "5" },
      ];

      invalidItems.forEach((item) => {
        expect(CheckoutValidator.isValidCheckoutItem(item)).toBe(false);
      });
    });

    it("should reject non-object inputs", () => {
      const invalidInputs = [null, undefined, "string", 123, [], true];

      invalidInputs.forEach((input) => {
        expect(CheckoutValidator.isValidCheckoutItem(input)).toBe(false);
      });
    });

    it("should reject items missing required properties", () => {
      const invalidItems = [
        { listingId: "507f1f77bcf86cd799439011" }, // Missing quantity
        { quantity: 5 }, // Missing listingId
        {}, // Missing both
      ];

      invalidItems.forEach((item) => {
        expect(CheckoutValidator.isValidCheckoutItem(item)).toBe(false);
      });
    });
  });

  describe("isValidSessionStatus", () => {
    it("should accept valid session statuses", () => {
      const validStatuses = [
        "pending",
        "payment_pending",
        "completed",
        "expired",
        "cancelled",
        "PENDING", // Case insensitive
        "Completed",
        "EXPIRED",
      ];

      validStatuses.forEach((status) => {
        expect(CheckoutValidator.isValidSessionStatus(status)).toBe(true);
      });
    });

    it("should reject invalid session statuses", () => {
      const invalidStatuses = [
        "invalid_status",
        "processing",
        "shipped",
        "",
        null,
        undefined,
        123,
        {},
        [],
      ];

      invalidStatuses.forEach((status) => {
        expect(CheckoutValidator.isValidSessionStatus(status)).toBe(false);
      });
    });
  });

  describe("isValidSessionType", () => {
    it("should accept valid session types", () => {
      const validTypes = [
        "cart",
        "direct",
        "CART", // Case insensitive
        "Direct",
        "DIRECT",
      ];

      validTypes.forEach((type) => {
        expect(CheckoutValidator.isValidSessionType(type)).toBe(true);
      });
    });

    it("should reject invalid session types", () => {
      const invalidTypes = [
        "invalid_type",
        "checkout",
        "purchase",
        "",
        null,
        undefined,
        123,
        {},
      ];

      invalidTypes.forEach((type) => {
        expect(CheckoutValidator.isValidSessionType(type)).toBe(false);
      });
    });
  });

  describe("isValidAddressId", () => {
    it("should accept valid address IDs", () => {
      const validIds = [
        "507f1f77bcf86cd799439011",
        "5f8d0d55b54764421b7156c9",
        "6123456789abcdef01234567",
      ];

      validIds.forEach((id) => {
        expect(CheckoutValidator.isValidAddressId(id)).toBe(true);
      });
    });

    it("should accept null/undefined (optional field)", () => {
      expect(CheckoutValidator.isValidAddressId(null)).toBe(true);
      expect(CheckoutValidator.isValidAddressId(undefined)).toBe(true);
      expect(CheckoutValidator.isValidAddressId("")).toBe(true);
    });

    it("should reject invalid address IDs", () => {
      const invalidIds = [
        "invalid",
        "507f1f77bcf86cd79943901g", // Invalid char
        {}, // Object
        [], // Array
      ];

      invalidIds.forEach((id) => {
        expect(CheckoutValidator.isValidAddressId(id)).toBe(false);
      });
    });

    it("should accept numbers as valid (mongoose behavior)", () => {
      expect(CheckoutValidator.isValidAddressId(123)).toBe(true);
    });
  });

  describe("checkoutErrorMessages", () => {
    it("should have all required error message categories", () => {
      expect(checkoutErrorMessages).toHaveProperty("session");
      expect(checkoutErrorMessages).toHaveProperty("sessionId");
      expect(checkoutErrorMessages).toHaveProperty("listingId");
      expect(checkoutErrorMessages).toHaveProperty("quantity");
      expect(checkoutErrorMessages).toHaveProperty("deliveryMethod");
      expect(checkoutErrorMessages).toHaveProperty("deliveryAddress");
      expect(checkoutErrorMessages).toHaveProperty("paymentMethod");
      expect(checkoutErrorMessages).toHaveProperty("addressId");
      expect(checkoutErrorMessages).toHaveProperty("items");
      expect(checkoutErrorMessages).toHaveProperty("payment");
      expect(checkoutErrorMessages).toHaveProperty("cart");
      expect(checkoutErrorMessages).toHaveProperty("listing");
      expect(checkoutErrorMessages).toHaveProperty("stock");
      expect(checkoutErrorMessages).toHaveProperty("validation");
    });

    it("should have session messages", () => {
      expect(checkoutErrorMessages.session).toHaveProperty("required");
      expect(checkoutErrorMessages.session).toHaveProperty("notFound");
      expect(checkoutErrorMessages.session).toHaveProperty("expired");
      expect(checkoutErrorMessages.session).toHaveProperty("invalid");
      expect(checkoutErrorMessages.session).toHaveProperty("alreadyCompleted");
      expect(checkoutErrorMessages.session).toHaveProperty("notModifiable");
    });

    it("should have payment method messages", () => {
      expect(checkoutErrorMessages.paymentMethod).toHaveProperty("required");
      expect(checkoutErrorMessages.paymentMethod).toHaveProperty("invalid");
      expect(checkoutErrorMessages.paymentMethod).toHaveProperty("notAllowed");
      expect(checkoutErrorMessages.paymentMethod).toHaveProperty(
        "codLimitExceeded"
      );
      expect(checkoutErrorMessages.paymentMethod.codLimitExceeded).toContain(
        "500"
      );
    });

    it("should have delivery address messages", () => {
      expect(checkoutErrorMessages.deliveryAddress).toHaveProperty("required");
      expect(checkoutErrorMessages.deliveryAddress).toHaveProperty("invalid");
      expect(checkoutErrorMessages.deliveryAddress).toHaveProperty(
        "recipientNameRequired"
      );
      expect(checkoutErrorMessages.deliveryAddress).toHaveProperty(
        "recipientPhoneRequired"
      );
    });

    it("should have payment messages", () => {
      expect(checkoutErrorMessages.payment).toHaveProperty(
        "intentCreationFailed"
      );
      expect(checkoutErrorMessages.payment).toHaveProperty("intentNotFound");
      expect(checkoutErrorMessages.payment).toHaveProperty(
        "stripeNotConfigured"
      );
      expect(checkoutErrorMessages.payment).toHaveProperty("invalidAmount");
    });

    it("should have items messages", () => {
      expect(checkoutErrorMessages.items).toHaveProperty("required");
      expect(checkoutErrorMessages.items).toHaveProperty("invalid");
      expect(checkoutErrorMessages.items).toHaveProperty("unavailable");
      expect(checkoutErrorMessages.items).toHaveProperty("insufficientStock");
    });

    it("should have descriptive error messages", () => {
      expect(checkoutErrorMessages.session.expired.length).toBeGreaterThan(20);
      expect(
        checkoutErrorMessages.paymentMethod.codLimitExceeded.length
      ).toBeGreaterThan(20);
      expect(checkoutErrorMessages.cart.empty.length).toBeGreaterThan(20);
    });
  });
});
