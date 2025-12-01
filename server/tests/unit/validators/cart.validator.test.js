const {
  CartValidator,
  cartErrorMessages,
} = require("../../../validators/cart/cart.validator");
const { CartLimits } = require("../../../utils/enums/cart.enum");

describe("Cart Validator - Unit Tests", () => {
  describe("isValidQuantity", () => {
    it("should accept valid quantities", () => {
      const validQuantities = [1, 5, 10, 50, CartLimits.MAX_QUANTITY_PER_ITEM];

      validQuantities.forEach((qty) => {
        expect(CartValidator.isValidQuantity(qty)).toBe(true);
      });
    });

    it("should reject invalid quantities", () => {
      const invalidQuantities = [
        0, // Zero
        -1, // Negative
        -100, // Large negative
        CartLimits.MAX_QUANTITY_PER_ITEM + 1, // Exceeds max
        CartLimits.MAX_QUANTITY_PER_ITEM + 100, // Way exceeds max
        1.5, // Float
        10.99, // Float
        "5", // String
        "10", // String
        null, // Null
        undefined, // Undefined
        {}, // Object
        [], // Array
        true, // Boolean
        NaN, // NaN
        Infinity, // Infinity
      ];

      invalidQuantities.forEach((qty) => {
        expect(CartValidator.isValidQuantity(qty)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(CartValidator.isValidQuantity(1)).toBe(true); // Min value
      expect(
        CartValidator.isValidQuantity(CartLimits.MAX_QUANTITY_PER_ITEM)
      ).toBe(true); // Max value
      expect(
        CartValidator.isValidQuantity(CartLimits.MAX_QUANTITY_PER_ITEM + 1)
      ).toBe(false); // Just over max
      expect(CartValidator.isValidQuantity(0)).toBe(false); // Zero boundary
    });
  });

  describe("isValidCartItemCount", () => {
    it("should accept valid item counts", () => {
      const validCounts = [0, 1, 5, 10, 25, CartLimits.MAX_ITEMS];

      validCounts.forEach((count) => {
        expect(CartValidator.isValidCartItemCount(count)).toBe(true);
      });
    });

    it("should reject invalid item counts", () => {
      const invalidCounts = [
        CartLimits.MAX_ITEMS + 1, // Exceeds max
        CartLimits.MAX_ITEMS + 100, // Way exceeds max
        1.5, // Float
        "5", // String
        null, // Null
        undefined, // Undefined
        {}, // Object
        [], // Array
        NaN, // NaN
        Infinity, // Infinity
      ];

      invalidCounts.forEach((count) => {
        expect(CartValidator.isValidCartItemCount(count)).toBe(false);
      });
    });

    it("should reject negative numbers", () => {
      expect(CartValidator.isValidCartItemCount(-1)).toBe(false);
      expect(CartValidator.isValidCartItemCount(-10)).toBe(false);
      expect(CartValidator.isValidCartItemCount(-100)).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(CartValidator.isValidCartItemCount(0)).toBe(true); // Empty cart
      expect(CartValidator.isValidCartItemCount(CartLimits.MAX_ITEMS)).toBe(
        true
      ); // Max items
      expect(CartValidator.isValidCartItemCount(CartLimits.MAX_ITEMS + 1)).toBe(
        false
      ); // Just over max
    });
  });

  describe("isValidListingId", () => {
    it("should accept valid MongoDB ObjectIds", () => {
      const validIds = [
        "507f1f77bcf86cd799439011",
        "5f8d0d55b54764421b7156c9",
        "6123456789abcdef01234567",
        "000000000000000000000000", // All zeros
        "ffffffffffffffffffffffff", // All f's
        "FFFFFFFFFFFFFFFFFFFFFFFF", // Uppercase
        "AbCdEf0123456789AbCdEf01", // Mixed case
      ];

      validIds.forEach((id) => {
        expect(CartValidator.isValidListingId(id)).toBe(true);
      });
    });

    it("should reject invalid listing IDs", () => {
      const invalidIds = [
        "507f1f77bcf86cd79943901", // Too short (23 chars)
        "507f1f77bcf86cd7994390111", // Too long (25 chars)
        "507f1f77bcf86cd79943901g", // Invalid char 'g'
        "507f1f77bcf86cd79943901!", // Special char
        "507f1f77bcf86cd79943901 ", // Contains space
        "", // Empty string
        " ", // Just space
        null, // Null
        undefined, // Undefined
        123, // Number
        {}, // Object
        [], // Array
        true, // Boolean
      ];

      invalidIds.forEach((id) => {
        expect(CartValidator.isValidListingId(id)).toBe(false);
      });
    });

    it("should handle mixed case hex strings", () => {
      expect(CartValidator.isValidListingId("507f1f77BCF86cd799439011")).toBe(
        true
      );
      expect(CartValidator.isValidListingId("507F1F77BCF86CD799439011")).toBe(
        true
      );
      expect(CartValidator.isValidListingId("abcdef0123456789ABCDEF01")).toBe(
        true
      );
    });
  });

  describe("isQuantityAvailable", () => {
    it("should accept valid quantity-stock combinations", () => {
      const validCombinations = [
        [1, 1], // Exact match
        [1, 10], // Plenty of stock
        [5, 10], // Half the stock
        [10, 10], // Exact match
        [0, 0], // Both zero (edge case)
        [0, 10], // Zero quantity (valid business case)
      ];

      validCombinations.forEach(([qty, stock]) => {
        expect(CartValidator.isQuantityAvailable(qty, stock)).toBe(true);
      });
    });

    it("should reject when quantity exceeds stock", () => {
      const invalidCombinations = [
        [2, 1], // Exceeds by 1
        [10, 5], // Exceeds by half
        [100, 10], // Way exceeds
        [1, 0], // No stock
      ];

      invalidCombinations.forEach(([qty, stock]) => {
        expect(CartValidator.isQuantityAvailable(qty, stock)).toBe(false);
      });
    });

    it("should reject invalid input types", () => {
      const invalidInputs = [
        ["1", 10], // String quantity
        [1, "10"], // String stock
        ["5", "10"], // Both strings
        [1.5, 10], // Float quantity
        [1, 10.5], // Float stock
        [null, 10], // Null quantity
        [1, null], // Null stock
        [undefined, 10], // Undefined quantity
        [1, undefined], // Undefined stock
        [{}, 10], // Object quantity
        [1, {}], // Object stock
      ];

      invalidInputs.forEach(([qty, stock]) => {
        expect(CartValidator.isQuantityAvailable(qty, stock)).toBe(false);
      });
    });

    it("should reject negative stock", () => {
      expect(CartValidator.isQuantityAvailable(1, -1)).toBe(false);
      expect(CartValidator.isQuantityAvailable(5, -10)).toBe(false);
      expect(CartValidator.isQuantityAvailable(0, -1)).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(CartValidator.isQuantityAvailable(0, 0)).toBe(true); // Both zero
      expect(CartValidator.isQuantityAvailable(0, 100)).toBe(true); // Zero qty with stock
      expect(CartValidator.isQuantityAvailable(100, 100)).toBe(true); // Max match
    });
  });

  describe("isListingAvailable", () => {
    it("should accept available listings", () => {
      const availableListings = [
        { isAvailable: true },
        { isAvailable: true, name: "Test", price: 100 },
        { isAvailable: true, stock: 10, seller: "user123" },
      ];

      availableListings.forEach((listing) => {
        expect(CartValidator.isListingAvailable(listing)).toBe(true);
      });
    });

    it("should reject unavailable listings", () => {
      const unavailableListings = [
        { isAvailable: false }, // Explicitly false
        { isAvailable: null }, // Null value
        { isAvailable: undefined }, // Undefined value
        { isAvailable: 0 }, // Falsy number
        { isAvailable: "" }, // Empty string
        { isAvailable: "false" }, // String 'false' (truthy!)
        { isAvailable: "true" }, // String 'true' (not boolean true)
        {}, // Missing property
        { name: "Test", price: 100 }, // No isAvailable property
      ];

      unavailableListings.forEach((listing) => {
        expect(CartValidator.isListingAvailable(listing)).toBe(false);
      });
    });

    it("should reject invalid input types", () => {
      const invalidInputs = [null, undefined, "string", 123, [], true, false];

      invalidInputs.forEach((input) => {
        expect(CartValidator.isListingAvailable(input)).toBe(false);
      });
    });

    it("should strictly check for boolean true", () => {
      // Only boolean true should pass
      expect(CartValidator.isListingAvailable({ isAvailable: true })).toBe(
        true
      );

      // Truthy values that are not boolean true should fail
      expect(CartValidator.isListingAvailable({ isAvailable: 1 })).toBe(false);
      expect(CartValidator.isListingAvailable({ isAvailable: "true" })).toBe(
        false
      );
      expect(CartValidator.isListingAvailable({ isAvailable: "yes" })).toBe(
        false
      );
    });
  });

  describe("isCartNotEmpty", () => {
    it("should accept non-empty arrays", () => {
      const nonEmptyArrays = [
        [1],
        [1, 2, 3],
        [{ id: "1" }],
        [{ id: "1" }, { id: "2" }],
        ["item1", "item2"],
        [null, null], // Contains items (even if null)
      ];

      nonEmptyArrays.forEach((arr) => {
        expect(CartValidator.isCartNotEmpty(arr)).toBe(true);
      });
    });

    it("should reject empty arrays", () => {
      expect(CartValidator.isCartNotEmpty([])).toBe(false);
    });

    it("should reject non-array inputs", () => {
      const nonArrayInputs = [
        null,
        undefined,
        "string",
        123,
        { length: 5 }, // Object with length property (not array)
        true,
        false,
        {},
      ];

      nonArrayInputs.forEach((input) => {
        expect(CartValidator.isCartNotEmpty(input)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(CartValidator.isCartNotEmpty([undefined])).toBe(true); // Contains one undefined
      expect(CartValidator.isCartNotEmpty([null])).toBe(true); // Contains one null
      expect(CartValidator.isCartNotEmpty([0])).toBe(true); // Contains one zero
      expect(CartValidator.isCartNotEmpty([false])).toBe(true); // Contains one false
    });
  });

  describe("cartErrorMessages", () => {
    it("should have all required error message categories", () => {
      expect(cartErrorMessages).toHaveProperty("userId");
      expect(cartErrorMessages).toHaveProperty("quantity");
      expect(cartErrorMessages).toHaveProperty("listingId");
      expect(cartErrorMessages).toHaveProperty("cart");
      expect(cartErrorMessages).toHaveProperty("item");
      expect(cartErrorMessages).toHaveProperty("listing");
      expect(cartErrorMessages).toHaveProperty("stock");
    });

    it("should have userId messages", () => {
      expect(cartErrorMessages.userId).toHaveProperty("required");
      expect(typeof cartErrorMessages.userId.required).toBe("string");
    });

    it("should have quantity messages", () => {
      expect(cartErrorMessages.quantity).toHaveProperty("required");
      expect(cartErrorMessages.quantity).toHaveProperty("invalid");
      expect(cartErrorMessages.quantity).toHaveProperty("exceedsStock");
      expect(cartErrorMessages.quantity.invalid).toContain(
        String(CartLimits.MAX_QUANTITY_PER_ITEM)
      );
    });

    it("should have listingId messages", () => {
      expect(cartErrorMessages.listingId).toHaveProperty("required");
      expect(cartErrorMessages.listingId).toHaveProperty("invalid");
    });

    it("should have cart messages", () => {
      expect(cartErrorMessages.cart).toHaveProperty("notFound");
      expect(cartErrorMessages.cart).toHaveProperty("limitReached");
      expect(cartErrorMessages.cart).toHaveProperty("empty");
      expect(cartErrorMessages.cart.limitReached).toContain(
        String(CartLimits.MAX_ITEMS)
      );
    });

    it("should have item messages", () => {
      expect(cartErrorMessages.item).toHaveProperty("notFound");
      expect(cartErrorMessages.item).toHaveProperty("alreadyExists");
      expect(cartErrorMessages.item).toHaveProperty("unavailable");
    });

    it("should have listing messages", () => {
      expect(cartErrorMessages.listing).toHaveProperty("notFound");
      expect(cartErrorMessages.listing).toHaveProperty("unavailable");
    });

    it("should have stock messages", () => {
      expect(cartErrorMessages.stock).toHaveProperty("insufficient");
      expect(cartErrorMessages.stock).toHaveProperty("exceedsAvailable");
    });

    it("should contain proper limit values in messages", () => {
      expect(cartErrorMessages.quantity.invalid).toMatch(/\d+/);
      expect(cartErrorMessages.cart.limitReached).toMatch(/\d+/);
    });
  });
});
