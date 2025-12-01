const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Cart } = require("../../../models/cart/cart.model");
const { User } = require("../../../models");
const { Listing } = require("../../../models");

/**
 * CART MODEL INTEGRATION TESTS
 * Tests cart functionality with real database operations
 *
 * KEY LEARNINGS:
 * - Cart.MAX_ITEMS = 50 (not 20)
 * - Static methods use userId (not cart._id)
 * - addOrUpdateItem() throws error when limit reached
 * - Methods return 'this' for chaining, need save()
 */
describe("Cart Model Integration Tests", () => {
  let mongoServer;
  let testUser;
  let testListings;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await Cart.deleteMany({});
    await User.deleteMany({});
    await Listing.deleteMany({});

    // Create test user
    testUser = await User.create({
      email: "cartuser@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "cartuser99",
        phoneNumber: "01234567890",
        campus: "SHAH_ALAM",
        faculty: "COMPUTER_SCIENCE_MATH",
      },
    });

    // Create merchant for listings
    const merchant = await User.create({
      email: "merchant@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "merchantcart",
        phoneNumber: "01234567891",
        campus: "SHAH_ALAM",
        faculty: "BUSINESS_MANAGEMENT",
      },
      roles: ["merchant"],
    });

    // Create test listings
    testListings = await Listing.create([
      {
        name: "Laptop",
        price: 3000,
        category: "electronics",
        type: "product",
        stock: 10,
        images: ["https://example.com/laptop.jpg"],
        seller: {
          userId: merchant._id,
          username: merchant.profile.username,
        },
      },
      {
        name: "Textbook",
        price: 50,
        category: "books",
        type: "product",
        stock: 20,
        images: ["https://example.com/book.jpg"],
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

  describe("Cart Creation", () => {
    it("should create cart with userId", async () => {
      const cart = await Cart.create({
        userId: testUser._id,
      });

      expect(cart.userId.toString()).toBe(testUser._id.toString());
      expect(cart.items).toEqual([]);
      expect(cart.lastActivity).toBeDefined();
    });

    it("should require userId", async () => {
      await expect(Cart.create({})).rejects.toThrow();
    });
  });

  describe("Cart Item Management - Instance Methods", () => {
    let cart;

    beforeEach(async () => {
      cart = await Cart.create({ userId: testUser._id });
    });

    it("should add item to cart using addOrUpdateItem()", async () => {
      cart.addOrUpdateItem(testListings[0]._id, 2);
      await cart.save();

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].listing.toString()).toBe(
        testListings[0]._id.toString()
      );
      expect(cart.items[0].quantity).toBe(2);
    });

    it("should update existing item quantity (sum quantities)", async () => {
      cart.addOrUpdateItem(testListings[0]._id, 2);
      await cart.save();

      cart.addOrUpdateItem(testListings[0]._id, 3); // Should become 5
      await cart.save();

      const reloaded = await Cart.findById(cart._id);
      expect(reloaded.items).toHaveLength(1);
      expect(reloaded.items[0].quantity).toBe(5); // 2 + 3
    });

    it("should update item quantity using updateItemQuantity()", async () => {
      cart.addOrUpdateItem(testListings[0]._id, 2);
      await cart.save();

      cart.updateItemQuantity(testListings[0]._id, 5);
      await cart.save();

      const reloaded = await Cart.findById(cart._id);
      expect(reloaded.items[0].quantity).toBe(5);
    });

    it("should remove item from cart", async () => {
      cart.addOrUpdateItem(testListings[0]._id, 2);
      cart.addOrUpdateItem(testListings[1]._id, 1);
      await cart.save();

      cart.removeItem(testListings[0]._id);
      await cart.save();

      const reloaded = await Cart.findById(cart._id);
      expect(reloaded.items).toHaveLength(1);
      expect(reloaded.items[0].listing.toString()).toBe(
        testListings[1]._id.toString()
      );
    });

    it("should throw error when removing non-existent item", async () => {
      const randomId = new mongoose.Types.ObjectId();
      expect(() => cart.removeItem(randomId)).toThrow("not found");
    });

    it("should clear all cart items", async () => {
      cart.addOrUpdateItem(testListings[0]._id, 2);
      cart.addOrUpdateItem(testListings[1]._id, 1);
      await cart.save();

      cart.clearCart();
      await cart.save();

      const reloaded = await Cart.findById(cart._id);
      expect(reloaded.items).toHaveLength(0);
    });

    it("should enforce cart limit (50 items)", async () => {
      // Create 50 listings
      const manyListings = [];
      const merchant = await User.findOne({ roles: "merchant" });

      for (let i = 0; i < 50; i++) {
        const listing = await Listing.create({
          name: `Item ${i}`,
          price: 10,
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

      // Add 50 items - should succeed
      for (let i = 0; i < 50; i++) {
        cart.addOrUpdateItem(manyListings[i]._id, 1);
      }
      await cart.save();

      const reloaded = await Cart.findById(cart._id);
      expect(reloaded.items).toHaveLength(50);

      // Try to add 51st item - should throw error
      const extraListing = await Listing.create({
        name: "Extra Item",
        price: 10,
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
        reloaded.addOrUpdateItem(extraListing._id, 1);
      }).toThrow("limit");
    });

    it("should update lastActivity on modifications", async () => {
      const originalActivity = cart.lastActivity;

      // Wait 10ms to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      cart.addOrUpdateItem(testListings[0]._id, 1);
      await cart.save();

      expect(cart.lastActivity.getTime()).toBeGreaterThan(
        originalActivity.getTime()
      );
    });
  });

  describe("Static Methods", () => {
    it("should find or create cart", async () => {
      // First call - creates new cart
      const cart1 = await Cart.findOrCreateCart(testUser._id);
      expect(cart1.userId.toString()).toBe(testUser._id.toString());
      expect(cart1.items).toHaveLength(0);

      // Second call - returns existing cart
      const cart2 = await Cart.findOrCreateCart(testUser._id);
      expect(cart2._id.toString()).toBe(cart1._id.toString());
    });

    it("should get cart with populated listing details", async () => {
      const cart = await Cart.create({ userId: testUser._id });
      cart.addOrUpdateItem(testListings[0]._id, 2);
      cart.addOrUpdateItem(testListings[1]._id, 1);
      await cart.save();

      const populatedCart = await Cart.getCartWithDetails(testUser._id);

      expect(populatedCart.items).toHaveLength(2);
      expect(populatedCart.items[0].listing.name).toBe("Laptop");
      expect(populatedCart.items[1].listing.name).toBe("Textbook");
      expect(populatedCart.items[0].listing.price).toBe(3000);
    });
  });

  describe("Virtual Properties", () => {
    it("should calculate totalItems (number of unique items)", async () => {
      const cart = await Cart.create({ userId: testUser._id });
      cart.addOrUpdateItem(testListings[0]._id, 2);
      cart.addOrUpdateItem(testListings[1]._id, 3);
      await cart.save();

      const reloaded = await Cart.findById(cart._id);
      expect(reloaded.totalItems).toBe(2); // 2 unique items
    });

    it("should calculate totalItemsQuantity (sum of all quantities)", async () => {
      const cart = await Cart.create({ userId: testUser._id });
      cart.addOrUpdateItem(testListings[0]._id, 2);
      cart.addOrUpdateItem(testListings[1]._id, 3);
      await cart.save();

      const reloaded = await Cart.findById(cart._id);
      expect(reloaded.totalItemsQuantity).toBe(5); // 2 + 3
    });
  });

  describe("Indexes", () => {
    it("should have userId index", async () => {
      const indexes = await Cart.collection.getIndexes();
      expect(indexes).toHaveProperty("userId_1");
    });

    it("should have lastActivity descending index", async () => {
      const indexes = await Cart.collection.getIndexes();
      expect(indexes).toHaveProperty("lastActivity_-1");
    });
  });
});
