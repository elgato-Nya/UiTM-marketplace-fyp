const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Listing, User } = require("../../../models");

/**
 * LISTING MODEL INTEGRATION TESTS
 * Tests product and service listings with database operations
 */
describe("Listing Model Integration Tests", () => {
  let mongoServer;
  let merchantUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await Listing.deleteMany({});
    await User.deleteMany({});

    // Create merchant user
    merchantUser = await User.create({
      email: "merchant@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "merchanttest",
        phoneNumber: "01234567890",
        campus: "SHAH_ALAM",
        faculty: "COMPUTER_SCIENCE_MATH",
      },
      roles: ["merchant"],
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("Product Listing Creation", () => {
    it("should create product listing with required fields", async () => {
      const listing = await Listing.create({
        name: "Gaming Laptop",
        description: "High performance laptop",
        price: 3500,
        category: "electronics",
        type: "product",
        images: ["https://example.com/laptop.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        stock: 5,
      });

      expect(listing.name).toBe("Gaming Laptop");
      expect(listing.type).toBe("product");
      expect(listing.stock).toBe(5);
      expect(listing.isAvailable).toBe(true);
    });

    it("should default stock to 0 for product listings", async () => {
      const listing = await Listing.create({
        name: "Phone",
        price: 1500,
        category: "electronics",
        type: "product",
        images: ["https://example.com/phone.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        // Stock defaults to 0 for products
      });

      expect(listing.stock).toBe(0);
    });

    it("should default isAvailable to true", async () => {
      const listing = await Listing.create({
        name: "Textbook",
        price: 50,
        category: "books",
        type: "product",
        images: ["https://example.com/book.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        stock: 10,
      });

      expect(listing.isAvailable).toBe(true);
    });

    it("should support isFree products", async () => {
      const listing = await Listing.create({
        name: "Free Notes",
        price: 0,
        category: "books",
        type: "product",
        images: ["https://example.com/notes.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        stock: 100,
        isFree: true,
      });

      expect(listing.isFree).toBe(true);
      expect(listing.price).toBe(0);
    });
  });

  describe("Service Listing Creation", () => {
    it("should create service listing without stock", async () => {
      const listing = await Listing.create({
        name: "Printing Service",
        description: "High quality color printing",
        price: 5,
        category: "printing",
        type: "service",
        images: ["https://example.com/printing.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
      });

      expect(listing.type).toBe("service");
      expect(listing.stock).toBeUndefined();
    });

    it("should accept valid service categories", async () => {
      const categories = ["printing", "repair", "e-hailing", "delivery"];

      for (const category of categories) {
        const listing = await Listing.create({
          name: `${category} Service`,
          price: 10,
          category,
          type: "service",
          images: ["https://example.com/service.jpg"],
          seller: {
            userId: merchantUser._id,
            username: merchantUser.profile.username,
          },
        });

        expect(listing.category).toBe(category);
      }
    });
  });

  describe("Listing Validation", () => {
    it("should require name, price, category, type, images, and seller", async () => {
      await expect(
        Listing.create({
          // Missing required fields
          name: "Test",
        })
      ).rejects.toThrow();
    });

    it("should validate price is non-negative", async () => {
      await expect(
        Listing.create({
          name: "Invalid Price Item",
          price: -10,
          category: "electronics",
          type: "product",
          images: ["https://example.com/item.jpg"],
          seller: {
            userId: merchantUser._id,
            username: merchantUser.profile.username,
          },
          stock: 1,
        })
      ).rejects.toThrow();
    });

    it("should allow empty images array", async () => {
      const listing = await Listing.create({
        name: "No Image Product",
        price: 100,
        category: "electronics",
        type: "product",
        images: [], // Empty array is allowed
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        stock: 1,
      });

      expect(listing.images).toEqual([]);
    });

    it("should validate category enum", async () => {
      await expect(
        Listing.create({
          name: "Invalid Category",
          price: 100,
          category: "invalid-category",
          type: "product",
          images: ["https://example.com/item.jpg"],
          seller: {
            userId: merchantUser._id,
            username: merchantUser.profile.username,
          },
          stock: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("Seller Information", () => {
    it("should store seller userId and username", async () => {
      const listing = await Listing.create({
        name: "Test Product",
        price: 100,
        category: "electronics",
        type: "product",
        images: ["https://example.com/product.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
          shopName: "Tech Shop",
          isVerifiedMerchant: true,
        },
        stock: 5,
      });

      expect(listing.seller.userId.toString()).toBe(
        merchantUser._id.toString()
      );
      expect(listing.seller.username).toBe("merchanttest");
      expect(listing.seller.shopName).toBe("Tech Shop");
      expect(listing.seller.isVerifiedMerchant).toBe(true);
    });

    it("should require seller userId", async () => {
      await expect(
        Listing.create({
          name: "No Seller",
          price: 100,
          category: "electronics",
          type: "product",
          images: ["https://example.com/item.jpg"],
          seller: {
            // Missing userId
            username: "someone",
          },
          stock: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("Timestamps", () => {
    it("should auto-generate createdAt and updatedAt", async () => {
      const listing = await Listing.create({
        name: "Timestamp Test",
        price: 50,
        category: "books",
        type: "product",
        images: ["https://example.com/book.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        stock: 3,
      });

      expect(listing.createdAt).toBeDefined();
      expect(listing.updatedAt).toBeDefined();
      expect(listing.createdAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt on modification", async () => {
      const listing = await Listing.create({
        name: "Update Test",
        price: 100,
        category: "electronics",
        type: "product",
        images: ["https://example.com/item.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        stock: 5,
      });

      const originalUpdated = listing.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      listing.price = 120;
      await listing.save();

      expect(listing.updatedAt.getTime()).toBeGreaterThan(
        originalUpdated.getTime()
      );
    });
  });

  describe("Indexes", () => {
    it("should have type index", async () => {
      const indexes = await Listing.collection.getIndexes();
      expect(indexes).toHaveProperty("type_1");
    });

    it("should have name index", async () => {
      const indexes = await Listing.collection.getIndexes();
      expect(indexes).toHaveProperty("name_1");
    });

    it("should have category index", async () => {
      const indexes = await Listing.collection.getIndexes();
      expect(indexes).toHaveProperty("category_1");
    });

    it("should have seller.userId index", async () => {
      const indexes = await Listing.collection.getIndexes();
      const hasSellerIndex = Object.keys(indexes).some((key) =>
        key.includes("seller.userId")
      );
      expect(hasSellerIndex).toBe(true);
    });
  });
});
