/**
 * VARIANT VALIDATOR UNIT TESTS
 *
 * PURPOSE: Test variant and quote settings validation functions
 * PATTERN: Follows cart.validator.test.js structure
 * COVERAGE: All variant and quote validation methods in ListingValidator
 */

const {
  ListingValidator,
  listingErrorMessages,
} = require("../../../validators/listing/listing.validator");
const {
  VariantLimits,
  QuoteLimits,
  QuoteFieldType,
} = require("../../../utils/enums/listing.enum");

describe("Variant Validator - Unit Tests", () => {
  // ==================== isValidVariantName ====================
  describe("isValidVariantName", () => {
    it("should accept valid variant names", () => {
      const validNames = [
        "Red",
        "Large",
        "Red - Large",
        "5-Session Package",
        "Cotton - White - XL",
        "A", // Min length
        "a".repeat(VariantLimits.MAX_VARIANT_NAME_LENGTH), // Max length
      ];

      validNames.forEach((name) => {
        expect(ListingValidator.isValidVariantName(name)).toBe(true);
      });
    });

    it("should reject invalid variant names", () => {
      const invalidNames = [
        "", // Empty string
        "   ", // Only whitespace
        null,
        undefined,
        123, // Number
        {}, // Object
        [], // Array
        true, // Boolean
        "a".repeat(VariantLimits.MAX_VARIANT_NAME_LENGTH + 1), // Exceeds max
      ];

      invalidNames.forEach((name) => {
        expect(ListingValidator.isValidVariantName(name)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(ListingValidator.isValidVariantName("A")).toBe(true); // Min valid
      expect(
        ListingValidator.isValidVariantName(
          "a".repeat(VariantLimits.MAX_VARIANT_NAME_LENGTH)
        )
      ).toBe(true); // Max valid
      expect(
        ListingValidator.isValidVariantName(
          "a".repeat(VariantLimits.MAX_VARIANT_NAME_LENGTH + 1)
        )
      ).toBe(false); // Just over max
    });
  });

  // ==================== isValidSku ====================
  describe("isValidSku", () => {
    it("should accept valid SKUs", () => {
      const validSkus = [
        "SKU123",
        "sku-456",
        "SKU_789",
        "ABC-123_XYZ",
        "a".repeat(VariantLimits.MAX_SKU_LENGTH), // Max length
      ];

      validSkus.forEach((sku) => {
        expect(ListingValidator.isValidSku(sku)).toBe(true);
      });
    });

    it("should accept optional/empty SKU values", () => {
      const optionalValues = [null, undefined, ""];

      optionalValues.forEach((sku) => {
        expect(ListingValidator.isValidSku(sku)).toBe(true);
      });
    });

    it("should reject invalid SKUs", () => {
      const invalidSkus = [
        "SKU 123", // Space
        "SKU@123", // Special char
        "SKU#456", // Special char
        "SKU.789", // Dot
        123, // Number
        {}, // Object
        [], // Array
        true, // Boolean
        "a".repeat(VariantLimits.MAX_SKU_LENGTH + 1), // Exceeds max
      ];

      invalidSkus.forEach((sku) => {
        expect(ListingValidator.isValidSku(sku)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(ListingValidator.isValidSku("A")).toBe(true); // Single char
      expect(
        ListingValidator.isValidSku("a".repeat(VariantLimits.MAX_SKU_LENGTH))
      ).toBe(true); // Max valid
      expect(
        ListingValidator.isValidSku(
          "a".repeat(VariantLimits.MAX_SKU_LENGTH + 1)
        )
      ).toBe(false); // Just over max
      expect(ListingValidator.isValidSku("   ")).toBe(false); // Only whitespace
    });
  });

  // ==================== isValidVariantPrice ====================
  describe("isValidVariantPrice", () => {
    it("should accept valid prices", () => {
      const validPrices = [0, 0.01, 1, 10.5, 99.99, 1000, 999999.99];

      validPrices.forEach((price) => {
        expect(ListingValidator.isValidVariantPrice(price)).toBe(true);
      });
    });

    it("should reject invalid prices", () => {
      const invalidPrices = [
        -1, // Negative
        -0.01, // Small negative
        "10", // String
        "10.00", // String
        null,
        undefined,
        {}, // Object
        [], // Array
        NaN,
        Infinity,
        -Infinity,
      ];

      invalidPrices.forEach((price) => {
        expect(ListingValidator.isValidVariantPrice(price)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(ListingValidator.isValidVariantPrice(0)).toBe(true); // Zero is valid
      expect(ListingValidator.isValidVariantPrice(0.001)).toBe(true); // Small decimal
      expect(ListingValidator.isValidVariantPrice(-0.001)).toBe(false); // Small negative
    });
  });

  // ==================== isValidVariantStock ====================
  describe("isValidVariantStock", () => {
    it("should accept valid stock values", () => {
      const validStocks = [0, 1, 10, 100, 1000, 999999];

      validStocks.forEach((stock) => {
        expect(ListingValidator.isValidVariantStock(stock)).toBe(true);
      });
    });

    it("should reject invalid stock values", () => {
      const invalidStocks = [
        -1, // Negative
        1.5, // Float
        10.99, // Float
        "10", // String
        null,
        undefined,
        {}, // Object
        [], // Array
        NaN,
        Infinity,
      ];

      invalidStocks.forEach((stock) => {
        expect(ListingValidator.isValidVariantStock(stock)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(ListingValidator.isValidVariantStock(0)).toBe(true); // Zero is valid
      expect(ListingValidator.isValidVariantStock(-0)).toBe(true); // -0 equals 0
    });
  });

  // ==================== isValidVariantAttributes ====================
  describe("isValidVariantAttributes", () => {
    it("should accept valid attributes", () => {
      const validAttributes = [
        { color: "Red" },
        { size: "Large", color: "Blue" },
        { duration: "60 minutes", sessions: 5 },
        { material: "Cotton", weight: 150 },
        {}, // Empty object is valid
      ];

      validAttributes.forEach((attrs) => {
        expect(ListingValidator.isValidVariantAttributes(attrs)).toBe(true);
      });
    });

    it("should accept optional/empty values", () => {
      expect(ListingValidator.isValidVariantAttributes(null)).toBe(true);
      expect(ListingValidator.isValidVariantAttributes(undefined)).toBe(true);
    });

    it("should reject invalid attributes", () => {
      const invalidAttributes = [
        "not an object", // String
        123, // Number
        [], // Array
        true, // Boolean
        { key: {} }, // Object value
        { key: [] }, // Array value
        { key: null }, // Null value
        { key: true }, // Boolean value
      ];

      invalidAttributes.forEach((attrs) => {
        expect(ListingValidator.isValidVariantAttributes(attrs)).toBe(false);
      });
    });

    it("should reject attributes exceeding limits", () => {
      // Too many attributes
      const tooManyAttrs = {};
      for (let i = 0; i <= VariantLimits.MAX_ATTRIBUTES_PER_VARIANT; i++) {
        tooManyAttrs[`key${i}`] = "value";
      }
      expect(ListingValidator.isValidVariantAttributes(tooManyAttrs)).toBe(
        false
      );

      // Key too long
      const longKey = "a".repeat(VariantLimits.MAX_ATTRIBUTE_KEY_LENGTH + 1);
      expect(
        ListingValidator.isValidVariantAttributes({ [longKey]: "value" })
      ).toBe(false);

      // Value too long
      const longValue = "a".repeat(
        VariantLimits.MAX_ATTRIBUTE_VALUE_LENGTH + 1
      );
      expect(
        ListingValidator.isValidVariantAttributes({ key: longValue })
      ).toBe(false);
    });

    it("should handle edge cases", () => {
      // Max allowed attributes
      const maxAttrs = {};
      for (let i = 0; i < VariantLimits.MAX_ATTRIBUTES_PER_VARIANT; i++) {
        maxAttrs[`key${i}`] = "value";
      }
      expect(ListingValidator.isValidVariantAttributes(maxAttrs)).toBe(true);

      // Empty key
      expect(ListingValidator.isValidVariantAttributes({ "": "value" })).toBe(
        false
      );
    });
  });

  // ==================== isValidVariantImages ====================
  describe("isValidVariantImages", () => {
    const validImageUrl =
      "https://example-bucket.s3.amazonaws.com/images/test.jpg";

    it("should accept valid image arrays", () => {
      const validArrays = [
        [validImageUrl],
        [validImageUrl, validImageUrl],
        Array(VariantLimits.MAX_VARIANT_IMAGES).fill(validImageUrl), // Max images
        [], // Empty array
      ];

      validArrays.forEach((images) => {
        expect(ListingValidator.isValidVariantImages(images)).toBe(true);
      });
    });

    it("should accept optional/empty values", () => {
      expect(ListingValidator.isValidVariantImages(null)).toBe(true);
      expect(ListingValidator.isValidVariantImages(undefined)).toBe(true);
    });

    it("should reject invalid image arrays", () => {
      const invalidArrays = [
        "not an array", // String
        123, // Number
        {}, // Object
        [123], // Array with non-string
        ["invalid-url"], // Invalid URL format
        Array(VariantLimits.MAX_VARIANT_IMAGES + 1).fill(validImageUrl), // Exceeds max
      ];

      invalidArrays.forEach((images) => {
        expect(ListingValidator.isValidVariantImages(images)).toBe(false);
      });
    });
  });

  // ==================== isValidVariant ====================
  describe("isValidVariant", () => {
    const validProductVariant = {
      name: "Red - Large",
      price: 50.0,
      stock: 100,
      isAvailable: true,
    };

    const validServiceVariant = {
      name: "5-Session Package",
      price: 150.0,
      isAvailable: true,
    };

    it("should accept valid product variants", () => {
      expect(
        ListingValidator.isValidVariant(validProductVariant, "product")
      ).toBe(true);

      // With optional fields
      const withOptionals = {
        ...validProductVariant,
        sku: "SKU-001",
        attributes: { color: "Red", size: "Large" },
        images: ["https://example.s3.amazonaws.com/img.jpg"],
      };
      expect(ListingValidator.isValidVariant(withOptionals, "product")).toBe(
        true
      );
    });

    it("should accept valid service variants", () => {
      expect(
        ListingValidator.isValidVariant(validServiceVariant, "service")
      ).toBe(true);

      // Service without stock
      const serviceNoStock = {
        name: "Basic Package",
        price: 100.0,
      };
      expect(ListingValidator.isValidVariant(serviceNoStock, "service")).toBe(
        true
      );
    });

    it("should reject product variants without stock", () => {
      const noStock = {
        name: "Red - Large",
        price: 50.0,
      };
      expect(ListingValidator.isValidVariant(noStock, "product")).toBe(false);
    });

    it("should reject variants without required fields", () => {
      // Missing name
      expect(
        ListingValidator.isValidVariant({ price: 50, stock: 10 }, "product")
      ).toBe(false);

      // Missing price
      expect(
        ListingValidator.isValidVariant({ name: "Test", stock: 10 }, "product")
      ).toBe(false);
    });

    it("should reject invalid variant types", () => {
      const invalidTypes = [null, undefined, "", 123, [], true];

      invalidTypes.forEach((variant) => {
        expect(ListingValidator.isValidVariant(variant, "product")).toBe(false);
      });
    });

    it("should reject variants with invalid isAvailable", () => {
      const invalidIsAvailable = {
        ...validProductVariant,
        isAvailable: "yes", // Should be boolean
      };
      expect(
        ListingValidator.isValidVariant(invalidIsAvailable, "product")
      ).toBe(false);
    });
  });

  // ==================== isValidVariantsArray ====================
  describe("isValidVariantsArray", () => {
    const validVariant = {
      name: "Red - Large",
      price: 50.0,
      stock: 100,
    };

    it("should accept valid variants array", () => {
      expect(
        ListingValidator.isValidVariantsArray([validVariant], "product")
      ).toBe(true);
      expect(
        ListingValidator.isValidVariantsArray(
          [validVariant, { ...validVariant, name: "Blue - Small" }],
          "product"
        )
      ).toBe(true);
    });

    it("should accept optional/empty values", () => {
      expect(ListingValidator.isValidVariantsArray(null, "product")).toBe(true);
      expect(ListingValidator.isValidVariantsArray(undefined, "product")).toBe(
        true
      );
    });

    it("should reject non-array values", () => {
      const invalidTypes = ["string", 123, {}, true];

      invalidTypes.forEach((variants) => {
        expect(ListingValidator.isValidVariantsArray(variants, "product")).toBe(
          false
        );
      });
    });

    it("should reject arrays exceeding max limit", () => {
      const tooMany = Array(VariantLimits.MAX_VARIANTS_PER_LISTING + 1).fill(
        validVariant
      );
      expect(ListingValidator.isValidVariantsArray(tooMany, "product")).toBe(
        false
      );
    });

    it("should reject arrays with invalid variants", () => {
      const invalidVariants = [validVariant, { name: "Invalid" }]; // Second missing price
      expect(
        ListingValidator.isValidVariantsArray(invalidVariants, "product")
      ).toBe(false);
    });
  });

  // ==================== isValidVariantCount ====================
  describe("isValidVariantCount", () => {
    it("should accept valid counts", () => {
      const validCounts = [0, 1, 50, VariantLimits.MAX_VARIANTS_PER_LISTING];

      validCounts.forEach((count) => {
        expect(ListingValidator.isValidVariantCount(count)).toBe(true);
      });
    });

    it("should reject invalid counts", () => {
      const invalidCounts = [
        -1,
        VariantLimits.MAX_VARIANTS_PER_LISTING + 1,
        1.5,
        "10",
        null,
        undefined,
        {},
        [],
      ];

      invalidCounts.forEach((count) => {
        expect(ListingValidator.isValidVariantCount(count)).toBe(false);
      });
    });
  });
});

// ==================== QUOTE SETTINGS VALIDATION TESTS ====================
describe("Quote Settings Validator - Unit Tests", () => {
  // ==================== isValidQuoteCustomField ====================
  describe("isValidQuoteCustomField", () => {
    it("should accept valid text fields", () => {
      const validField = {
        label: "Event Date",
        type: "text",
        required: true,
      };
      expect(ListingValidator.isValidQuoteCustomField(validField)).toBe(true);
    });

    it("should accept valid select fields with options", () => {
      const validField = {
        label: "Package Type",
        type: "select",
        required: false,
        options: ["Basic", "Premium", "Enterprise"],
      };
      expect(ListingValidator.isValidQuoteCustomField(validField)).toBe(true);
    });

    it("should accept all valid field types", () => {
      Object.values(QuoteFieldType).forEach((type) => {
        const field = {
          label: "Test Field",
          type,
          ...(type === "select" ? { options: ["Option 1"] } : {}),
        };
        expect(ListingValidator.isValidQuoteCustomField(field)).toBe(true);
      });
    });

    it("should reject invalid field types", () => {
      const invalidTypes = [null, undefined, "", 123, [], {}, "invalid_type"];

      invalidTypes.forEach((type) => {
        const field = { label: "Test", type };
        expect(ListingValidator.isValidQuoteCustomField(field)).toBe(false);
      });
    });

    it("should reject select fields without options", () => {
      const noOptions = {
        label: "Package",
        type: "select",
      };
      expect(ListingValidator.isValidQuoteCustomField(noOptions)).toBe(false);

      const emptyOptions = {
        label: "Package",
        type: "select",
        options: [],
      };
      expect(ListingValidator.isValidQuoteCustomField(emptyOptions)).toBe(
        false
      );
    });

    it("should reject fields with missing label", () => {
      const noLabel = { type: "text" };
      expect(ListingValidator.isValidQuoteCustomField(noLabel)).toBe(false);

      const emptyLabel = { label: "", type: "text" };
      expect(ListingValidator.isValidQuoteCustomField(emptyLabel)).toBe(false);
    });

    it("should reject fields with label exceeding max length", () => {
      const longLabel = {
        label: "a".repeat(QuoteLimits.MAX_FIELD_LABEL_LENGTH + 1),
        type: "text",
      };
      expect(ListingValidator.isValidQuoteCustomField(longLabel)).toBe(false);
    });

    it("should reject fields with too many options", () => {
      const tooManyOptions = {
        label: "Test",
        type: "select",
        options: Array(QuoteLimits.MAX_FIELD_OPTIONS + 1).fill("Option"),
      };
      expect(ListingValidator.isValidQuoteCustomField(tooManyOptions)).toBe(
        false
      );
    });

    it("should reject invalid required value", () => {
      const invalidRequired = {
        label: "Test",
        type: "text",
        required: "yes", // Should be boolean
      };
      expect(ListingValidator.isValidQuoteCustomField(invalidRequired)).toBe(
        false
      );
    });
  });

  // ==================== isValidQuoteSettings ====================
  describe("isValidQuoteSettings", () => {
    it("should accept valid quote settings", () => {
      const validSettings = {
        enabled: true,
        autoAccept: false,
        minPrice: 50,
        maxPrice: 500,
        responseTime: "Within 24 hours",
        requiresDeposit: true,
        depositPercentage: 50,
        customFields: [
          { label: "Event Date", type: "date", required: true },
          {
            label: "Package",
            type: "select",
            options: ["Basic", "Premium"],
          },
        ],
      };
      expect(ListingValidator.isValidQuoteSettings(validSettings)).toBe(true);
    });

    it("should accept minimal quote settings", () => {
      const minimalSettings = {
        enabled: true,
      };
      expect(ListingValidator.isValidQuoteSettings(minimalSettings)).toBe(true);
    });

    it("should accept optional/empty values", () => {
      expect(ListingValidator.isValidQuoteSettings(null)).toBe(true);
      expect(ListingValidator.isValidQuoteSettings(undefined)).toBe(true);
    });

    it("should accept empty object", () => {
      expect(ListingValidator.isValidQuoteSettings({})).toBe(true);
    });

    it("should reject non-object values", () => {
      const invalidTypes = ["string", 123, [], true];

      invalidTypes.forEach((settings) => {
        expect(ListingValidator.isValidQuoteSettings(settings)).toBe(false);
      });
    });

    it("should reject invalid enabled value", () => {
      expect(ListingValidator.isValidQuoteSettings({ enabled: "yes" })).toBe(
        false
      );
      expect(ListingValidator.isValidQuoteSettings({ enabled: 1 })).toBe(false);
    });

    it("should reject invalid autoAccept value", () => {
      expect(ListingValidator.isValidQuoteSettings({ autoAccept: "no" })).toBe(
        false
      );
    });

    it("should reject invalid price values", () => {
      expect(ListingValidator.isValidQuoteSettings({ minPrice: -10 })).toBe(
        false
      );
      expect(ListingValidator.isValidQuoteSettings({ maxPrice: -5 })).toBe(
        false
      );
      expect(ListingValidator.isValidQuoteSettings({ minPrice: "50" })).toBe(
        false
      );
    });

    it("should reject maxPrice less than minPrice", () => {
      expect(
        ListingValidator.isValidQuoteSettings({ minPrice: 100, maxPrice: 50 })
      ).toBe(false);
    });

    it("should accept maxPrice equal to minPrice", () => {
      expect(
        ListingValidator.isValidQuoteSettings({ minPrice: 100, maxPrice: 100 })
      ).toBe(true);
    });

    it("should reject invalid depositPercentage", () => {
      expect(
        ListingValidator.isValidQuoteSettings({ depositPercentage: -1 })
      ).toBe(false);
      expect(
        ListingValidator.isValidQuoteSettings({ depositPercentage: 101 })
      ).toBe(false);
      expect(
        ListingValidator.isValidQuoteSettings({ depositPercentage: "50" })
      ).toBe(false);
    });

    it("should accept boundary depositPercentage values", () => {
      expect(
        ListingValidator.isValidQuoteSettings({ depositPercentage: 0 })
      ).toBe(true);
      expect(
        ListingValidator.isValidQuoteSettings({ depositPercentage: 100 })
      ).toBe(true);
    });

    it("should reject too many custom fields", () => {
      const tooManyFields = {
        customFields: Array(QuoteLimits.MAX_CUSTOM_FIELDS + 1).fill({
          label: "Field",
          type: "text",
        }),
      };
      expect(ListingValidator.isValidQuoteSettings(tooManyFields)).toBe(false);
    });

    it("should reject invalid custom fields", () => {
      const invalidFields = {
        customFields: [{ label: "", type: "text" }], // Empty label
      };
      expect(ListingValidator.isValidQuoteSettings(invalidFields)).toBe(false);
    });

    it("should reject invalid responseTime", () => {
      expect(ListingValidator.isValidQuoteSettings({ responseTime: 123 })).toBe(
        false
      );
      expect(
        ListingValidator.isValidQuoteSettings({
          responseTime: "a".repeat(QuoteLimits.MAX_RESPONSE_TIME_LENGTH + 1),
        })
      ).toBe(false);
    });
  });
});
