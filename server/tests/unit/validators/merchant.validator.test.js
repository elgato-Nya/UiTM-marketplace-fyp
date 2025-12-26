/**
 * UNIT TESTS FOR MERCHANT VALIDATION FUNCTIONS
 *
 * PURPOSE: Test merchant-specific validation functions in isolation
 * FOCUS: Delivery fee settings, campus validation, shop details
 *
 * TDD APPROACH:
 * - Write tests FIRST (RED phase - tests will fail)
 * - Implement validators to pass tests (GREEN phase)
 * - Refactor for code quality (REFACTOR phase)
 *
 * COVERAGE:
 * - Delivery fee validation (range, thresholds)
 * - Campus enum validation
 * - Shop name/slug validation
 * - Email validation (verification & business)
 */

const {
  MerchantValidator,
  merchantErrorMessages,
} = require("../../../validators/user");
const { CampusEnum } = require("../../../utils/enums/user.enum");

describe("MerchantValidator Unit Tests", () => {
  describe("Delivery Fee Validation", () => {
    describe("isValidDeliveryFee()", () => {
      it("should accept valid fees within 0-100 range", () => {
        expect(MerchantValidator.isValidDeliveryFee(0)).toBe(true);
        expect(MerchantValidator.isValidDeliveryFee(2.5)).toBe(true);
        expect(MerchantValidator.isValidDeliveryFee(5.0)).toBe(true);
        expect(MerchantValidator.isValidDeliveryFee(50)).toBe(true);
        expect(MerchantValidator.isValidDeliveryFee(100)).toBe(true);
      });

      it("should reject negative fees", () => {
        expect(MerchantValidator.isValidDeliveryFee(-1)).toBe(false);
        expect(MerchantValidator.isValidDeliveryFee(-0.01)).toBe(false);
        expect(MerchantValidator.isValidDeliveryFee(-100)).toBe(false);
      });

      it("should reject fees above 100", () => {
        expect(MerchantValidator.isValidDeliveryFee(100.01)).toBe(false);
        expect(MerchantValidator.isValidDeliveryFee(150)).toBe(false);
        expect(MerchantValidator.isValidDeliveryFee(1000)).toBe(false);
      });

      it("should reject non-numeric values", () => {
        expect(MerchantValidator.isValidDeliveryFee("5")).toBe(false);
        expect(MerchantValidator.isValidDeliveryFee(null)).toBe(false);
        expect(MerchantValidator.isValidDeliveryFee(undefined)).toBe(false);
        expect(MerchantValidator.isValidDeliveryFee(NaN)).toBe(false);
        expect(MerchantValidator.isValidDeliveryFee({})).toBe(false);
        expect(MerchantValidator.isValidDeliveryFee([])).toBe(false);
      });

      it("should handle decimal precision correctly", () => {
        expect(MerchantValidator.isValidDeliveryFee(2.99)).toBe(true);
        expect(MerchantValidator.isValidDeliveryFee(10.5)).toBe(true);
        expect(MerchantValidator.isValidDeliveryFee(99.99)).toBe(true);
      });
    });

    describe("isValidFreeThreshold()", () => {
      it("should accept valid threshold values (0 or positive)", () => {
        expect(MerchantValidator.isValidFreeThreshold(0)).toBe(true);
        expect(MerchantValidator.isValidFreeThreshold(50)).toBe(true);
        expect(MerchantValidator.isValidFreeThreshold(100)).toBe(true);
        expect(MerchantValidator.isValidFreeThreshold(500)).toBe(true);
        expect(MerchantValidator.isValidFreeThreshold(9999.99)).toBe(true);
      });

      it("should reject negative thresholds", () => {
        expect(MerchantValidator.isValidFreeThreshold(-1)).toBe(false);
        expect(MerchantValidator.isValidFreeThreshold(-0.01)).toBe(false);
        expect(MerchantValidator.isValidFreeThreshold(-100)).toBe(false);
      });

      it("should reject non-numeric values", () => {
        expect(MerchantValidator.isValidFreeThreshold("50")).toBe(false);
        expect(MerchantValidator.isValidFreeThreshold(null)).toBe(false);
        expect(MerchantValidator.isValidFreeThreshold(undefined)).toBe(false);
        expect(MerchantValidator.isValidFreeThreshold(NaN)).toBe(false);
        expect(MerchantValidator.isValidFreeThreshold({})).toBe(false);
      });

      it("should accept large threshold values", () => {
        expect(MerchantValidator.isValidFreeThreshold(10000)).toBe(true);
        expect(MerchantValidator.isValidFreeThreshold(99999.99)).toBe(true);
      });
    });

    describe("isValidDeliverableCampuses()", () => {
      it("should accept empty array (no campus delivery)", () => {
        expect(MerchantValidator.isValidDeliverableCampuses([])).toBe(true);
      });

      it("should accept valid campus keys from CampusEnum", () => {
        expect(
          MerchantValidator.isValidDeliverableCampuses(["SHAH_ALAM"])
        ).toBe(true);
        expect(
          MerchantValidator.isValidDeliverableCampuses([
            "SHAH_ALAM",
            "PUNCAK_ALAM",
          ])
        ).toBe(true);
        expect(
          MerchantValidator.isValidDeliverableCampuses([
            "SHAH_ALAM",
            "PUNCAK_ALAM",
            "SEGAMAT",
          ])
        ).toBe(true);
      });

      it("should accept all valid campus keys", () => {
        const allCampusKeys = Object.keys(CampusEnum);
        expect(
          MerchantValidator.isValidDeliverableCampuses(allCampusKeys)
        ).toBe(true);
      });

      it("should reject invalid campus keys", () => {
        expect(
          MerchantValidator.isValidDeliverableCampuses(["INVALID_CAMPUS"])
        ).toBe(false);
        expect(
          MerchantValidator.isValidDeliverableCampuses([
            "SHAH_ALAM",
            "INVALID_CAMPUS",
          ])
        ).toBe(false);
        expect(
          MerchantValidator.isValidDeliverableCampuses(["shah_alam"])
        ).toBe(false); // Wrong case
        expect(
          MerchantValidator.isValidDeliverableCampuses(["UiTM Shah Alam"])
        ).toBe(false); // Display value, not key
      });

      it("should reject non-array values", () => {
        expect(MerchantValidator.isValidDeliverableCampuses("SHAH_ALAM")).toBe(
          false
        );
        expect(MerchantValidator.isValidDeliverableCampuses(null)).toBe(false);
        expect(MerchantValidator.isValidDeliverableCampuses(undefined)).toBe(
          false
        );
        expect(MerchantValidator.isValidDeliverableCampuses({})).toBe(false);
      });

      it("should reject arrays with non-string elements", () => {
        expect(MerchantValidator.isValidDeliverableCampuses([123])).toBe(false);
        expect(
          MerchantValidator.isValidDeliverableCampuses(["SHAH_ALAM", 123])
        ).toBe(false);
        expect(
          MerchantValidator.isValidDeliverableCampuses([null, "SHAH_ALAM"])
        ).toBe(false);
      });

      it("should reject duplicate campus keys", () => {
        expect(
          MerchantValidator.isValidDeliverableCampuses([
            "SHAH_ALAM",
            "SHAH_ALAM",
          ])
        ).toBe(false);
        expect(
          MerchantValidator.isValidDeliverableCampuses([
            "SHAH_ALAM",
            "PUNCAK_ALAM",
            "SHAH_ALAM",
          ])
        ).toBe(false);
      });
    });
  });

  describe("Error Messages", () => {
    it("should provide delivery fee error messages", () => {
      const messages = merchantErrorMessages();

      expect(messages.deliveryFee).toBeDefined();
      expect(messages.deliveryFee.invalidFee).toBeDefined();
      expect(messages.deliveryFee.invalidThreshold).toBeDefined();
      expect(messages.deliveryFee.invalidCampuses).toBeDefined();
    });
  });
});
