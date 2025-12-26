const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { User } = require("../../../models");
const {
  calculateDeliveryFee,
} = require("../../../services/order/order.helpers");
const {
  DeliveryMethod,
  AddressType,
} = require("../../../utils/enums/order.enum");

/**
 * DELIVERY FEE SERVICE TESTS (TDD)
 *
 * PURPOSE: Test delivery fee calculation with merchant settings
 * PATTERN: Integration tests with real database
 * SCOPE: Platform defaults, merchant customization, free delivery logic
 */

describe("Delivery Fee Calculation Service", () => {
  let mongoServer;
  let testMerchant;
  let customMerchant;
  let freeMerchant;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Create test merchant with default fees
    testMerchant = await User.create({
      email: "merchant@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "defaultmerchant",
        fullName: "Default Merchant",
        phoneNumber: "0123456789",
        campus: "SHAH_ALAM",
        faculty: "COMPUTER_SCIENCE_MATH",
      },
      roles: ["consumer", "merchant"],
      merchantDetails: {
        shopName: "Default Shop",
        shopSlug: "default-shop",
        isVerified: true,
        // deliveryFees will use defaults
      },
    });

    // Create merchant with custom fees
    customMerchant = await User.create({
      email: "custom@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "custommerchant",
        fullName: "Custom Merchant",
        phoneNumber: "0123456780",
        campus: "SHAH_ALAM",
        faculty: "COMPUTER_SCIENCE_MATH",
      },
      roles: ["consumer", "merchant"],
      merchantDetails: {
        shopName: "Custom Shop",
        shopSlug: "custom-shop",
        isVerified: true,
        deliveryFees: {
          personal: { enabled: true, fee: 8.0, freeThreshold: 100 },
          campus: { enabled: true, fee: 3.0, freeThreshold: 50 },
          pickup: { enabled: true, fee: 2.0 },
        },
      },
    });

    // Create merchant with free delivery
    freeMerchant = await User.create({
      email: "free@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "freemerchant",
        fullName: "Free Merchant",
        phoneNumber: "0123456781",
        campus: "SHAH_ALAM",
        faculty: "COMPUTER_SCIENCE_MATH",
      },
      roles: ["consumer", "merchant"],
      merchantDetails: {
        shopName: "Free Shop",
        shopSlug: "free-shop",
        isVerified: true,
        deliveryFees: {
          freeDeliveryForAll: true,
        },
      },
    });
  });

  describe("Platform Default Fees", () => {
    it("should return RM 5.00 for personal delivery with defaults", async () => {
      const fee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        testMerchant._id,
        50
      );
      expect(fee).toBe(5.0);
    });

    it("should return RM 2.50 for campus delivery with defaults", async () => {
      const fee = await calculateDeliveryFee(
        DeliveryMethod.CAMPUS_DELIVERY,
        testMerchant._id,
        50
      );
      expect(fee).toBe(2.5);
    });

    it("should return RM 1.00 for pickup with defaults", async () => {
      const fee = await calculateDeliveryFee(
        DeliveryMethod.SELF_PICKUP,
        testMerchant._id,
        50
      );
      expect(fee).toBe(1.0);
    });
  });

  describe("Custom Merchant Fees", () => {
    it("should return custom personal delivery fee", async () => {
      const fee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        customMerchant._id,
        50
      );
      expect(fee).toBe(8.0);
    });

    it("should return custom campus delivery fee", async () => {
      const fee = await calculateDeliveryFee(
        DeliveryMethod.CAMPUS_DELIVERY,
        customMerchant._id,
        30
      );
      expect(fee).toBe(3.0);
    });

    it("should return custom pickup fee", async () => {
      const fee = await calculateDeliveryFee(
        DeliveryMethod.SELF_PICKUP,
        customMerchant._id,
        20
      );
      expect(fee).toBe(2.0);
    });
  });

  describe("Free Delivery Threshold Logic", () => {
    it("should return 0 when order meets personal free threshold", async () => {
      // Custom merchant has RM 100 threshold for personal delivery
      const fee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        customMerchant._id,
        100
      );
      expect(fee).toBe(0);
    });

    it("should return 0 when order exceeds personal free threshold", async () => {
      const fee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        customMerchant._id,
        150
      );
      expect(fee).toBe(0);
    });

    it("should charge fee when order is below threshold", async () => {
      // Order is RM 99, threshold is RM 100
      const fee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        customMerchant._id,
        99
      );
      expect(fee).toBe(8.0); // Custom fee
    });

    it("should return 0 when order meets campus free threshold", async () => {
      // Custom merchant has RM 50 threshold for campus delivery
      const fee = await calculateDeliveryFee(
        DeliveryMethod.CAMPUS_DELIVERY,
        customMerchant._id,
        50
      );
      expect(fee).toBe(0);
    });

    it("should charge fee when campus order is below threshold", async () => {
      const fee = await calculateDeliveryFee(
        DeliveryMethod.CAMPUS_DELIVERY,
        customMerchant._id,
        49
      );
      expect(fee).toBe(3.0); // Custom campus fee
    });
  });

  describe("Free Delivery For All Orders", () => {
    it("should return 0 for all delivery types when freeDeliveryForAll is true", async () => {
      const personalFee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        freeMerchant._id,
        10
      );
      const campusFee = await calculateDeliveryFee(
        DeliveryMethod.CAMPUS_DELIVERY,
        freeMerchant._id,
        10
      );
      const pickupFee = await calculateDeliveryFee(
        DeliveryMethod.SELF_PICKUP,
        freeMerchant._id,
        10
      );

      expect(personalFee).toBe(0);
      expect(campusFee).toBe(0);
      expect(pickupFee).toBe(0);
    });
  });

  describe("Disabled Delivery Types", () => {
    it("should return null when delivery type is disabled", async () => {
      const merchantWithDisabled = await User.create({
        email: "disabled@student.uitm.edu.my",
        password: "SecurePass123!",
        profile: {
          username: "disabledmerchant",
          fullName: "Disabled Merchant",
          phoneNumber: "0123456782",
          campus: "SHAH_ALAM",
          faculty: "COMPUTER_SCIENCE_MATH",
        },
        roles: ["consumer", "merchant"],
        merchantDetails: {
          shopName: "Disabled Shop",
          shopSlug: "disabled-shop",
          isVerified: true,
          deliveryFees: {
            personal: { enabled: false }, // Disabled
          },
        },
      });

      const fee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        merchantWithDisabled._id,
        50
      );
      expect(fee).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle non-existent merchant gracefully", async () => {
      const fakeMerchantId = new mongoose.Types.ObjectId();
      const fee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        fakeMerchantId,
        50
      );

      // Should fallback to platform defaults or return null
      expect(fee).toBe(5.0); // Platform default
    });

    it("should handle invalid delivery type", async () => {
      const fee = await calculateDeliveryFee(
        "invalid_type",
        testMerchant._id,
        50
      );
      expect(fee).toBe(0);
    });

    it("should handle zero order total", async () => {
      const fee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        testMerchant._id,
        0
      );
      expect(fee).toBe(5.0); // Should still charge delivery fee
    });

    it("should handle very large order total", async () => {
      // Order of RM 10,000 - should be free if threshold is RM 100
      const fee = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        customMerchant._id,
        10000
      );
      expect(fee).toBe(0); // Exceeds free threshold
    });
  });

  describe("Backward Compatibility", () => {
    it("should work with enum-based delivery methods", async () => {
      // Test all standard DeliveryMethod enum values work correctly
      const fee1 = await calculateDeliveryFee(
        DeliveryMethod.DELIVERY,
        testMerchant._id,
        50
      );
      const fee2 = await calculateDeliveryFee(
        DeliveryMethod.CAMPUS_DELIVERY,
        testMerchant._id,
        50
      );
      const fee3 = await calculateDeliveryFee(
        DeliveryMethod.SELF_PICKUP,
        testMerchant._id,
        50
      );
      const fee4 = await calculateDeliveryFee(
        DeliveryMethod.ROOM_DELIVERY,
        testMerchant._id,
        50
      );
      const fee5 = await calculateDeliveryFee(
        DeliveryMethod.MEETUP,
        testMerchant._id,
        50
      );

      // All should return valid fees
      expect(fee1).toBe(5.0); // DELIVERY -> personal
      expect(fee2).toBe(2.5); // CAMPUS_DELIVERY -> campus
      expect(fee3).toBe(1.0); // SELF_PICKUP -> pickup
      expect(fee4).toBe(2.5); // ROOM_DELIVERY -> campus
      expect(fee5).toBe(1.0); // MEETUP -> pickup
    });
  });
});
