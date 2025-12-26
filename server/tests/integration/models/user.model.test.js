const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { User } = require("../../../models");

/**
 * INTEGRATION TESTS FOR USER MODEL
 *
 * PURPOSE: Test how multiple components work together in realistic scenarios
 *
 * WHAT ARE INTEGRATION TESTS?
 * - Test complete workflows from input to database
 * - Use real database (MongoDB Memory Server for testing)
 * - Test actual behavior, not mocked behavior
 * - Slower than unit tests but catch real-world issues
 *
 * INTEGRATION vs UNIT TESTS:
 * ┌─────────────────┬─────────────────┬──────────────────┐
 * │                 │ Unit Tests      │ Integration Tests│
 * ├─────────────────┼─────────────────┼──────────────────┤
 * │ Speed           │ Fast (ms)       │ Slower (seconds) │
 * │ Database        │ Mocked          │ Real (in-memory) │
 * │ Dependencies    │ Isolated        │ Real connections │
 * │ Scope           │ Single function │ Complete workflow│
 * │ When to use     │ Logic testing   │ End-to-end flows │
 * └─────────────────┴─────────────────┴──────────────────┘
 *
 * WHAT WE'RE TESTING:
 * - Database operations (save, find, update, delete)
 * - Schema validation with real database constraints
 * - Middleware execution (password hashing, timestamps)
 * - Unique constraints and indexes
 * - Instance methods with real data
 * - Error handling with actual database errors
 */

describe("User Model", () => {
  let mongoServer;

  /**
   * TEST SETUP AND TEARDOWN
   *
   * beforeAll(): Runs once before all tests in this describe block
   * - Creates an in-memory MongoDB instance
   * - Connects mongoose to this test database
   *
   * beforeEach(): Runs before each individual test
   * - Cleans the database to ensure test isolation
   * - Each test starts with a fresh, empty database
   *
   * afterAll(): Runs once after all tests complete
   * - Disconnects from database
   * - Stops the in-memory MongoDB server
   * - Prevents memory leaks
   */
  beforeAll(async () => {
    // Create in-memory MongoDB instance for testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    // Clean database before each test for isolation
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Cleanup after all tests
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  /**
   * HELPER FUNCTIONS
   *
   * These utility functions help us write cleaner, more maintainable tests:
   *
   * setFieldValue(): Safely sets nested object properties
   * - Handles both flat properties (email) and nested ones (profile.username)
   * - Prevents errors when parent objects don't exist
   *
   * deleteField(): Safely removes properties from objects
   * - Used to test required field validation
   * - Handles nested property deletion
   */

  // Helper function to set nested field values properly
  const setFieldValue = (obj, fieldPath, value) => {
    if (fieldPath.includes(".")) {
      const [parentKey, childKey] = fieldPath.split(".");
      if (!obj[parentKey]) obj[parentKey] = {};
      obj[parentKey][childKey] = value;
    } else {
      obj[fieldPath] = value;
    }
  };

  // Helper function to delete nested fields properly
  const deleteField = (obj, fieldPath) => {
    if (fieldPath.includes(".")) {
      const [parentKey, childKey] = fieldPath.split(".");
      if (obj[parentKey]) {
        delete obj[parentKey][childKey];
      }
    } else {
      delete obj[fieldPath];
    }
  };

  describe("create user", () => {
    /**
     * DATA FACTORY PATTERN
     *
     * getBaseValidUser() is a factory function that returns fresh test data
     *
     * WHY USE A FACTORY?
     * - Ensures each test gets clean, unmodified data
     * - Prevents tests from interfering with each other
     * - Makes it easy to update test data in one place
     * - Follows DRY (Don't Repeat Yourself) principle
     *
     * WHAT MAKES THIS DATA "VALID"?
     * - All required fields are present
     * - Values pass all validation rules
     * - Follows expected data structure
     */

    // Shared test data factory function to get fresh data for each test
    const getBaseValidUser = () => ({
      email: "test@uitm.edu.my",
      password: "TestPass123!", // Valid password with special char
      profile: {
        username: "TestUser",
        phoneNumber: "01234567890",
        campus: "SHAH_ALAM", // Use enum keys for consistency
        faculty: "COMPUTER_SCIENCE_MATH", // Use enum keys for consistency
      },
      roles: ["consumer"],
      lastActive: new Date(),
    });
    it("should create a user with a valid data and hashed password", async () => {
      /**
       * BASIC USER CREATION TEST
       *
       * WHAT WE'RE TESTING:
       * 1. Database can save a valid user
       * 2. Password gets hashed (security)
       * 3. All fields are saved correctly
       * 4. Timestamps are generated
       *
       * WHY THIS IS AN INTEGRATION TEST:
       * - Uses real database operations
       * - Tests Mongoose middleware (password hashing)
       * - Verifies complete save workflow
       * - Tests actual bcrypt password comparison
       */

      const testUser = getBaseValidUser();

      const savedUser = await User.create(testUser);

      // Verify user was saved with an ID
      expect(savedUser).toBeDefined();
      expect(savedUser._id).toBeDefined();

      // Verify data integrity
      expect(savedUser.email).toBe(testUser.email);
      expect(savedUser.roles).toStrictEqual(testUser.roles);
      expect(savedUser.profile.username).toBe(testUser.profile.username);
      expect(savedUser.profile.phoneNumber).toBe(testUser.profile.phoneNumber);

      // Verify password was hashed (security check)
      expect(savedUser.password).not.toBe(testUser.password);
      expect(await savedUser.comparePassword(testUser.password)).toBe(true);

      // Verify timestamps
      expect(savedUser.lastActive).toBeInstanceOf(Date);
      expect(savedUser.lastActive.getTime()).toBeLessThanOrEqual(
        new Date().getTime()
      );
    });

    // Example of using jest.fn() for performance monitoring
    it("should complete user creation within reasonable time", async () => {
      const mockTimer = jest.fn();
      const startTime = Date.now();

      const testUser = getBaseValidUser();

      mockTimer("start");
      const savedUser = await User.create(testUser);
      mockTimer("end");

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(savedUser).toBeDefined();
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(mockTimer).toHaveBeenCalledWith("start");
      expect(mockTimer).toHaveBeenCalledWith("end");
      expect(mockTimer).toHaveBeenCalledTimes(2);
    });

    describe("user fields validation", () => {
      const invalidUserData = [
        {
          field: "email",
          value: "invalid-email",
          error: "Email must be a valid email address", // ✅ UPDATED: Generic message
        },
        {
          field: "password",
          value: "short",
          error:
            "Password must be 8-24 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
        },
        {
          field: "profile.username",
          value: "short",
          error:
            "Username must be between 6 and 16 characters, start with a letter or number, and can only contain letters, numbers, underscores, and hyphens",
        },
        {
          field: "profile.phoneNumber",
          value: "12345",
          error: "Phone number must start with 0 and be 10 or 11 digits long",
        },
      ];

      invalidUserData.forEach(({ field, value, error }) => {
        it(`should reject invalid ${field} with correct error message`, async () => {
          const testUser = getBaseValidUser();
          setFieldValue(testUser, field, value);
          await expect(User.create(testUser)).rejects.toThrow(error);
        });
      });
    });

    describe("required fields", () => {
      const requiredFields = [
        { field: "email", error: "Email is required" },
        { field: "password", error: "Password is required" },
        { field: "profile.username", error: "Username is required" },
        { field: "profile.phoneNumber", error: "Phone number is required" },
      ];

      requiredFields.forEach(({ field, error }) => {
        describe(`${field} validation`, () => {
          it("should reject empty string", async () => {
            const testUser = getBaseValidUser();
            setFieldValue(testUser, field, "");
            await expect(User.create(testUser)).rejects.toThrow(error);
          });

          it("should reject null value", async () => {
            const testUser = getBaseValidUser();
            setFieldValue(testUser, field, null);
            await expect(User.create(testUser)).rejects.toThrow(error);
          });

          it("should reject undefined value", async () => {
            const testUser = getBaseValidUser();
            deleteField(testUser, field);
            await expect(User.create(testUser)).rejects.toThrow(error);
          });
        });
      });
    });

    describe("unique fields", () => {
      const registeredUser = {
        ...getBaseValidUser(),
        email: "registered@uitm.edu.my",
        profile: {
          ...getBaseValidUser().profile,
          username: "RegisteredUser",
        },
      };

      const newUser = {
        ...getBaseValidUser(),
        email: "newuser@uitm.edu.my",
        profile: {
          ...getBaseValidUser().profile,
          username: "NewUser",
          phoneNumber: "01987654321",
        },
      };

      beforeEach(async () => {
        await User.create(registeredUser);
      });

      afterEach(async () => {
        await User.deleteMany({});
      });

      it("should reject duplicate username", async () => {
        const duplicateUsername = {
          ...newUser,
          profile: {
            ...newUser.profile,
            username: registeredUser.profile.username,
          },
        };
        await expect(User.create(duplicateUsername)).rejects.toThrow(
          "Username already exists"
        );
      });

      it("should reject duplicate email", async () => {
        const duplicateEmailUser = { ...newUser, email: registeredUser.email };
        await expect(User.create(duplicateEmailUser)).rejects.toThrow(
          "Email already exists"
        );
      });

      it("should reject duplicate phone number", async () => {
        const duplicatePhoneUser = {
          ...newUser,
          profile: {
            ...newUser.profile,
            phoneNumber: registeredUser.profile.phoneNumber,
          },
        };
        await expect(User.create(duplicatePhoneUser)).rejects.toThrow(
          "Phone number already exists"
        );
      });
    });
  });

  describe("User Instance Methods Integration", () => {
    let savedUser;

    beforeEach(async () => {
      // Create a user for testing instance methods
      const userData = {
        email: "methodtest@uitm.edu.my",
        password: "TestPass123!",
        profile: {
          username: "methodtest",
          phoneNumber: "01987654321",
          campus: "SHAH_ALAM", // Use enum keys
          faculty: "COMPUTER_SCIENCE_MATH", // Use enum keys
        },
      };

      savedUser = await User.create(userData);
    });

    it("should compare passwords correctly with real bcrypt", async () => {
      /**
       * INTEGRATION TEST: PASSWORD COMPARISON
       *
       * Testing actual bcrypt comparison, not mocked.
       * This verifies the complete password hashing and comparison flow.
       */

      // Test correct password
      const isCorrect = await savedUser.comparePassword("TestPass123!");
      expect(isCorrect).toBe(true);

      // Test incorrect password
      const isIncorrect = await savedUser.comparePassword("wrongpassword");
      expect(isIncorrect).toBe(false);
    });

    it("should generate valid JWT tokens", async () => {
      /**
       * INTEGRATION TEST: TOKEN GENERATION
       *
       * Testing JWT token generation with real data.
       * Using proper test environment variable management.
       */

      // Store original env vars to restore later
      const originalEnv = {
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_ISSUER: process.env.JWT_ISSUER,
        JWT_AUDIENCE: process.env.JWT_AUDIENCE,
      };

      // Set test-specific environment variables
      process.env.JWT_ACCESS_SECRET = "test_access_secret_for_testing";
      process.env.JWT_REFRESH_SECRET = "test_refresh_secret_for_testing";
      process.env.JWT_ISSUER = "test_issuer";
      process.env.JWT_AUDIENCE = "test_audience";

      try {
        const accessToken = await savedUser.getAccessToken();
        const refreshToken = await savedUser.getRefreshToken();

        // Verify tokens are strings
        expect(typeof accessToken).toBe("string");
        expect(typeof refreshToken).toBe("string");

        // Verify tokens have JWT format (3 parts separated by dots)
        expect(accessToken.split(".")).toHaveLength(3);
        expect(refreshToken.split(".")).toHaveLength(3);

        // Verify refresh token was saved to database
        const userWithTokens = await User.findById(savedUser._id).select(
          "+refreshTokens"
        );
        expect(userWithTokens.refreshTokens).toContain(refreshToken);
      } finally {
        // Restore original environment variables to avoid test pollution
        Object.keys(originalEnv).forEach((key) => {
          if (originalEnv[key] !== undefined) {
            process.env[key] = originalEnv[key];
          } else {
            delete process.env[key];
          }
        });
      }
    });
  });

  describe("User Query Methods Integration", () => {
    beforeEach(async () => {
      // Clean database first to avoid conflicts
      await User.deleteMany({});

      // Create test users with unique identifiers
      await User.create([
        {
          email: "queryuser1@uitm.edu.my",
          password: "TestPass123!",
          profile: {
            username: "queryuser1",
            phoneNumber: "0123456780",
            campus: "SHAH_ALAM", // Use enum keys
            faculty: "COMPUTER_SCIENCE_MATH", // Use enum keys
          },
        },
        {
          email: "queryuser2@uitm.edu.my",
          password: "TestPass123!",
          profile: {
            username: "queryuser2",
            phoneNumber: "0123456781",
            campus: "PUNCAK_ALAM", // Use enum keys
            faculty: "COMPUTER_SCIENCE_MATH", // Use enum keys
          },
        },
      ]);
    });

    it("should find user by email", async () => {
      /**
       * INTEGRATION TEST: DATABASE QUERIES
       *
       * Testing actual database query operations.
       */

      const foundUser = await User.findOne({
        email: "queryuser1@uitm.edu.my",
      }).select("+email"); // ✅ Need to explicitly select email since it's now select: false

      expect(foundUser).toBeTruthy();
      expect(foundUser.email).toBe("queryuser1@uitm.edu.my");
      expect(foundUser.profile.username).toBe("queryuser1");
    });

    it("should return null for non-existent user", async () => {
      const foundUser = await User.findOne({
        email: "nonexistent@uitm.edu.my",
      });
      expect(foundUser).toBeNull();
    });

    it("should find users by campus", async () => {
      const shahAlamUsers = await User.find({ "profile.campus": "SHAH_ALAM" });
      expect(shahAlamUsers).toHaveLength(1);
      expect(shahAlamUsers[0].profile.campus).toBe("SHAH_ALAM");
    });

    it("should count users correctly", async () => {
      const userCount = await User.countDocuments();
      expect(userCount).toBe(2);
    });
  });

  describe("Advanced Integration Tests", () => {
    beforeEach(async () => {
      // Clean database to avoid conflicts
      await User.deleteMany({});
    });

    it("should handle merchant details validation", async () => {
      const merchantData = {
        email: "merchant@uitm.edu.my",
        password: "TestPass123!",
        profile: {
          username: "merchantuser",
          phoneNumber: "01234567899",
          campus: "SHAH_ALAM", // Use enum keys
          faculty: "COMPUTER_SCIENCE_MATH", // Use enum keys
        },
        roles: ["merchant"],
        merchantDetails: {
          shopName: "Test Shop",
          shopSlug: "test-shop",
          shopDescription: "A test shop for testing purposes",
        },
      };

      const savedMerchant = await User.create(merchantData);

      expect(savedMerchant.roles).toContain("merchant");
      expect(savedMerchant.merchantDetails.shopName).toBe("Test Shop");
      expect(savedMerchant.merchantDetails.shopSlug).toBe("test-shop");
    });

    it("should handle multiple roles", async () => {
      const multiRoleUser = {
        email: "multirole@uitm.edu.my",
        password: "TestPass123!",
        profile: {
          username: "multirole",
          phoneNumber: "01234567897",
          campus: "SHAH_ALAM", // Use enum keys
          faculty: "COMPUTER_SCIENCE_MATH", // Use enum keys
        },
        roles: ["consumer", "merchant"],
        merchantDetails: {
          shopName: "Multi Role Shop",
          shopDescription: "Shop for multi-role user",
        },
      };

      const savedUser = await User.create(multiRoleUser);

      expect(savedUser.roles).toContain("consumer");
      expect(savedUser.roles).toContain("merchant");
      expect(savedUser.roles).toHaveLength(2);
    });

    it("should handle default values correctly", async () => {
      const minimalUser = {
        email: "minimal@uitm.edu.my",
        password: "TestPass123!",
        profile: {
          username: "minimaluser",
          phoneNumber: "01234567896",
          campus: "SHAH_ALAM", // Use enum keys
          faculty: "COMPUTER_SCIENCE_MATH", // Use enum keys
        },
        // No role specified - should default to ["consumer"]
      };

      const savedUser = await User.create(minimalUser);

      expect(savedUser.roles).toEqual(["consumer"]);
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.lastActive).toBeInstanceOf(Date);
      expect(savedUser.refreshTokens).toEqual([]);
    });
  });

  /**
   * DELIVERY FEES INTEGRATION TESTS
   *
   * PURPOSE: Test merchant delivery fee customization with platform defaults
   * BACKWARD COMPATIBILITY: Merchants without fees should get platform defaults
   */
  describe("Merchant Delivery Fees", () => {
    it("should create merchant with default delivery fees automatically", async () => {
      /**
       * TDD RED → GREEN → REFACTOR
       *
       * Test that new merchants get platform default delivery fees:
       * - Personal (home): RM 5.00
       * - Campus: RM 2.50
       * - Pickup: RM 1.00
       */
      const merchantUser = {
        email: "merchant@student.uitm.edu.my",
        password: "SecurePass123!",
        profile: {
          username: "testmerchant",
          fullName: "Test Merchant",
          phoneNumber: "0123456789",
          campus: "SHAH_ALAM",
          faculty: "COMPUTER_SCIENCE_MATH",
        },
        roles: ["consumer", "merchant"],
        merchantDetails: {
          shopName: "Test Shop",
          shopSlug: "test-shop",
          isVerified: true,
        },
      };

      const merchant = await User.create(merchantUser);

      // Platform defaults should be applied
      expect(merchant.merchantDetails.deliveryFees).toBeDefined();
      expect(merchant.merchantDetails.deliveryFees.personal.enabled).toBe(true);
      expect(merchant.merchantDetails.deliveryFees.personal.fee).toBe(5.0);
      expect(merchant.merchantDetails.deliveryFees.personal.freeThreshold).toBe(
        0
      );

      expect(merchant.merchantDetails.deliveryFees.campus.enabled).toBe(true);
      expect(merchant.merchantDetails.deliveryFees.campus.fee).toBe(2.5);
      expect(merchant.merchantDetails.deliveryFees.campus.freeThreshold).toBe(
        0
      );

      expect(merchant.merchantDetails.deliveryFees.pickup.enabled).toBe(true);
      expect(merchant.merchantDetails.deliveryFees.pickup.fee).toBe(1.0);

      expect(merchant.merchantDetails.deliveryFees.freeDeliveryForAll).toBe(
        false
      );
      expect(merchant.merchantDetails.deliveryFees.combinedOrderDiscount).toBe(
        0
      );
    });

    it("should allow merchant to customize delivery fees", async () => {
      /**
       * Test that merchants can override platform defaults
       */
      const merchantUser = {
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
            personal: {
              enabled: true,
              fee: 8.0,
              freeThreshold: 100,
            },
            campus: {
              enabled: true,
              fee: 3.0,
              freeThreshold: 50,
            },
            pickup: {
              enabled: false, // Disabled
              fee: 0,
            },
            freeDeliveryForAll: false,
            combinedOrderDiscount: 10, // 10% discount
          },
        },
      };

      const merchant = await User.create(merchantUser);

      expect(merchant.merchantDetails.deliveryFees.personal.fee).toBe(8.0);
      expect(merchant.merchantDetails.deliveryFees.personal.freeThreshold).toBe(
        100
      );
      expect(merchant.merchantDetails.deliveryFees.campus.fee).toBe(3.0);
      expect(merchant.merchantDetails.deliveryFees.campus.freeThreshold).toBe(
        50
      );
      expect(merchant.merchantDetails.deliveryFees.pickup.enabled).toBe(false);
      expect(merchant.merchantDetails.deliveryFees.combinedOrderDiscount).toBe(
        10
      );
    });

    it("should validate delivery fee range (0-100)", async () => {
      /**
       * Test that fees must be between 0 and 100 RM
       */
      const invalidMerchant = {
        email: "invalid@student.uitm.edu.my",
        password: "SecurePass123!",
        profile: {
          username: "invalidmerchant",
          fullName: "Invalid Merchant",
          phoneNumber: "0123456781",
          campus: "SHAH_ALAM",
          faculty: "COMPUTER_SCIENCE_MATH",
        },
        roles: ["consumer", "merchant"],
        merchantDetails: {
          shopName: "Invalid Shop",
          shopSlug: "invalid-shop",
          isVerified: true,
          deliveryFees: {
            personal: {
              enabled: true,
              fee: 150.0, // ❌ Exceeds max
            },
          },
        },
      };

      await expect(User.create(invalidMerchant)).rejects.toThrow();
    });

    it("should validate negative fees are not allowed", async () => {
      /**
       * Test that fees cannot be negative
       */
      const negativeMerchant = {
        email: "negative@student.uitm.edu.my",
        password: "SecurePass123!",
        profile: {
          username: "negativemerchant",
          fullName: "Negative Merchant",
          phoneNumber: "0123456782",
          campus: "SHAH_ALAM",
          faculty: "COMPUTER_SCIENCE_MATH",
        },
        roles: ["consumer", "merchant"],
        merchantDetails: {
          shopName: "Negative Shop",
          shopSlug: "negative-shop",
          isVerified: true,
          deliveryFees: {
            campus: {
              enabled: true,
              fee: -5.0, // ❌ Negative
            },
          },
        },
      };

      await expect(User.create(negativeMerchant)).rejects.toThrow();
    });

    it("should allow free delivery for all orders", async () => {
      /**
       * Test that merchants can enable free delivery for all
       */
      const freeMerchant = {
        email: "free@student.uitm.edu.my",
        password: "SecurePass123!",
        profile: {
          username: "freemerchant",
          fullName: "Free Merchant",
          phoneNumber: "0123456783",
          campus: "SHAH_ALAM",
          faculty: "COMPUTER_SCIENCE_MATH",
        },
        roles: ["consumer", "merchant"],
        merchantDetails: {
          shopName: "Free Shop",
          shopSlug: "free-shop",
          isVerified: true,
          deliveryFees: {
            freeDeliveryForAll: true, // ✅ Free delivery
          },
        },
      };

      const merchant = await User.create(freeMerchant);
      expect(merchant.merchantDetails.deliveryFees.freeDeliveryForAll).toBe(
        true
      );
    });

    it("should set deliverable campuses for UiTM merchants", async () => {
      /**
       * Test that merchants can specify which campuses they deliver to
       */
      const campusMerchant = {
        email: "campus@student.uitm.edu.my",
        password: "SecurePass123!",
        profile: {
          username: "campusmerchant",
          fullName: "Campus Merchant",
          phoneNumber: "0123456784",
          campus: "SHAH_ALAM",
          faculty: "COMPUTER_SCIENCE_MATH",
        },
        roles: ["consumer", "merchant"],
        merchantDetails: {
          shopName: "Campus Shop",
          shopSlug: "campus-shop",
          isVerified: true,
          deliverableCampuses: ["SHAH_ALAM", "PUNCAK_ALAM"],
        },
      };

      const merchant = await User.create(campusMerchant);
      expect(merchant.merchantDetails.deliverableCampuses).toEqual([
        "SHAH_ALAM",
        "PUNCAK_ALAM",
      ]);
    });

    it("should maintain backward compatibility for existing merchants without delivery fees", async () => {
      /**
       * CRITICAL: Existing merchants without deliveryFees should still work
       * and get platform defaults automatically
       */
      const legacyMerchant = {
        email: "legacy@student.uitm.edu.my",
        password: "SecurePass123!",
        profile: {
          username: "legacymerchant",
          fullName: "Legacy Merchant",
          phoneNumber: "0123456785",
          campus: "SHAH_ALAM",
          faculty: "COMPUTER_SCIENCE_MATH",
        },
        roles: ["consumer", "merchant"],
        merchantDetails: {
          shopName: "Legacy Shop",
          shopSlug: "legacy-shop",
          isVerified: true,
          // NO deliveryFees field - should get defaults
        },
      };

      const merchant = await User.create(legacyMerchant);

      // Should have default fees even though not specified
      expect(merchant.merchantDetails.deliveryFees).toBeDefined();
      expect(merchant.merchantDetails.deliveryFees.personal.fee).toBe(5.0);
      expect(merchant.merchantDetails.deliveryFees.campus.fee).toBe(2.5);
      expect(merchant.merchantDetails.deliveryFees.pickup.fee).toBe(1.0);
    });
  });
});
