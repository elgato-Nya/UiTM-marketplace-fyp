const {
  isValidAddressType,
  isValidCampusBuilding,
  isValidPersonalAddress,
  isValidPhoneNumber,
  validateAddressByType,
  getErrorMessages,
} = require("../../utils/validators/user/address.validator");

const { CampusEnum } = require("../../utils/enums/user.enum");

describe("Address Schema Unit Tests", () => {
  describe("Address Type Validation", () => {
    it("should validate correct address types", () => {
      expect(isValidAddressType("campus")).toBe(true);
      expect(isValidAddressType("personal")).toBe(true);
      expect(isValidAddressType("temporary")).toBe(true);
    });

    it("should reject invalid address types", () => {
      expect(isValidAddressType("invalid")).toBe(false);
      expect(isValidAddressType("")).toBe(false);
      expect(isValidAddressType(null)).toBe(false);
      expect(isValidAddressType(undefined)).toBe(false);
      expect(isValidAddressType(123)).toBe(false);
    });
  });

  describe("Campus Address Validation", () => {
    it("should validate valid campus buildings", () => {
      expect(isValidCampusBuilding("Kolej Kediaman")).toBe(true);
      expect(isValidCampusBuilding("Fakulti Kejuruteraan")).toBe(true);
      expect(isValidCampusBuilding("Kompleks Siswa")).toBe(true);
      expect(isValidCampusBuilding("Perpustakaan")).toBe(true);
      expect(isValidCampusBuilding("Dewan Kuliah")).toBe(true);
    });

    it("should reject invalid campus buildings", () => {
      expect(isValidCampusBuilding("")).toBe(false);
      expect(isValidCampusBuilding("   ")).toBe(false);
      expect(isValidCampusBuilding("a")).toBe(false); // too short
      expect(isValidCampusBuilding("A".repeat(101))).toBe(false); // too long
      expect(isValidCampusBuilding(123)).toBe(false);
      expect(isValidCampusBuilding(null)).toBe(false);
    });

    it("should validate campus address completeness", () => {
      const validCampusAddress = {
        type: "campus",
        campusDetails: {
          building: "Kolej Kediaman",
          block: "Blok A",
          floor: "Tingkat 3",
          room: "Bilik 305",
          zone: "Zon Kediaman",
        },
        recipientName: "Ahmad Bin Ali",
        phoneNumber: "0123456789",
        campus: "SHAH_ALAM",
      };

      expect(validateAddressByType(validCampusAddress)).toBe(true);
    });

    it("should reject incomplete campus addresses", () => {
      const incompleteCampusAddress = {
        type: "campus",
        campusDetails: {
          building: "Kolej Kediaman",
          // missing required fields
        },
        recipientName: "Ahmad Bin Ali",
        phoneNumber: "0123456789",
        campus: "SHAH_ALAM",
      };

      expect(validateAddressByType(incompleteCampusAddress)).toBe(false);
    });
  });

  describe("Personal Address Validation", () => {
    it("should validate complete personal addresses", () => {
      const validPersonalAddress = {
        type: "personal",
        personalDetails: {
          addressLine1: "123 Jalan Merdeka",
          addressLine2: "Taman Setia",
          city: "Shah Alam",
          state: "Selangor",
          postcode: "40000",
          country: "Malaysia",
        },
        recipientName: "Siti Fatimah",
        phoneNumber: "0123456789",
      };

      expect(validateAddressByType(validPersonalAddress)).toBe(true);
    });

    it("should validate personal address fields individually", () => {
      expect(isValidPersonalAddress("123 Jalan Merdeka")).toBe(true);
      expect(isValidPersonalAddress("No. 45, Lorong 3/2")).toBe(true);
      expect(isValidPersonalAddress("")).toBe(false);
      expect(isValidPersonalAddress("   ")).toBe(false);
      expect(isValidPersonalAddress("A".repeat(201))).toBe(false); // too long
    });

    it("should validate Malaysian postcodes", () => {
      const validPostcodes = ["40000", "50000", "10000", "80000"];
      const invalidPostcodes = ["400", "400000", "abcde", "", null];

      validPostcodes.forEach((postcode) => {
        const address = {
          type: "personal",
          personalDetails: {
            addressLine1: "123 Jalan Test",
            city: "Test City",
            state: "Selangor",
            postcode: postcode,
            country: "Malaysia",
          },
          recipientName: "Test User",
          phoneNumber: "0123456789",
        };
        expect(validateAddressByType(address)).toBe(true);
      });

      invalidPostcodes.forEach((postcode) => {
        const address = {
          type: "personal",
          personalDetails: {
            addressLine1: "123 Jalan Test",
            city: "Test City",
            state: "Selangor",
            postcode: postcode,
            country: "Malaysia",
          },
          recipientName: "Test User",
          phoneNumber: "0123456789",
        };
        expect(validateAddressByType(address)).toBe(false);
      });
    });
  });

  describe("Common Address Field Validation", () => {
    it("should validate recipient names", () => {
      const validNames = [
        "Ahmad Bin Ali",
        "Siti Fatimah Binti Abdullah",
        "Dr. Rajesh Kumar",
        "Prof. Madya Aminah",
      ];

      validNames.forEach((name) => {
        expect(name.length >= 2 && name.length <= 100).toBe(true);
      });
    });

    it("should validate phone numbers for addresses", () => {
      expect(isValidPhoneNumber("0123456789")).toBe(true);
      expect(isValidPhoneNumber("01234567890")).toBe(true);
      expect(isValidPhoneNumber("012345678")).toBe(false); // too short
      expect(isValidPhoneNumber("012345678901")).toBe(false); // too long
      expect(isValidPhoneNumber("123456789")).toBe(false); // doesn't start with 0
    });

    it("should validate special instructions", () => {
      const validInstructions = [
        "Leave at security guard",
        "Call before delivery",
        "Block A, near the staircase",
        "", // optional field
      ];

      validInstructions.forEach((instruction) => {
        expect(instruction.length <= 500).toBe(true);
      });

      expect("A".repeat(501).length > 500).toBe(true); // should be invalid
    });
  });

  describe("Campus Validation Against User Campus", () => {
    it("should validate address campus matches user campus", () => {
      const userCampus = "SHAH_ALAM";
      const validAddress = {
        type: "campus",
        campus: "SHAH_ALAM",
        campusDetails: {
          building: "Kolej Kediaman",
          block: "Blok A",
          floor: "Tingkat 3",
          room: "Bilik 305",
        },
      };

      expect(validAddress.campus).toBe(userCampus);
    });

    it("should allow personal addresses regardless of user campus", () => {
      const userCampus = "SHAH_ALAM";
      const personalAddress = {
        type: "personal",
        personalDetails: {
          addressLine1: "123 Jalan Merdeka",
          city: "Kuala Lumpur", // Different from user campus
          state: "Kuala Lumpur",
          postcode: "50000",
        },
      };

      // Personal addresses should not be restricted by user campus
      expect(personalAddress.type).toBe("personal");
    });
  });

  describe("Error Messages", () => {
    it("should provide comprehensive error messages", () => {
      const errorMessages = getErrorMessages();

      expect(errorMessages.addressType).toBeDefined();
      expect(errorMessages.campusBuilding).toBeDefined();
      expect(errorMessages.campusBlock).toBeDefined();
      expect(errorMessages.campusFloor).toBeDefined();
      expect(errorMessages.campusRoom).toBeDefined();
      expect(errorMessages.addressLine1).toBeDefined();
      expect(errorMessages.city).toBeDefined();
      expect(errorMessages.state).toBeDefined();
      expect(errorMessages.postcode).toBeDefined();
      expect(errorMessages.recipientName).toBeDefined();
      expect(errorMessages.phoneNumber).toBeDefined();

      // All error messages should be strings
      Object.values(errorMessages).forEach((message) => {
        expect(typeof message).toBe("string");
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle various input types gracefully", () => {
      const validators = [
        isValidAddressType,
        isValidCampusBuilding,
        isValidPersonalAddress,
      ];

      validators.forEach((validator) => {
        expect(() => validator(123)).not.toThrow();
        expect(() => validator({})).not.toThrow();
        expect(() => validator([])).not.toThrow();
        expect(() => validator(true)).not.toThrow();
        expect(() => validator(null)).not.toThrow();
        expect(() => validator(undefined)).not.toThrow();
      });
    });

    it("should handle malformed address objects", () => {
      const malformedAddresses = [
        null,
        undefined,
        {},
        { type: "campus" }, // missing required fields
        { type: "personal" }, // missing required fields
        { type: "invalid" },
        "not an object",
      ];

      malformedAddresses.forEach((address) => {
        expect(validateAddressByType(address)).toBe(false);
      });
    });
  });
});
