const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Wishlist } = require("../../../models/wishlist/wishlist.model");
const { User, Listing } = require("../../../models");

/**
 * WISHLIST MODEL INTEGRATION TESTS
 * Tests wishlist functionality with real database operations
 *
 * KEY LEARNINGS:
 * - MAX_WISHLIST_ITEMS = 250
 * - addItem() requires priceWhenAdded parameter
 * - addItem() throws CONFLICT error if duplicate
 * - Static method: getWishlistItemDetails(userId)
 * - Unique userId constraint enforced
 */
describe("Wishlist Model Integration Tests", () => {
  let mongoServer;
  let testUser;
  let testListings;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await Wishlist.deleteMany({});
    await User.deleteMany({});
    await Listing.deleteMany({});

    // Create test user
    testUser = await User.create({
      email: "wishuser@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "wishuser99",
        phoneNumber: "01234567890",
        campus: "SHAH_ALAM",
        faculty: "COMPUTER_SCIENCE_MATH",
      },
    });

    // Create merchant
    const merchant = await User.create({
      email: "merchant@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "merchantwish",
        phoneNumber: "01234567891",
        campus: "SHAH_ALAM",
        faculty: "BUSINESS_MANAGEMENT",
      },
      roles: ["merchant"],
    });

    // Create test listings
    testListings = await Listing.create([
      {
        name: "Gaming Mouse",
        price: 150,
        category: "electronics",
        type: "product",
        stock: 10,
        images: ["https://example.com/mouse.jpg"],
        seller: {
          userId: merchant._id,
          username: merchant.profile.username,
        },
      },
      {
        name: "Mechanical Keyboard",
        price: 300,
        category: "electronics",
        type: "product",
        stock: 5,
        images: ["https://example.com/keyboard.jpg"],
        seller: {
          userId: merchant._id,
          username: merchant.profile.username,
        },
      },
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("Wishlist Creation", () => {
    it("should create wishlist with userId", async () => {
      const wishlist = await Wishlist.create({
        userId: testUser._id,
      });

      expect(wishlist.userId.toString()).toBe(testUser._id.toString());
      expect(wishlist.items).toEqual([]);
    });

    it("should require userId", async () => {
      await expect(Wishlist.create({})).rejects.toThrow();
    });

    it("should enforce unique userId", async () => {
      await Wishlist.create({ userId: testUser._id });

      await expect(Wishlist.create({ userId: testUser._id })).rejects.toThrow();
    });
  });

  describe("Wishlist Item Management - Instance Methods", () => {
    let wishlist;

    beforeEach(async () => {
      wishlist = await Wishlist.create({ userId: testUser._id });
    });

    it("should add item to wishlist with priceWhenAdded", async () => {
      wishlist.addItem(testListings[0]._id, testListings[0].price);
      await wishlist.save();

      expect(wishlist.items).toHaveLength(1);
      expect(wishlist.items[0].listing.toString()).toBe(
        testListings[0]._id.toString()
      );
      expect(wishlist.items[0].priceWhenAdded).toBe(150);
    });

    it("should throw error when adding duplicate item", async () => {
      wishlist.addItem(testListings[0]._id, testListings[0].price);
      await wishlist.save();

      expect(() => {
        wishlist.addItem(testListings[0]._id, testListings[0].price);
      }).toThrow("already exists");
    });

    it("should remove item from wishlist", async () => {
      wishlist.addItem(testListings[0]._id, testListings[0].price);
      wishlist.addItem(testListings[1]._id, testListings[1].price);
      await wishlist.save();

      wishlist.removeItem(testListings[0]._id);
      await wishlist.save();

      const reloaded = await Wishlist.findById(wishlist._id);
      expect(reloaded.items).toHaveLength(1);
      expect(reloaded.items[0].listing.toString()).toBe(
        testListings[1]._id.toString()
      );
    });

    it("should throw error when removing non-existent item", async () => {
      const randomId = new mongoose.Types.ObjectId();
      expect(() => wishlist.removeItem(randomId)).toThrow("not found");
    });

    it("should clear all wishlist items", async () => {
      wishlist.addItem(testListings[0]._id, testListings[0].price);
      wishlist.addItem(testListings[1]._id, testListings[1].price);
      await wishlist.save();

      wishlist.clearWishlist();
      await wishlist.save();

      const reloaded = await Wishlist.findById(wishlist._id);
      expect(reloaded.items).toHaveLength(0);
    });

    it("should enforce wishlist limit (250 items)", async () => {
      // Create 250 listings
      const merchant = await User.findOne({ roles: "merchant" });
      const manyListings = [];

      for (let i = 0; i < 250; i++) {
        const listing = await Listing.create({
          name: `Item ${i}`,
          price: 50,
          category: "books",
          type: "product",
          stock: 10,
          images: ["https://example.com/item.jpg"],
          seller: {
            userId: merchant._id,
            username: merchant.profile.username,
          },
        });
        manyListings.push(listing);
      }

      // Add 250 items - should succeed
      for (let i = 0; i < 250; i++) {
        wishlist.addItem(manyListings[i]._id, 50);
      }
      await wishlist.save();

      const reloaded = await Wishlist.findById(wishlist._id);
      expect(reloaded.items).toHaveLength(250);

      // Try to add 251st item - should throw error
      const extraListing = await Listing.create({
        name: "Extra Item",
        price: 50,
        category: "books",
        type: "product",
        stock: 10,
        images: ["https://example.com/extra.jpg"],
        seller: {
          userId: merchant._id,
          username: merchant.profile.username,
        },
      });

      expect(() => {
        reloaded.addItem(extraListing._id, 50);
      }).toThrow("limit");
    });
  });

  describe("Static Methods", () => {
    it("should find or create wishlist", async () => {
      // First call - creates new wishlist
      const wishlist1 = await Wishlist.findOrCreateWishlist(testUser._id);
      expect(wishlist1.userId.toString()).toBe(testUser._id.toString());
      expect(wishlist1.items).toHaveLength(0);

      // Second call - returns existing wishlist
      const wishlist2 = await Wishlist.findOrCreateWishlist(testUser._id);
      expect(wishlist2._id.toString()).toBe(wishlist1._id.toString());
    });

    it("should get wishlist with populated item details", async () => {
      const wishlist = await Wishlist.create({ userId: testUser._id });
      wishlist.addItem(testListings[0]._id, testListings[0].price);
      wishlist.addItem(testListings[1]._id, testListings[1].price);
      await wishlist.save();

      const populatedWishlist = await Wishlist.getWishlistItemDetails(
        testUser._id
      );

      expect(populatedWishlist.items).toHaveLength(2);
      expect(populatedWishlist.items[0].listing.name).toBe("Gaming Mouse");
      expect(populatedWishlist.items[1].listing.name).toBe(
        "Mechanical Keyboard"
      );
      expect(populatedWishlist.items[0].priceWhenAdded).toBe(150);
    });
  });

  describe("Virtual Properties", () => {
    it("should calculate totalItems", async () => {
      const wishlist = await Wishlist.create({ userId: testUser._id });
      wishlist.addItem(testListings[0]._id, testListings[0].price);
      wishlist.addItem(testListings[1]._id, testListings[1].price);
      await wishlist.save();

      const reloaded = await Wishlist.findById(wishlist._id);
      expect(reloaded.totalItems).toBe(2);
    });
  });

  describe("Indexes", () => {
    it("should have userId unique index", async () => {
      const indexes = await Wishlist.collection.getIndexes();
      expect(indexes).toHaveProperty("userId_1");
    });

    it("should have items.addedAt descending index", async () => {
      const indexes = await Wishlist.collection.getIndexes();
      const hasAddedAtIndex = Object.keys(indexes).some((key) =>
        key.includes("items.addedAt")
      );
      expect(hasAddedAtIndex).toBe(true);
    });
  });
});
