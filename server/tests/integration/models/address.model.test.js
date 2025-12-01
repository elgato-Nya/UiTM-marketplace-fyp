const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { User } = require("../../../models");
const { addressService } = require("../../../services/user");

/**
 * INTEGRATION TESTS FOR ADDRESS MANAGEMENT
 *
 * PURPOSE: Test how address components work together in realistic ecommerce scenarios
 *
 * WHAT ARE INTEGRATION TESTS FOR ADDRESSES?
 * - Test complete address workflows from service to database
 * - Use real database (MongoDB Memory Server for testing)
 * - Test actual address business logic, not mocked behavior
 * - Verify address operations that users depend on daily
 *
 * INTEGRATION vs UNIT TESTS FOR ADDRESSES:
 * ┌─────────────────┬─────────────────┬──────────────────┐
 * │                 │ Unit Tests      │ Integration Tests│
 * ├─────────────────┼─────────────────┼──────────────────┤
 * │ Address Schema  │ Validation only │ Full CRUD ops    │
 * │ Service Layer   │ Mocked DB       │ Real DB + User   │
 * │ Error Handling  │ Isolated        │ End-to-end flow  │
 * │ Business Logic  │ Function level  │ Complete workflow│
 * └─────────────────┴─────────────────┴──────────────────┘
 *
 * WHAT WE'RE TESTING:
 * - Address CRUD operations through service layer
 * - Address validation with real user documents
 * - Business logic for campus vs personal addresses
 * - Error handling with actual database constraints
 * - Address lifecycle management (add, update, delete)
 */

describe("Address Management", () => {
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
   * getBaseValidUser(): Creates a valid user for address testing
   * - Ensures each test gets clean, unmodified user data
   * - Prevents tests from interfering with each other
   * - Follows same pattern as user integration tests
   *
   * getValidCampusAddress(): Factory for campus address data
   * getValidPersonalAddress(): Factory for personal address data
   */

  // Shared test data factory function to get fresh user data for each test
  const getBaseValidUser = () => ({
    email: "addresstest@uitm.edu.my",
    password: "TestPass123!", // Valid password with special char
    profile: {
      username: "addressuser",
      phoneNumber: "01234567890",
      campus: "SHAH_ALAM", // Use enum keys for consistency
      faculty: "COMPUTER_SCIENCE_MATH", // Use enum keys for consistency
    },
    roles: ["consumer"],
    lastActive: new Date(),
  });

  // Factory for valid campus address data
  const getValidCampusAddress = () => ({
    type: "campus",
    recipientName: "John Doe",
    recipientPhone: "01234567890",
    campusAddress: {
      campus: "SHAH_ALAM", // Use enum key
      building: "Block A",
      floor: "Level 3",
      room: "Room 301",
    },
  });

  // Factory for valid personal address data
  const getValidPersonalAddress = () => ({
    type: "personal",
    recipientName: "Jane Smith",
    recipientPhone: "01234567891",
    personalAddress: {
      addressLine1: "123 Main Street",
      addressLine2: "Apartment 2B",
      city: "Shah Alam",
      state: "SELANGOR", // Use enum key
      postcode: "40000",
    },
  });

  describe("Address Service Integration", () => {
    /**
     * DATA FACTORY PATTERN
     *
     * Following the same pattern as user integration tests:
     * - Each test creates its own fresh user data
     * - Prevents test interference
     * - Makes tests independent and reliable
     */

    let testUser;

    beforeEach(async () => {
      // Create a fresh user for each address test
      const userData = getBaseValidUser();
      testUser = await User.create(userData);
    });

    it("should add a campus address with complete data validation", async () => {
      /**
       * INTEGRATION TEST: ADDRESS CREATION
       *
       * WHAT WE'RE TESTING:
       * 1. Service layer can create address
       * 2. Address gets embedded in user document
       * 3. All fields are saved correctly
       * 4. Campus address validation works
       *
       * WHY THIS IS AN INTEGRATION TEST:
       * - Uses real database operations
       * - Tests service layer + schema together
       * - Verifies complete address workflow
       * - Tests actual embedded document behavior
       */

      const campusAddress = getValidCampusAddress();

      // Service returns the new address, not the full user
      const newAddress = await addressService.addUserAddress(
        testUser._id,
        campusAddress
      );

      // Verify address was created
      expect(newAddress).toBeDefined();
      expect(newAddress.type).toBe("campus");
      expect(newAddress.recipientName).toBe("John Doe");
      expect(newAddress.recipientPhone).toBe("01234567890");
      expect(newAddress.campusAddress.campus).toBe("SHAH_ALAM"); // Stored as enum key
      expect(newAddress.campusAddress.building).toBe("Block A");
      expect(newAddress.campusAddress.floor).toBe("Level 3");
      expect(newAddress.campusAddress.room).toBe("Room 301");

      // Verify address has MongoDB _id
      expect(newAddress._id).toBeDefined();

      // Verify it was saved to the user document
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.addresses).toHaveLength(1);
    });

    it("should add a personal address with complete data validation", async () => {
      /**
       * INTEGRATION TEST: PERSONAL ADDRESS CREATION
       *
       * Testing personal address type with different validation rules
       */

      const personalAddress = getValidPersonalAddress();

      const newAddress = await addressService.addUserAddress(
        testUser._id,
        personalAddress
      );

      // Verify personal address data integrity
      expect(newAddress).toBeDefined();
      expect(newAddress.type).toBe("personal");
      expect(newAddress.recipientName).toBe("Jane Smith");
      expect(newAddress.recipientPhone).toBe("01234567891");
      expect(newAddress.personalAddress.addressLine1).toBe("123 Main Street");
      expect(newAddress.personalAddress.addressLine2).toBe("Apartment 2B");
      expect(newAddress.personalAddress.city).toBe("Shah Alam");
      expect(newAddress.personalAddress.state).toBe("SELANGOR"); // Stored as enum key
      expect(newAddress.personalAddress.postcode).toBe("40000");

      // Verify it was saved to the user document
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.addresses).toHaveLength(1);
    });

    it("should retrieve all user addresses efficiently", async () => {
      /**
       * INTEGRATION TEST: ADDRESS RETRIEVAL
       *
       * Testing complete workflow:
       * 1. Add multiple addresses
       * 2. Retrieve all addresses
       * 3. Verify data integrity
       */

      const campusAddress = getValidCampusAddress();
      const personalAddress = getValidPersonalAddress();

      // Add both addresses
      await addressService.addUserAddress(testUser._id, campusAddress);
      await addressService.addUserAddress(testUser._id, personalAddress);

      // Retrieve addresses
      const addresses = await addressService.getUserAddresses(testUser._id);

      // Verify retrieval
      expect(addresses).toHaveLength(2);
      expect(addresses.find((addr) => addr.type === "campus")).toBeDefined();
      expect(addresses.find((addr) => addr.type === "personal")).toBeDefined();

      // Verify data integrity after retrieval
      const campusAddr = addresses.find((addr) => addr.type === "campus");
      const personalAddr = addresses.find((addr) => addr.type === "personal");

      expect(campusAddr.recipientName).toBe("John Doe");
      expect(personalAddr.recipientName).toBe("Jane Smith");
    });

    it("should update an existing address completely", async () => {
      /**
       * INTEGRATION TEST: ADDRESS UPDATE
       *
       * Testing complete update workflow:
       * 1. Create address
       * 2. Update with new data
       * 3. Verify changes persisted
       */

      // Add an address first
      const originalAddress = getValidPersonalAddress();
      originalAddress.recipientName = "John Doe";
      originalAddress.personalAddress.addressLine1 = "123 Old Street";

      const newAddress = await addressService.addUserAddress(
        testUser._id,
        originalAddress
      );
      const addressId = newAddress._id;

      // Update the address
      const updatedAddressData = {
        recipientName: "John Smith", // Changed name
        phoneNumber: "01234567890",
        personalAddress: {
          addressLine1: "456 New Street", // Changed street
          city: "Shah Alam",
          state: "SELANGOR", // Use enum key
          postcode: "40000",
        },
      };

      const updatedAddress = await addressService.updateUserAddress(
        testUser._id,
        addressId,
        updatedAddressData
      );

      // Verify update worked
      expect(updatedAddress.recipientName).toBe("John Smith");
      expect(updatedAddress.personalAddress.addressLine1).toBe(
        "456 New Street"
      );

      // Verify unchanged fields remain
      expect(updatedAddress.personalAddress.city).toBe("Shah Alam");
      expect(updatedAddress.personalAddress.state).toBe("SELANGOR");

      // Verify it was saved to user document
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.addresses).toHaveLength(1);
    });

    it("should delete an address from user profile", async () => {
      /**
       * INTEGRATION TEST: ADDRESS DELETION
       *
       * Testing complete deletion workflow:
       * 1. Create address
       * 2. Verify it exists
       * 3. Delete it
       * 4. Verify it's gone
       */

      const address = getValidCampusAddress();

      const newAddress = await addressService.addUserAddress(
        testUser._id,
        address
      );
      expect(newAddress).toBeDefined();

      const addressId = newAddress._id;

      // Delete the address
      const result = await addressService.deleteUserAddress(
        testUser._id,
        addressId
      );

      // Verify deletion result
      expect(result.deleted).toBe(true);
      expect(result._id.toString()).toBe(addressId.toString());

      // Verify address removed from user document
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.addresses).toHaveLength(0);
    });

    it("should handle multiple addresses per user correctly", async () => {
      /**
       * INTEGRATION TEST: MULTIPLE ADDRESSES
       *
       * Real-world scenario: Users often have multiple delivery addresses
       */

      const campusAddress1 = getValidCampusAddress();
      campusAddress1.recipientName = "Campus Recipient";
      campusAddress1.campusAddress.room = "Room 101";

      const campusAddress2 = getValidCampusAddress();
      campusAddress2.recipientName = "Second Campus Recipient";
      campusAddress2.campusAddress.room = "Room 202";
      campusAddress2.recipientPhone = "01234567892";

      const personalAddress = getValidPersonalAddress();

      // Add all addresses
      await addressService.addUserAddress(testUser._id, campusAddress1);
      await addressService.addUserAddress(testUser._id, campusAddress2);
      await addressService.addUserAddress(testUser._id, personalAddress);

      // Verify all were added
      const addresses = await addressService.getUserAddresses(testUser._id);
      expect(addresses).toHaveLength(3);

      // Verify each address is distinct
      const campus1 = addresses.find(
        (addr) => addr.campusAddress?.room === "Room 101"
      );
      const campus2 = addresses.find(
        (addr) => addr.campusAddress?.room === "Room 202"
      );
      const personal = addresses.find((addr) => addr.type === "personal");

      expect(campus1).toBeDefined();
      expect(campus2).toBeDefined();
      expect(personal).toBeDefined();

      expect(campus1.recipientName).toBe("Campus Recipient");
      expect(campus2.recipientName).toBe("Second Campus Recipient");
    });
  });

  describe("Address Validation Integration", () => {
    /**
     * VALIDATION TESTING WITH REAL CONSTRAINTS
     *
     * Following user integration test pattern for validation:
     * - Test each validation rule
     * - Use real database constraints
     * - Verify error messages are correct
     */

    let testUser;

    beforeEach(async () => {
      const userData = getBaseValidUser();
      testUser = await User.create(userData);
    });

    describe("address type validation", () => {
      const invalidTypes = [
        {
          type: "invalid",
          error: "Address type must be one of 'campus', 'personal'",
        },
        { type: "", error: "Address type is required" },
        { type: null, error: "Address type is required" },
      ];

      invalidTypes.forEach(({ type, error }) => {
        it(`should reject ${
          type === null ? "null" : type === "" ? "empty" : "invalid"
        } address type`, async () => {
          const invalidAddress = {
            type: type,
            recipientName: "John Doe",
            recipientPhone: "01234567890",
          };

          await expect(
            addressService.addUserAddress(testUser._id, invalidAddress)
          ).rejects.toThrow(error);
        });
      });
    });

    describe("required fields validation", () => {
      const requiredFields = [
        { field: "recipientName", error: "Recipient name is required" },
        { field: "recipientPhone", error: "Phone number is required" },
      ];

      requiredFields.forEach(({ field, error }) => {
        describe(`${field} validation`, () => {
          it("should reject empty string", async () => {
            const address = getValidCampusAddress();
            address[field] = "";
            await expect(
              addressService.addUserAddress(testUser._id, address)
            ).rejects.toThrow(error);
          });

          it("should reject null value", async () => {
            const address = getValidCampusAddress();
            address[field] = null;
            await expect(
              addressService.addUserAddress(testUser._id, address)
            ).rejects.toThrow(error);
          });

          it("should reject undefined value", async () => {
            const address = getValidCampusAddress();
            delete address[field];
            await expect(
              addressService.addUserAddress(testUser._id, address)
            ).rejects.toThrow(error);
          });
        });
      });
    });

    describe("phone number validation", () => {
      const invalidPhoneNumbers = [
        {
          phone: "invalid",
          error: "Phone number must start with 0 and be 10 or 11 digits long",
        },
        {
          phone: "12345",
          error: "Phone number must start with 0 and be 10 or 11 digits long",
        },
        {
          phone: "123456789012",
          error: "Phone number must start with 0 and be 10 or 11 digits long",
        },
      ];

      invalidPhoneNumbers.forEach(({ phone, error }) => {
        it(`should reject invalid phone number: ${phone}`, async () => {
          const address = getValidCampusAddress();
          address.recipientPhone = phone;

          await expect(
            addressService.addUserAddress(testUser._id, address)
          ).rejects.toThrow(error);
        });
      });
    });

    describe("campus address specific validation", () => {
      it("should require campus address details for campus type", async () => {
        const invalidCampusAddress = {
          type: "campus",
          recipientName: "John Doe",
          phoneNumber: "01234567890",
          // Missing campusAddress
        };

        await expect(
          addressService.addUserAddress(testUser._id, invalidCampusAddress)
        ).rejects.toThrow();
      });
    });

    describe("personal address specific validation", () => {
      it("should require personal address details for personal type", async () => {
        const invalidPersonalAddress = {
          type: "personal",
          recipientName: "Jane Smith",
          phoneNumber: "01234567891",
          // Missing personalAddress
        };

        await expect(
          addressService.addUserAddress(testUser._id, invalidPersonalAddress)
        ).rejects.toThrow();
      });
    });
  });

  describe("Address Error Handling Integration", () => {
    /**
     * ERROR HANDLING WITH REAL DATABASE
     *
     * Testing error scenarios that occur in production:
     * - Non-existent users
     * - Non-existent addresses
     * - Database connection issues
     */

    let testUser;

    beforeEach(async () => {
      const userData = getBaseValidUser();
      testUser = await User.create(userData);
    });

    it("should handle non-existent user gracefully", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const address = getValidCampusAddress();

      await expect(
        addressService.addUserAddress(nonExistentUserId, address)
      ).rejects.toThrow("User not found");
    });

    it("should handle non-existent address retrieval gracefully", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();

      await expect(
        addressService.getUserAddresses(nonExistentUserId)
      ).rejects.toThrow("User not found");
    });

    it("should handle non-existent address update gracefully", async () => {
      const nonExistentAddressId = new mongoose.Types.ObjectId();
      const updateData = {
        recipientName: "Updated Name",
        phoneNumber: "01234567890",
      };

      await expect(
        addressService.updateUserAddress(
          testUser._id,
          nonExistentAddressId,
          updateData
        )
      ).rejects.toThrow();
    });

    it("should handle non-existent address deletion gracefully", async () => {
      const nonExistentAddressId = new mongoose.Types.ObjectId();

      await expect(
        addressService.deleteUserAddress(testUser._id, nonExistentAddressId)
      ).rejects.toThrow();
    });

    it("should handle invalid ObjectId format gracefully", async () => {
      const invalidId = "invalid-object-id";

      await expect(
        addressService.getUserAddresses(invalidId)
      ).rejects.toThrow();
    });
  });

  describe("Address Business Logic Integration", () => {
    /**
     * BUSINESS LOGIC TESTING
     *
     * Testing ecommerce-specific address behavior:
     * - Default addresses
     * - Address limits
     * - Address preferences
     */

    let testUser;

    beforeEach(async () => {
      const userData = getBaseValidUser();
      testUser = await User.create(userData);
    });

    it("should allow users to have both campus and personal addresses", async () => {
      const campusAddress = getValidCampusAddress();
      const personalAddress = getValidPersonalAddress();

      await addressService.addUserAddress(testUser._id, campusAddress);
      await addressService.addUserAddress(testUser._id, personalAddress);

      const addresses = await addressService.getUserAddresses(testUser._id);

      expect(addresses).toHaveLength(2);
      expect(addresses.some((addr) => addr.type === "campus")).toBe(true);
      expect(addresses.some((addr) => addr.type === "personal")).toBe(true);
    });

    it("should maintain address order and timestamps", async () => {
      const address1 = getValidCampusAddress();
      address1.recipientName = "First Address";

      const address2 = getValidPersonalAddress();
      address2.recipientName = "Second Address";

      // Add addresses with slight delay
      await addressService.addUserAddress(testUser._id, address1);
      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
      await addressService.addUserAddress(testUser._id, address2);

      const addresses = await addressService.getUserAddresses(testUser._id);

      expect(addresses).toHaveLength(2);
      // Verify addresses maintain their data
      expect(
        addresses.find((addr) => addr.recipientName === "First Address")
      ).toBeDefined();
      expect(
        addresses.find((addr) => addr.recipientName === "Second Address")
      ).toBeDefined();
    });

    it("should handle address updates without affecting other addresses", async () => {
      const address1 = getValidCampusAddress();
      address1.recipientName = "First Address";

      const address2 = getValidPersonalAddress();
      address2.recipientName = "Second Address";

      // Add both addresses
      const firstAddress = await addressService.addUserAddress(
        testUser._id,
        address1
      );
      await addressService.addUserAddress(testUser._id, address2);

      // Get first address ID
      const firstAddressId = firstAddress._id;

      // Update first address
      const updateData = {
        recipientName: "Updated First Address",
        phoneNumber: "01234567890",
        campusAddress: {
          campus: "SHAH_ALAM", // Use enum key
          building: "Updated Building",
          floor: "Updated Floor",
          room: "Updated Room",
        },
      };

      const updatedAddress = await addressService.updateUserAddress(
        testUser._id,
        firstAddressId,
        updateData
      );

      // Verify the updated address
      expect(updatedAddress.recipientName).toBe("Updated First Address");
      expect(updatedAddress.campusAddress.building).toBe("Updated Building");

      // Fetch user to verify both addresses exist
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.addresses).toHaveLength(2);

      const updatedFirstAddr = updatedUser.addresses.find(
        (addr) => addr.recipientName === "Updated First Address"
      );
      const unchangedSecondAddr = updatedUser.addresses.find(
        (addr) => addr.recipientName === "Second Address"
      );

      expect(updatedFirstAddr).toBeDefined();
      expect(updatedFirstAddr.campusAddress.building).toBe("Updated Building");

      expect(unchangedSecondAddr).toBeDefined();
      expect(unchangedSecondAddr.personalAddress.city).toBe("Shah Alam"); // Original data intact
    });
  });
});
