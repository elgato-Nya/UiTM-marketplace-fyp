const {
  WishlistValidator,
  wishlistErrorMessages,
} = require("../../../validators/wishlist/wishlist.validator");
const { MAX_WISHLIST_ITEMS } = require("../../../utils/enums/cart.enum");

describe("Wishlist Validator - Unit Tests", () => {
  describe("isValidWishlistLimit", () => {
    it("should accept valid item counts", () => {
      const validCounts = [0, 1, 5, 10, 25, 50, MAX_WISHLIST_ITEMS];

      validCounts.forEach((count) => {
        expect(WishlistValidator.isValidWishlistLimit(count)).toBe(true);
      });
    });

    it("should reject counts exceeding limit", () => {
      const invalidCounts = [
        MAX_WISHLIST_ITEMS + 1,
        MAX_WISHLIST_ITEMS + 10,
        MAX_WISHLIST_ITEMS + 100,
        1000,
        9999,
      ];

      invalidCounts.forEach((count) => {
        expect(WishlistValidator.isValidWishlistLimit(count)).toBe(false);
      });
    });

    it("should reject invalid input types", () => {
      const invalidInputs = [
        1.5, // Float
        10.99, // Float
        "5", // String
        null, // Null
        undefined, // Undefined
        {}, // Object
        [], // Array
        true, // Boolean
        NaN, // NaN
        Infinity, // Infinity
      ];

      invalidInputs.forEach((input) => {
        expect(WishlistValidator.isValidWishlistLimit(input)).toBe(false);
      });
    });

    it("should reject negative numbers", () => {
      expect(WishlistValidator.isValidWishlistLimit(-1)).toBe(false);
      expect(WishlistValidator.isValidWishlistLimit(-10)).toBe(false);
      expect(WishlistValidator.isValidWishlistLimit(-100)).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(WishlistValidator.isValidWishlistLimit(0)).toBe(true); // Empty wishlist
      expect(WishlistValidator.isValidWishlistLimit(MAX_WISHLIST_ITEMS)).toBe(
        true
      ); // Max items
      expect(
        WishlistValidator.isValidWishlistLimit(MAX_WISHLIST_ITEMS + 1)
      ).toBe(false); // Just over max
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
        expect(WishlistValidator.isValidListingId(id)).toBe(true);
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
        expect(WishlistValidator.isValidListingId(id)).toBe(false);
      });
    });

    it("should handle mixed case hex strings", () => {
      expect(
        WishlistValidator.isValidListingId("507f1f77BCF86cd799439011")
      ).toBe(true);
      expect(
        WishlistValidator.isValidListingId("507F1F77BCF86CD799439011")
      ).toBe(true);
      expect(
        WishlistValidator.isValidListingId("abcdef0123456789ABCDEF01")
      ).toBe(true);
    });
  });

  describe("isWishlistNotEmpty", () => {
    it("should accept non-empty arrays", () => {
      const nonEmptyArrays = [
        [1],
        [1, 2, 3],
        [{ listingId: "507f1f77bcf86cd799439011" }],
        [
          { listingId: "507f1f77bcf86cd799439011" },
          { listingId: "5f8d0d55b54764421b7156c9" },
        ],
        ["item1", "item2"],
        [null, null], // Contains items (even if null)
      ];

      nonEmptyArrays.forEach((arr) => {
        expect(WishlistValidator.isWishlistNotEmpty(arr)).toBe(true);
      });
    });

    it("should reject empty arrays", () => {
      expect(WishlistValidator.isWishlistNotEmpty([])).toBe(false);
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
        expect(WishlistValidator.isWishlistNotEmpty(input)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(WishlistValidator.isWishlistNotEmpty([undefined])).toBe(true); // Contains one undefined
      expect(WishlistValidator.isWishlistNotEmpty([null])).toBe(true); // Contains one null
      expect(WishlistValidator.isWishlistNotEmpty([0])).toBe(true); // Contains one zero
      expect(WishlistValidator.isWishlistNotEmpty([false])).toBe(true); // Contains one false
    });
  });

  describe("isValidPrice", () => {
    it("should accept valid prices", () => {
      const validPrices = [
        0, // Free item (valid business case)
        0.01, // Smallest price
        1,
        10,
        99.99,
        100.5,
        1000,
        9999.99,
        0.0, // Explicit zero
      ];

      validPrices.forEach((price) => {
        expect(WishlistValidator.isValidPrice(price)).toBe(true);
      });
    });

    it("should reject negative prices", () => {
      const negativePrices = [-0.01, -1, -10, -99.99, -1000];

      negativePrices.forEach((price) => {
        expect(WishlistValidator.isValidPrice(price)).toBe(false);
      });
    });

    it("should reject invalid input types", () => {
      const invalidInputs = [
        "10", // String
        "99.99", // String
        null, // Null
        undefined, // Undefined
        {}, // Object
        [], // Array
        true, // Boolean
        false, // Boolean
        NaN, // NaN
      ];

      invalidInputs.forEach((input) => {
        expect(WishlistValidator.isValidPrice(input)).toBe(false);
      });
    });

    it("should handle special numeric values", () => {
      expect(WishlistValidator.isValidPrice(Infinity)).toBe(true); // Infinity is >= 0
      expect(WishlistValidator.isValidPrice(-Infinity)).toBe(false); // -Infinity is < 0
      expect(WishlistValidator.isValidPrice(0)).toBe(true); // Zero boundary
    });

    it("should handle floating point precision", () => {
      expect(WishlistValidator.isValidPrice(0.1 + 0.2)).toBe(true); // 0.30000000000000004
      expect(WishlistValidator.isValidPrice(99.99)).toBe(true);
      expect(WishlistValidator.isValidPrice(19.99)).toBe(true);
    });
  });

  describe("wishlistErrorMessages", () => {
    it("should have all required error message categories", () => {
      expect(wishlistErrorMessages).toHaveProperty("userId");
      expect(wishlistErrorMessages).toHaveProperty("listingId");
      expect(wishlistErrorMessages).toHaveProperty("listing");
      expect(wishlistErrorMessages).toHaveProperty("wishlist");
      expect(wishlistErrorMessages).toHaveProperty("priceWhenAdded");
      expect(wishlistErrorMessages).toHaveProperty("item");
      expect(wishlistErrorMessages).toHaveProperty("stock");
    });

    it("should have userId messages", () => {
      expect(wishlistErrorMessages.userId).toHaveProperty("required");
      expect(typeof wishlistErrorMessages.userId.required).toBe("string");
    });

    it("should have listingId messages", () => {
      expect(wishlistErrorMessages.listingId).toHaveProperty("required");
      expect(wishlistErrorMessages.listingId).toHaveProperty("invalid");
    });

    it("should have listing messages", () => {
      expect(wishlistErrorMessages.listing).toHaveProperty("notFound");
      expect(wishlistErrorMessages.listing).toHaveProperty("unavailable");
      expect(wishlistErrorMessages.listing).toHaveProperty("inCart");
    });

    it("should have wishlist messages", () => {
      expect(wishlistErrorMessages.wishlist).toHaveProperty("notFound");
      expect(wishlistErrorMessages.wishlist).toHaveProperty("limitReached");
      expect(wishlistErrorMessages.wishlist).toHaveProperty("empty");
      expect(wishlistErrorMessages.wishlist.limitReached).toContain(
        String(MAX_WISHLIST_ITEMS)
      );
    });

    it("should have priceWhenAdded messages", () => {
      expect(wishlistErrorMessages.priceWhenAdded).toHaveProperty("required");
      expect(wishlistErrorMessages.priceWhenAdded).toHaveProperty("invalid");
    });

    it("should have item messages", () => {
      expect(wishlistErrorMessages.item).toHaveProperty("alreadyExists");
      expect(wishlistErrorMessages.item).toHaveProperty("notFound");
    });

    it("should have stock messages", () => {
      expect(wishlistErrorMessages.stock).toHaveProperty("insufficient");
    });

    it("should contain proper limit values in messages", () => {
      expect(wishlistErrorMessages.wishlist.limitReached).toMatch(/\d+/);
    });

    it("should have descriptive messages", () => {
      expect(wishlistErrorMessages.listing.inCart.length).toBeGreaterThan(10);
      expect(wishlistErrorMessages.stock.insufficient.length).toBeGreaterThan(
        10
      );
      expect(wishlistErrorMessages.item.alreadyExists.length).toBeGreaterThan(
        10
      );
    });
  });
});
