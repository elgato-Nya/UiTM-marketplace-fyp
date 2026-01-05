const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Listing, User } = require("../../../models");
const { Cart } = require("../../../models/cart/cart.model");
const { ListingCategory } = require("../../../utils/enums/listing.enum");

/**
 * VARIANT MODEL INTEGRATION TESTS
 * Tests variant functionality within listing model with database operations
 *
 * KEY TESTS:
 * - Variant CRUD operations on listings
 * - Variant stock management
 * - Cart integration with variants
 * - Backward compatibility (listings without variants)
 * - Quote settings for services
 */
describe("Variant Model Integration Tests", () => {
  let mongoServer;
  let merchantUser;
  let buyerUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await Listing.deleteMany({});
    await User.deleteMany({});
    await Cart.deleteMany({});

    // Create merchant user
    merchantUser = await User.create({
      email: "merchant@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "merchantvariant",
        phoneNumber: "01234567890",
        campus: "SHAH_ALAM",
        faculty: "COMPUTER_SCIENCE_MATH",
      },
      roles: ["merchant"],
    });

    // Create buyer user
    buyerUser = await User.create({
      email: "buyer@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "buyervariant",
        phoneNumber: "01234567891",
        campus: "SHAH_ALAM",
        faculty: "BUSINESS_MANAGEMENT",
      },
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("Listing with Variants Creation", () => {
    it("should create listing with variants array", async () => {
      const listing = await Listing.create({
        name: "T-Shirt",
        description: "Cotton t-shirt with multiple sizes",
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/tshirt.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [
          { name: "Small", price: 35, stock: 10 },
          { name: "Medium", price: 35, stock: 15 },
          { name: "Large", price: 40, stock: 8 },
        ],
      });

      expect(listing.variants).toHaveLength(3);
      expect(listing.toObject().hasVariants).toBe(true);
      expect(listing.variants[0].name).toBe("Small");
      expect(listing.variants[0].price).toBe(35);
      expect(listing.variants[0].stock).toBe(10);
      expect(listing.variants[0].isAvailable).toBe(true);
    });

    it("should generate unique _id for each variant", async () => {
      const listing = await Listing.create({
        name: "Phone Case",
        category: ListingCategory.ELECTRONICS,
        type: "product",
        images: ["https://example.com/case.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [
          { name: "Black", price: 25, stock: 20 },
          { name: "White", price: 25, stock: 15 },
        ],
      });

      expect(listing.variants[0]._id).toBeDefined();
      expect(listing.variants[1]._id).toBeDefined();
      expect(listing.variants[0]._id.toString()).not.toBe(
        listing.variants[1]._id.toString()
      );
    });

    it("should support SKU for variants", async () => {
      const listing = await Listing.create({
        name: "Sneakers",
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/sneakers.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [
          { name: "Size 40", sku: "SNK-40-BLK", price: 250, stock: 5 },
          { name: "Size 41", sku: "SNK-41-BLK", price: 250, stock: 3 },
        ],
      });

      expect(listing.variants[0].sku).toBe("SNK-40-BLK");
      expect(listing.variants[1].sku).toBe("SNK-41-BLK");
    });

    it("should support variant attributes", async () => {
      const listing = await Listing.create({
        name: "Backpack",
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/backpack.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [
          {
            name: "Small Blue",
            price: 80,
            stock: 10,
            attributes: { size: "S", color: "Blue" },
          },
          {
            name: "Large Red",
            price: 100,
            stock: 5,
            attributes: { size: "L", color: "Red" },
          },
        ],
      });

      expect(listing.variants[0].attributes).toEqual({
        size: "S",
        color: "Blue",
      });
      expect(listing.variants[1].attributes).toEqual({
        size: "L",
        color: "Red",
      });
    });
  });

  describe("Backward Compatibility - Listings Without Variants", () => {
    it("should create listing without variants (traditional flow)", async () => {
      const listing = await Listing.create({
        name: "Single Item",
        price: 100,
        category: ListingCategory.ELECTRONICS,
        type: "product",
        stock: 50,
        images: ["https://example.com/item.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
      });

      // Access virtual directly (not via toObject which may not include virtuals)
      expect(listing.hasVariants).toBe(false);
      // When variants not specified, it's undefined (not an empty array)
      // The hasVariants virtual handles this gracefully
      expect(listing.variants).toBeUndefined();
      expect(listing.price).toBe(100);
      expect(listing.stock).toBe(50);
    });

    it("should work with empty variants array", async () => {
      const listing = await Listing.create({
        name: "Basic Product",
        price: 75,
        category: ListingCategory.BOOKS,
        type: "product",
        stock: 30,
        images: ["https://example.com/product.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [],
      });

      expect(listing.toObject().hasVariants).toBe(false);
      expect(listing.price).toBe(75);
    });
  });

  describe("Variant Virtuals", () => {
    it("should calculate hasVariants virtual correctly", async () => {
      const withVariants = await Listing.create({
        name: "With Variants",
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/v1.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [{ name: "Option A", price: 50, stock: 10 }],
      });

      const withoutVariants = await Listing.create({
        name: "Without Variants",
        price: 50,
        stock: 10,
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/v2.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
      });

      // Access virtuals directly on mongoose documents
      expect(withVariants.hasVariants).toBe(true);
      expect(withoutVariants.hasVariants).toBe(false);
    });

    it("should calculate variant inStock virtual correctly", async () => {
      const listing = await Listing.create({
        name: "Stock Test",
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/stock.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [
          { name: "In Stock", price: 50, stock: 10 },
          { name: "Out of Stock", price: 50, stock: 0 },
        ],
      });

      expect(listing.variants[0].toObject().inStock).toBe(true);
      expect(listing.variants[1].toObject().inStock).toBe(false);
    });
  });

  describe("Variant Instance Methods", () => {
    let listing;

    beforeEach(async () => {
      listing = await Listing.create({
        name: "Method Test Product",
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/method.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [
          { name: "Variant A", price: 100, stock: 20 },
          { name: "Variant B", price: 150, stock: 10 },
          { name: "Variant C", price: 75, stock: 0, isAvailable: false },
        ],
      });
    });

    it("should get min price from available variants only", () => {
      // Only considers available variants, so 75 (Variant C) is excluded
      expect(listing.getMinPrice()).toBe(100);
    });

    it("should get max price from variants", () => {
      expect(listing.getMaxPrice()).toBe(150);
    });

    it("should get total stock from variants", () => {
      expect(listing.getTotalStock()).toBe(30); // 20 + 10 + 0
    });

    it("should get variant by ID", () => {
      const variantId = listing.variants[1]._id;
      const variant = listing.getVariant(variantId);

      expect(variant).toBeDefined();
      expect(variant.name).toBe("Variant B");
      expect(variant.price).toBe(150);
    });

    it("should return null for non-existent variant ID", () => {
      const fakeId = new mongoose.Types.ObjectId();
      const variant = listing.getVariant(fakeId);

      expect(variant).toBeNull();
    });

    it("should get available variants only", () => {
      const available = listing.getAvailableVariants();

      expect(available).toHaveLength(2);
      expect(available.map((v) => v.name)).toContain("Variant A");
      expect(available.map((v) => v.name)).toContain("Variant B");
      expect(available.map((v) => v.name)).not.toContain("Variant C");
    });

    it("should check if variant is in stock", () => {
      expect(listing.isVariantInStock(listing.variants[0]._id)).toBe(true);
      expect(listing.isVariantInStock(listing.variants[2]._id)).toBe(false);
    });

    it("should deduct variant stock", async () => {
      const variantId = listing.variants[0]._id;
      const initialStock = listing.variants[0].stock;

      await listing.deductVariantStock(variantId, 5);

      const updated = await Listing.findById(listing._id);
      const variant = updated.getVariant(variantId);

      expect(variant.stock).toBe(initialStock - 5);
    });

    it("should restore variant stock", async () => {
      const variantId = listing.variants[0]._id;
      const initialStock = listing.variants[0].stock;

      await listing.restoreVariantStock(variantId, 3);

      const updated = await Listing.findById(listing._id);
      const variant = updated.getVariant(variantId);

      expect(variant.stock).toBe(initialStock + 3);
    });

    it("should throw error when deducting more than available stock", async () => {
      const variantId = listing.variants[0]._id;

      await expect(
        listing.deductVariantStock(variantId, 100)
      ).rejects.toThrow();
    });
  });

  describe("Cart with Variants", () => {
    let listingWithVariants;
    let cart;

    beforeEach(async () => {
      listingWithVariants = await Listing.create({
        name: "Variant Product for Cart",
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/cart-variant.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [
          { name: "Small", price: 50, stock: 10 },
          { name: "Medium", price: 55, stock: 15 },
        ],
      });

      cart = await Cart.create({ userId: buyerUser._id });
    });

    it("should add item with variantId to cart", async () => {
      const variantId = listingWithVariants.variants[0]._id;

      cart.addOrUpdateItem(listingWithVariants._id, 2, {
        variantId,
        snapshot: {
          name: "Small",
          price: 50,
          sku: null,
          attributes: null,
        },
      });
      await cart.save();

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].variantId.toString()).toBe(variantId.toString());
      expect(cart.items[0].variantSnapshot.name).toBe("Small");
      expect(cart.items[0].variantSnapshot.price).toBe(50);
    });

    it("should treat same listing with different variants as separate items", async () => {
      const variant1 = listingWithVariants.variants[0]._id;
      const variant2 = listingWithVariants.variants[1]._id;

      cart.addOrUpdateItem(listingWithVariants._id, 1, {
        variantId: variant1,
        snapshot: { name: "Small", price: 50 },
      });
      cart.addOrUpdateItem(listingWithVariants._id, 2, {
        variantId: variant2,
        snapshot: { name: "Medium", price: 55 },
      });
      await cart.save();

      expect(cart.items).toHaveLength(2);
      expect(cart.items[0].variantId.toString()).toBe(variant1.toString());
      expect(cart.items[1].variantId.toString()).toBe(variant2.toString());
    });

    it("should update quantity for same listing+variant combo", async () => {
      const variantId = listingWithVariants.variants[0]._id;

      cart.addOrUpdateItem(listingWithVariants._id, 2, {
        variantId,
        snapshot: { name: "Small", price: 50 },
      });
      await cart.save();

      cart.addOrUpdateItem(listingWithVariants._id, 3, {
        variantId,
        snapshot: { name: "Small", price: 50 },
      });
      await cart.save();

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5); // 2 + 3
    });

    it("should find item by listing and variant ID", async () => {
      const variantId = listingWithVariants.variants[0]._id;

      cart.addOrUpdateItem(listingWithVariants._id, 2, {
        variantId,
        snapshot: { name: "Small", price: 50 },
      });
      await cart.save();

      const found = cart.findItem(listingWithVariants._id, variantId);

      expect(found).toBeDefined();
      expect(found.quantity).toBe(2);
    });

    it("should not find item when variantId doesn't match", async () => {
      const variant1 = listingWithVariants.variants[0]._id;
      const variant2 = listingWithVariants.variants[1]._id;

      cart.addOrUpdateItem(listingWithVariants._id, 2, {
        variantId: variant1,
        snapshot: { name: "Small", price: 50 },
      });
      await cart.save();

      const found = cart.findItem(listingWithVariants._id, variant2);

      expect(found).toBeUndefined();
    });

    it("should update quantity for specific variant", async () => {
      const variant1 = listingWithVariants.variants[0]._id;
      const variant2 = listingWithVariants.variants[1]._id;

      cart.addOrUpdateItem(listingWithVariants._id, 1, {
        variantId: variant1,
        snapshot: { name: "Small", price: 50 },
      });
      cart.addOrUpdateItem(listingWithVariants._id, 2, {
        variantId: variant2,
        snapshot: { name: "Medium", price: 55 },
      });
      await cart.save();

      cart.updateItemQuantity(listingWithVariants._id, 5, variant1);
      await cart.save();

      const item1 = cart.findItem(listingWithVariants._id, variant1);
      const item2 = cart.findItem(listingWithVariants._id, variant2);

      expect(item1.quantity).toBe(5);
      expect(item2.quantity).toBe(2); // Unchanged
    });
  });

  describe("Quote Settings for Services", () => {
    it("should create service with quote settings", async () => {
      const listing = await Listing.create({
        name: "Design Service",
        description: "Custom design services",
        category: ListingCategory.OTHER_SERVICE,
        type: "service",
        images: ["https://example.com/design.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        quoteSettings: {
          enabled: true,
          autoAccept: false,
          minPrice: 50,
          maxPrice: 500,
          responseTime: 24,
          requiresDeposit: true,
          depositPercentage: 30,
          customFields: [
            {
              label: "Project Description",
              type: "textarea",
              required: true,
            },
            {
              label: "Deadline",
              type: "select",
              required: true,
              options: ["1 week", "2 weeks", "1 month"],
            },
          ],
        },
      });

      expect(listing.toObject().isQuoteBased).toBe(true);
      expect(listing.quoteSettings.enabled).toBe(true);
      expect(listing.quoteSettings.minPrice).toBe(50);
      expect(listing.quoteSettings.maxPrice).toBe(500);
      expect(listing.quoteSettings.customFields).toHaveLength(2);
    });

    it("should default isQuoteBased to false for products", async () => {
      const listing = await Listing.create({
        name: "Regular Product",
        price: 100,
        stock: 10,
        category: ListingCategory.ELECTRONICS,
        type: "product",
        images: ["https://example.com/regular.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
      });

      expect(listing.toObject().isQuoteBased).toBe(false);
    });

    it("should default isQuoteBased to false for services without quoteSettings", async () => {
      const listing = await Listing.create({
        name: "Fixed Price Service",
        price: 200,
        category: ListingCategory.PRINTING,
        type: "service",
        images: ["https://example.com/printing.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
      });

      expect(listing.toObject().isQuoteBased).toBe(false);
    });
  });

  describe("Listing inStock Virtual with Variants", () => {
    it("should be true when at least one variant is in stock", async () => {
      const listing = await Listing.create({
        name: "Partial Stock",
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/partial.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [
          { name: "A", price: 50, stock: 0 },
          { name: "B", price: 50, stock: 5 },
        ],
      });

      expect(listing.toObject().inStock).toBe(true);
    });

    it("should be false when all variants are out of stock", async () => {
      const listing = await Listing.create({
        name: "No Stock",
        category: ListingCategory.CLOTHING,
        type: "product",
        images: ["https://example.com/nostock.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
        variants: [
          { name: "A", price: 50, stock: 0 },
          { name: "B", price: 50, stock: 0 },
        ],
      });

      expect(listing.toObject().inStock).toBe(false);
    });

    it("should work for listings without variants (backward compat)", async () => {
      const inStock = await Listing.create({
        name: "In Stock Item",
        price: 100,
        stock: 10,
        category: ListingCategory.ELECTRONICS,
        type: "product",
        images: ["https://example.com/instock.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
      });

      const outOfStock = await Listing.create({
        name: "Out of Stock Item",
        price: 100,
        stock: 0,
        category: ListingCategory.ELECTRONICS,
        type: "product",
        images: ["https://example.com/outofstock.jpg"],
        seller: {
          userId: merchantUser._id,
          username: merchantUser.profile.username,
        },
      });

      expect(inStock.toObject().inStock).toBe(true);
      expect(outOfStock.toObject().inStock).toBe(false);
    });
  });

  describe("Database Indexes", () => {
    it("should have index on variants._id", async () => {
      const indexes = await Listing.collection.getIndexes();
      const indexKeys = Object.keys(indexes);

      // Check if any index contains variants._id
      const hasVariantIdIndex = indexKeys.some((key) =>
        key.includes("variants._id")
      );

      expect(hasVariantIdIndex).toBe(true);
    });

    it("should have compound index on variants.sku and seller.userId", async () => {
      const indexes = await Listing.collection.getIndexes();
      const indexKeys = Object.keys(indexes);

      // Check for compound SKU index
      const hasSkuIndex = indexKeys.some(
        (key) => key.includes("variants.sku") && key.includes("seller.userId")
      );

      expect(hasSkuIndex).toBe(true);
    });
  });
});
