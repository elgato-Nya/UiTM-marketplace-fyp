const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { User, Address } = require("../../models/user");

describe("Address Integration Tests", () => {
  let mongoServer;
  let testUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await Address.deleteMany({}); // Clear the Address collection before each test
    await User.deleteMany({}); // Clear the User collection before each test

    testUser = await User.create({
      email: "test@uitm.edu.my",
      password: "Password123",
      profile: {
        username: "testuser",
        phoneNumber: "0123456789",
        campus: "UiTM Kampus Arau",
        faculty: "Fakulti Senibina, Perancangan dan Ukur",
      },
      role: ["consumer"],
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("Campus Address CRUD", () => {
    it("should create a valid campus address", async () => {
      const campusAddress = {
        recipientName: "John Weak",
        phoneNumber: "01234567890",
        type: "campus",
        campusAddress: {
          campus: "UiTM Kampus Arau",
          building: "Go Block 8",
          floor: "3A",
          room: "3A",
        },
        userId: testUser._id,
      };

      const savedAddress = await Address.create(campusAddress);

      expect(savedAddress).toBeDefined();
      expect(savedAddress.type).toBe("campus");
      expect(savedAddress.recipientName).toBe("John Weak");
      expect(savedAddress.phoneNumber).toBe("01234567890");
      expect(savedAddress.campusAddress.campus).toBe("ARAU");
      expect(savedAddress.campusAddress.building).toBe("Go Block 8");
      expect(savedAddress.campusAddress.floor).toBe("3A");
      expect(savedAddress.campusAddress.room).toBe("3A");
    });
  });

  describe("Personal Address CRUD", () => {
    it("should create a valid personal address", async () => {
      const personalAddress = {
        recipientName: "Jennifer Lawrence",
        phoneNumber: "01234567890",
        type: "personal",
        personalAddress: {
          addressLine1: "123 Main St",
          addressLine2: "Apt 4B",
          city: "Shah Alam",
          state: "Selangor",
          postcode: "40000",
        },
        userId: testUser._id,
      };

      const savedAddress = await Address.create(personalAddress);

      expect(savedAddress).toBeDefined();
      expect(savedAddress.type).toBe("personal");
      expect(savedAddress.recipientName).toBe("Jennifer Lawrence");
      expect(savedAddress.phoneNumber).toBe("01234567890");
      expect(savedAddress.personalAddress.addressLine1).toBe("123 Main St");
      expect(savedAddress.personalAddress.addressLine2).toBe("Apt 4B");
      expect(savedAddress.personalAddress.city).toBe("Shah Alam");
      expect(savedAddress.personalAddress.state).toBe("Selangor");
      expect(savedAddress.personalAddress.postcode).toBe("40000");
    });
  });

  describe("Address Queries", () => {
    beforeEach(async () => {
      // Create test addresses
      await Address.create([
        {
          type: "campus",
          recipientName: "Ahmad bin Ali",
          phoneNumber: "0123456789",
          campusAddress: {
            campus: "UiTM Kampus Arau", // Use consistent campus with testUser
            building: "Kolej Kediaman",
            floor: "Tingkat 2",
            room: "Bilik 205",
          },
          userId: testUser._id,
        },
        {
          type: "personal",
          recipientName: "Ahmad bin Ali",
          phoneNumber: "0123456789",
          personalAddress: {
            addressLine1: "123 Jalan Merdeka",
            city: "Shah Alam",
            state: "Selangor",
            postcode: "40150",
          },
          userId: testUser._id,
        },
      ]);
    });

    it("should find user addresses by type", async () => {
      const campusAddresses = await Address.find({
        userId: testUser._id,
        type: "campus",
      });

      expect(campusAddresses).toHaveLength(1);
      expect(campusAddresses[0].type).toBe("campus");
    });

    it("should find all user addresses", async () => {
      const userAddresses = await Address.find({
        userId: testUser._id,
      });

      expect(userAddresses).toHaveLength(2);
      expect(userAddresses.some((addr) => addr.type === "campus")).toBe(true);
      expect(userAddresses.some((addr) => addr.type === "personal")).toBe(true);
    });

    it("should find addresses by campus", async () => {
      const campusAddresses = await Address.find({
        "campusAddress.campus": "ARAU", // Query by stored key, not display value
      });

      expect(campusAddresses).toHaveLength(1);
      expect(campusAddresses[0].campusAddress.campus).toBe("ARAU");
    });
  });

  describe("Address Management Methods", () => {
    it("should add address using user method", async () => {
      const addressData = {
        type: "campus",
        recipientName: "Test User",
        phoneNumber: "0123456789",
        campusAddress: {
          campus: "UiTM Kampus Arau",
          building: "Block A",
          floor: "Level 2",
          room: "Room 201",
        },
      };

      const savedAddress = await testUser.addAddress(addressData);

      expect(savedAddress).toBeDefined();
      expect(savedAddress.userId.toString()).toBe(testUser._id.toString());

      // Refresh user to check addresses array
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.addresses).toHaveLength(1);
      expect(updatedUser.addresses[0].toString()).toBe(
        savedAddress._id.toString()
      );
    });

    it("should get user addresses using user method", async () => {
      // Add test addresses first
      await testUser.addAddress({
        type: "campus",
        recipientName: "Test User",
        phoneNumber: "0123456789",
        campusAddress: {
          campus: "UiTM Kampus Arau",
          building: "Block A",
          floor: "Level 2",
          room: "Room 201",
        },
      });

      await testUser.addAddress({
        type: "personal",
        recipientName: "Test User",
        phoneNumber: "0123456789",
        personalAddress: {
          addressLine1: "123 Test Street",
          city: "Test City",
          state: "Selangor",
          postcode: "40000",
        },
      });

      const addresses = await testUser.getAddresses();

      expect(addresses).toHaveLength(2);
      expect(addresses[0]).toHaveProperty("type");
      expect(addresses[1]).toHaveProperty("type");
    });

    it("should remove address using user method", async () => {
      // Add address first
      const address = await testUser.addAddress({
        type: "campus",
        recipientName: "Test User",
        phoneNumber: "0123456789",
        campusAddress: {
          campus: "UiTM Kampus Arau",
          building: "Block A",
          floor: "Level 2",
          room: "Room 201",
        },
      });

      // Remove the address
      await testUser.removeAddress(address._id);

      // Verify address is removed from database
      const deletedAddress = await Address.findById(address._id);
      expect(deletedAddress).toBeNull();

      // Verify address reference is removed from user
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.addresses).toHaveLength(0);
    });
  });

  describe("Address Validation", () => {
    it("should reject invalid campus address", async () => {
      const invalidAddress = {
        type: "campus",
        recipientName: "", // Invalid: empty name
        phoneNumber: "invalid", // Invalid: wrong format
        campusAddress: {
          campus: "Invalid Campus", // Invalid: not in enum
          building: "", // Invalid: empty
          floor: "", // Invalid: empty
          room: "", // Invalid: empty
        },
        userId: testUser._id,
      };

      await expect(Address.create(invalidAddress)).rejects.toThrow();
    });

    it("should reject invalid personal address", async () => {
      const invalidAddress = {
        type: "personal",
        recipientName: "A", // Invalid: too short
        phoneNumber: "123", // Invalid: wrong format
        personalAddress: {
          addressLine1: "ABC", // Invalid: too short
          city: "X", // Invalid: too short
          state: "Invalid State", // Invalid: not Malaysian state
          postcode: "123", // Invalid: wrong format
        },
        userId: testUser._id,
      };

      await expect(Address.create(invalidAddress)).rejects.toThrow();
    });

    it("should require correct fields based on address type", async () => {
      // Campus address missing campus fields
      const campusAddressMissingFields = {
        type: "campus",
        recipientName: "Test User",
        phoneNumber: "0123456789",
        personalAddress: {
          // Wrong: personal fields for campus type
          addressLine1: "123 Test Street",
          city: "Test City",
          state: "Selangor",
          postcode: "40000",
        },
        userId: testUser._id,
      };

      await expect(
        Address.create(campusAddressMissingFields)
      ).rejects.toThrow();

      // Personal address missing personal fields
      const personalAddressMissingFields = {
        type: "personal",
        recipientName: "Test User",
        phoneNumber: "0123456789",
        campusAddress: {
          // Wrong: campus fields for personal type
          campus: "UiTM Kampus Arau",
          building: "Block A",
          floor: "Level 2",
          room: "Room 201",
        },
        userId: testUser._id,
      };

      await expect(
        Address.create(personalAddressMissingFields)
      ).rejects.toThrow();
    });
  });

  describe("Address Virtual Methods", () => {
    it("should format campus address correctly", async () => {
      const address = await Address.create({
        type: "campus",
        recipientName: "Test User",
        phoneNumber: "0123456789",
        campusAddress: {
          campus: "UiTM Kampus Arau",
          building: "Block A",
          floor: "Level 2",
          room: "Room 201",
        },
        userId: testUser._id,
      });

      const formatted = address.formattedAddress;
      expect(formatted).toContain("Level 2");
      expect(formatted).toContain("Room 201");
      expect(formatted).toContain("Block A");
      expect(formatted).toContain("ARAU"); // Stored as key after conversion
    });

    it("should format personal address correctly", async () => {
      const address = await Address.create({
        type: "personal",
        recipientName: "Test User",
        phoneNumber: "0123456789",
        personalAddress: {
          addressLine1: "123 Test Street",
          addressLine2: "Unit 4B",
          city: "Shah Alam",
          state: "Selangor",
          postcode: "40000",
        },
        userId: testUser._id,
      });

      const formatted = address.formattedAddress;
      expect(formatted).toContain("123 Test Street");
      expect(formatted).toContain("Unit 4B");
      expect(formatted).toContain("Shah Alam");
      expect(formatted).toContain("Selangor");
      expect(formatted).toContain("40000");
    });
  });
});
