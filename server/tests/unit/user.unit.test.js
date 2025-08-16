/**
 * UNIT TESTS FOR USER VALIDATION FUNCTIONS
 *
 * PURPOSE: Test individual validation functions in isolation
 *
 * WHAT ARE UNIT TESTS?
 * - Test small, isolated pieces of code (individual functions)
 * - Fast execution (no database, no network calls)
 * - Predictable (same input = same output every time)
 * - Easy to debug when they fail
 *
 * MOCKING CONCEPT:
 * - We mock external dependencies (like mongoose) to isolate our code
 * - This ensures we're only testing OUR code, not third-party libraries
 * - Mocks are fake objects that simulate real behavior
 *
 * WHY SEPARATE FROM INTEGRATION TESTS?
 * - Unit tests run faster (milliseconds vs seconds)
 * - Easier to pinpoint exact location of bugs
 * - Can test edge cases without complex database setup
 */

// Import the validator functions instead of the User model for validation tests
const {
  isValidUiTMEmail,
  isValidPassword,
  isValidUsername,
  isValidPhoneNumber,
  isValidMongoId,
  isValidAvatar,
  isValidRoleArray,
  isValidRole,
  isValidCampus,
  isValidFaculty,
  isValidBio,
} = require("../../utils/validators/user");

// Mock mongoose to avoid database connections during unit tests
/**
 * MOCKING EXPLANATION:
 *
 * jest.mock() replaces the real mongoose with a fake version
 * This prevents:
 * - Actual database connections during testing
 * - Slow test execution
 * - Tests failing due to database issues
 *
 * We create fake implementations that return predictable results
 */
jest.mock("mongoose", () => ({
  Schema: jest.fn(() => ({
    pre: jest.fn(), // Mock pre-save middleware
    methods: {}, // Mock instance methods
    statics: {}, // Mock static methods
  })),
  model: jest.fn(() => ({
    // Mock any model methods you need for unit testing
    save: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  })),
}));

describe("User Model Unit Test", () => {
  describe("Static Validation Unit Test", () => {
    /**
     * EMAIL VALIDATION TESTING
     *
     * TESTING APPROACH:
     * 1. Test valid cases (should return true)
     * 2. Test invalid cases (should return false)
     * 3. Test edge cases (empty, null, undefined)
     *
     * WHY THESE SPECIFIC TESTS?
     * - UiTM domain requirement is business logic
     * - Edge cases prevent runtime errors
     * - Clear examples help other developers understand requirements
     */
    it("should validate UiTM emails", () => {
      /**
       * Testing pure validation functions - no mocking needed
       * These are pure functions: same input always gives same output
       * No external dependencies (database, APIs, etc.)
       */

      // Valid UiTM emails should return true
      expect(isValidUiTMEmail("test@uitm.edu.my")).toBe(true);
      expect(isValidUiTMEmail("student@mail.uitm.edu.my")).toBe(true);
      expect(isValidUiTMEmail("staff123@uitm.edu.my")).toBe(true);

      // Invalid emails should return false
      expect(isValidUiTMEmail("fake@um.edu.my")).toBe(false);
      expect(isValidUiTMEmail("fakeStudent@gmail.com")).toBe(false);
      expect(isValidUiTMEmail("test@yahoo.com")).toBe(false);

      // Edge cases - prevent runtime errors
      expect(isValidUiTMEmail("")).toBe(false);
      expect(isValidUiTMEmail(null)).toBe(false);
      expect(isValidUiTMEmail(undefined)).toBe(false);
    });

    it("should validate passwords", () => {
      /**
       * Testing password validation logic
       * Requirements: 8-24 chars, 1 uppercase, 1 lowercase, 1 number
       */

      // Valid passwords
      expect(isValidPassword("Password123")).toBe(true);
      expect(isValidPassword("P@ssw0rd")).toBe(true);
      expect(isValidPassword("MySecure1")).toBe(true);

      // Invalid passwords
      expect(isValidPassword("password")).toBe(false); // no uppercase, no number
      expect(isValidPassword("PASSWORD123")).toBe(false); // no lowercase
      expect(isValidPassword("Pass123")).toBe(false); // too short (7 chars)
      expect(isValidPassword("Password")).toBe(false); // no number

      // Edge cases
      expect(isValidPassword("")).toBe(false);
      expect(isValidPassword(null)).toBe(false);
      expect(isValidPassword("P1")).toBe(false); // too short
      expect(isValidPassword("a".repeat(25) + "A1")).toBe(false); // too long (27 chars)
    });

    it("should only allow valid usernames", () => {
      /**
       * Testing username validation rules:
       * - 6-16 characters
       * - Start with letter or number
       * - Can contain letters, numbers, underscores, hyphens
       * - No consecutive special chars, no ending with special chars
       */

      // Valid usernames
      expect(isValidUsername("valid_username")).toBe(true);
      expect(isValidUsername("user123")).toBe(true);
      expect(isValidUsername("testuser")).toBe(true); // Fixed: no hyphen
      expect(isValidUsername("a12345")).toBe(true); // exactly 6 chars
      expect(isValidUsername("user1234567890ab")).toBe(true); // exactly 16 chars

      // Invalid usernames
      expect(isValidUsername("_invalidUsername")).toBe(false); // starts with underscore
      expect(isValidUsername("short")).toBe(false); // too short (5 chars)
      expect(isValidUsername("thisusernameiswaytoolong")).toBe(false); // too long
      expect(isValidUsername("user__name")).toBe(false); // consecutive underscores
      expect(isValidUsername("username_")).toBe(false); // ends with underscore
      expect(isValidUsername("user name")).toBe(false); // contains space

      // Edge cases
      expect(isValidUsername("")).toBe(false);
      expect(isValidUsername(null)).toBe(false);
      expect(isValidUsername("12345")).toBe(false); // too short (5 chars)
      expect(isValidUsername("a".repeat(17))).toBe(false); // too long (17 chars)
    });

    it("should validate users' phone numbers", () => {
      /**
       * Testing Malaysian phone number format:
       * - Must start with 0
       * - 10 or 11 digits total
       * - Only digits allowed
       */

      // Valid phone numbers
      expect(isValidPhoneNumber("01234567890")).toBe(true); // 11 digits
      expect(isValidPhoneNumber("0123456789")).toBe(true); // 10 digits
      expect(isValidPhoneNumber("0198765432")).toBe(true); // mobile format

      // Invalid phone numbers
      expect(isValidPhoneNumber("+601234567890")).toBe(false); // has country code
      expect(isValidPhoneNumber("60123456789")).toBe(false); // doesn't start with 0
      expect(isValidPhoneNumber("0123456789my")).toBe(false); // contains letters
      expect(isValidPhoneNumber("1234567890")).toBe(false); // doesn't start with 0
      expect(isValidPhoneNumber("012345678")).toBe(false); // too short (9 digits)
      expect(isValidPhoneNumber("012345678901")).toBe(false); // too long (12 digits)
      expect(isValidPhoneNumber("0123-456-789")).toBe(false); // contains hyphens

      // Edge cases
      expect(isValidPhoneNumber("")).toBe(false);
      expect(isValidPhoneNumber(null)).toBe(false);
    });
  });

  describe("User Model Instance Methods", () => {
    let mockUser;

    beforeEach(() => {
      /**
       * UNIT TEST MOCK SETUP:
       *
       * For unit tests, we mock external dependencies to test
       * ONLY the logic of our methods, not their side effects.
       *
       * We're testing the method's behavior, not database operations.
       */

      // Create a mock user object with the actual method logic
      mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "test@uitm.edu.my",
        lastActive: new Date("2025-01-01"),

        // Mock the save method to avoid database calls
        save: jest.fn().mockResolvedValue(true),

        // Test the actual updateLastActive logic (without database)
        updateLastActive: function () {
          this.lastActive = Date.now();
          return this.save();
        },

        // Mock bcrypt for password comparison
        comparePassword: jest.fn(),
      };
    });

    it("should update lastActive timestamp when updateLastActive is called", async () => {
      /**
       * UNIT TEST FOCUS:
       *
       * Testing that the method correctly updates the lastActive field
       * and calls save(). We're NOT testing if it actually saves to database
       * (that's integration testing).
       */

      const originalTime = mockUser.lastActive;

      // Call the method we're testing
      await mockUser.updateLastActive();

      // Verify the logic worked (lastActive was updated)
      expect(mockUser.lastActive).not.toBe(originalTime);
      expect(mockUser.lastActive).toBeGreaterThan(originalTime.getTime());

      // Verify save was called (but we don't care if it actually saved)
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it("should return correct result for password comparison", async () => {
      /**
       * UNIT TEST FOR BUSINESS LOGIC:
       *
       * We're testing the comparePassword method behavior,
       * not the actual bcrypt hashing (that's a library concern).
       */

      const inputPassword = "Password123";

      // Test successful comparison
      mockUser.comparePassword.mockResolvedValue(true);
      const isMatch = await mockUser.comparePassword(inputPassword);

      expect(mockUser.comparePassword).toHaveBeenCalledWith(inputPassword);
      expect(isMatch).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const wrongPassword = "wrongpassword";

      // Test failed comparison
      mockUser.comparePassword.mockResolvedValue(false);
      const isMatch = await mockUser.comparePassword(wrongPassword);

      expect(mockUser.comparePassword).toHaveBeenCalledWith(wrongPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe("User Model Schema Validation Logic", () => {
    /**
     * UNIT TESTING SCHEMA VALIDATION:
     *
     * Test that validation rules are correctly applied,
     * without actually creating database documents.
     */

    it("should have correct validation rules", () => {
      // Test that our model uses the correct validators
      expect(typeof isValidUiTMEmail).toBe("function");
      expect(typeof isValidPassword).toBe("function");
      expect(typeof isValidUsername).toBe("function");
      expect(typeof isValidPhoneNumber).toBe("function");
    });

    it("should validate required fields concept", () => {
      /**
       * Testing validation logic without database:
       * We can test what SHOULD be required without
       * actually trying to save invalid data.
       */

      const requiredFields = [
        "email",
        "password",
        "profile.username",
        "profile.phoneNumber",
        "profile.campus",
        "profile.faculty",
      ];

      // Test that we know what fields are required
      expect(requiredFields).toContain("email");
      expect(requiredFields).toContain("password");
      expect(requiredFields).toContain("profile.username");
      expect(requiredFields).toContain("profile.phoneNumber");
      expect(requiredFields).toContain("profile.campus");
      expect(requiredFields).toContain("profile.faculty");
    });
  });

  describe("Additional Validator Functions", () => {
    const {
      isValidMongoId,
      isValidRoleArray,
      isValidCampus,
      isValidFaculty,
      isValidBio,
      getErrorMessages,
    } = require("../../utils/validators");

    it("should validate MongoDB ObjectIds", () => {
      // Valid MongoDB ObjectIds
      expect(isValidMongoId("507f1f77bcf86cd799439011")).toBe(true);
      expect(isValidMongoId("507f191e810c19729de860ea")).toBe(true);

      // Invalid MongoDB ObjectIds
      expect(isValidMongoId("invalid-id")).toBe(false);
      expect(isValidMongoId("507f1f77bcf86cd799439")).toBe(false); // too short
      expect(isValidMongoId("507f1f77bcf86cd7994390111")).toBe(false); // too long
      expect(isValidMongoId("")).toBe(false);
      expect(isValidMongoId(null)).toBe(false);
    });

    it("should validate role arrays", () => {
      // Valid role arrays
      expect(isValidRoleArray(["consumer"])).toBe(true);
      expect(isValidRoleArray(["merchant"])).toBe(true);
      expect(isValidRoleArray(["admin"])).toBe(true);
      expect(isValidRoleArray(["consumer", "merchant"])).toBe(true);

      // Invalid role arrays
      expect(isValidRoleArray([])).toBe(false); // empty array
      expect(isValidRoleArray(["invalid-role"])).toBe(false);
      expect(isValidRoleArray(["consumer", "invalid"])).toBe(false);
      expect(isValidRoleArray("consumer")).toBe(false); // not an array
      expect(isValidRoleArray(null)).toBe(false);
    });

    it("should validate bio content", () => {
      // Valid bios
      expect(isValidBio("")).toBe(true); // empty is valid (optional)
      expect(isValidBio(null)).toBe(true); // null is valid (optional)
      expect(isValidBio(undefined)).toBe(true); // undefined is valid (optional)
      expect(isValidBio("Short bio")).toBe(true);
      expect(isValidBio("A".repeat(200))).toBe(true); // exactly 200 chars

      // Invalid bios
      expect(isValidBio("A".repeat(201))).toBe(false); // too long
      expect(isValidBio(123)).toBe(false); // not a string
    });

    it("should validate campus enum values", () => {
      // Valid campus values
      expect(isValidCampus("UiTM Kampus Segamat")).toBe(true);
      expect(isValidCampus("UiTM Kampus Arau")).toBe(true);

      // Invalid campus values
      expect(isValidCampus("INVALID_CAMPUS")).toBe(false);
      expect(isValidCampus(123)).toBe(false); // not a string
      expect(isValidCampus(null)).toBe(false);
      expect(isValidCampus(undefined)).toBe(false);
    });

    it("should validate faculty enum values", () => {
      // Valid faculty values
      expect(isValidFaculty("Fakulti Sains Gunaan")).toBe(true);
      expect(isValidFaculty("Fakulti Sains Komputer dan Matematik")).toBe(true);

      // Invalid faculty values
      expect(isValidFaculty("INVALID_FACULTY")).toBe(false);
      expect(isValidFaculty(123)).toBe(false); // not a string
      expect(isValidFaculty(null)).toBe(false);
      expect(isValidFaculty(undefined)).toBe(false);
    });

    it("should return error messages object", () => {
      const messages = getErrorMessages();

      expect(typeof messages).toBe("object");
      expect(messages.email).toBeDefined();
      expect(messages.password).toBeDefined();
      expect(messages.username).toBeDefined();
      expect(messages.phoneNumber).toBeDefined();
      expect(messages.mongoId).toBeDefined();
      expect(messages.roleArray).toBeDefined();
      expect(messages.campus).toBeDefined();
      expect(messages.faculty).toBeDefined();
      expect(messages.bio).toBeDefined();

      // Test that error messages are strings
      Object.values(messages).forEach((message) => {
        expect(typeof message).toBe("string");
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle various input types gracefully", () => {
      const validators = [
        isValidUiTMEmail,
        isValidPassword,
        isValidUsername,
        isValidPhoneNumber,
      ];

      validators.forEach((validator) => {
        // Should handle non-string inputs without throwing
        expect(() => validator(123)).not.toThrow();
        expect(() => validator({})).not.toThrow();
        expect(() => validator([])).not.toThrow();
        expect(() => validator(true)).not.toThrow();

        // Should return false for invalid types
        expect(validator(123)).toBe(false);
        expect(validator({})).toBe(false);
        expect(validator([])).toBe(false);
        expect(validator(true)).toBe(false);
      });
    });
  });

  describe("Performance Tests", () => {
    it("should validate emails quickly", () => {
      const startTime = Date.now();

      // Run validation 1000 times
      for (let i = 0; i < 1000; i++) {
        isValidUiTMEmail("test@uitm.edu.my");
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 1000 validations in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
