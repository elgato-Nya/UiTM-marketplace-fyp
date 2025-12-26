/**
 * Checkout Helpers Integration Tests
 *
 * PURPOSE: Test checkout service layer with merchant delivery fees
 * APPROACH: Integration tests with real database
 * FOCUS: groupItemsBySeller with async delivery fee calculation
 */

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../../../models/user/user.model");
const Listing = require("../../../models/listing/listing.model");
const {
  validateCheckoutItems,
  groupItemsBySeller,
  calculateCheckoutSummary,
} = require("../../../services/checkout/checkout.helpers");
const { DeliveryMethod } = require("../../../utils/enums/order.enum");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Listing.deleteMany({});
});

describe("Checkout Helpers - Delivery Fee Integration", () => {
  let merchant1, merchant2, listing1, listing2, listing3;

  beforeEach(async () => {
    // Merchant 1: Custom delivery fees
    merchant1 = await User.create({
      email: "merchant1@student.uitm.edu.my",
      password: "Password123!",
      role: "merchant",
      profile: {
        username: "merchant_one",
        firstName: "Merchant",
        lastName: "One",
        phoneNumber: "0123456789",
      },
      merchantDetails: {
        shopName: "Custom Fee Shop",
        shopSlug: "custom-fee-shop",
        deliveryFees: {
          personal: { enabled: true, fee: 8.0, freeThreshold: 100 },
          campus: { enabled: true, fee: 3.0, freeThreshold: 50 },
          pickup: { enabled: true, fee: 0 },
          freeDeliveryForAll: false,
        },
      },
    });

    // Merchant 2: Platform defaults (no custom fees)
    merchant2 = await User.create({
      email: "merchant2@student.uitm.edu.my",
      password: "Password123!",
      role: "merchant",
      profile: {
        username: "merchant_two",
        firstName: "Merchant",
        lastName: "Two",
        phoneNumber: "0123456780",
      },
      merchantDetails: {
        shopName: "Default Fee Shop",
        shopSlug: "default-fee-shop",
      },
    });

    // Listings
    listing1 = await Listing.create({
      name: "Product from Merchant 1",
      description: "Test product",
      price: 60.0,
      type: "product",
      category: "electronics",
      stock: 100,
      seller: {
        userId: merchant1._id,
        username: "merchant_one",
      },
      images: ["https://example.com/image1.jpg"],
    });

    listing2 = await Listing.create({
      name: "Another Product from Merchant 1",
      description: "Test product 2",
      price: 40.0,
      type: "product",
      category: "books",
      stock: 50,
      seller: {
        userId: merchant1._id,
        username: "merchant_one",
      },
      images: ["https://example.com/image2.jpg"],
    });

    listing3 = await Listing.create({
      name: "Product from Merchant 2",
      description: "Test product 3",
      price: 80.0,
      type: "product",
      category: "clothing",
      stock: 75,
      seller: {
        userId: merchant2._id,
        username: "merchant_two",
      },
      images: ["https://example.com/image3.jpg"],
    });
  });

  describe("groupItemsBySeller - Custom Delivery Fees", () => {
    it("should apply custom personal delivery fee (below threshold)", async () => {
      const items = [
        {
          listingId: listing1._id,
          name: listing1.name,
          price: listing1.price,
          quantity: 1,
          type: listing1.type,
          stock: listing1.stock,
          images: listing1.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 60.0,
          listing: listing1,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].deliveryFee).toBe(8.0); // Custom fee
      expect(groups[0].subtotal).toBe(60.0);
    });

    it("should apply free delivery when threshold met", async () => {
      const items = [
        {
          listingId: listing1._id,
          name: listing1.name,
          price: listing1.price,
          quantity: 1,
          type: listing1.type,
          stock: listing1.stock,
          images: listing1.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 60.0,
          listing: listing1,
        },
        {
          listingId: listing2._id,
          name: listing2.name,
          price: listing2.price,
          quantity: 1,
          type: listing2.type,
          stock: listing2.stock,
          images: listing2.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 40.0,
          listing: listing2,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].subtotal).toBe(100.0);
      expect(groups[0].deliveryFee).toBe(0); // Free (threshold = 100)
    });

    it("should apply custom campus delivery fee (below threshold)", async () => {
      const items = [
        {
          listingId: listing2._id, // Use listing2 (RM40) instead
          name: listing2.name,
          price: listing2.price,
          quantity: 1,
          type: listing2.type,
          stock: listing2.stock,
          images: listing2.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 40.0, // Below 50 threshold
          listing: listing2,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.CAMPUS_DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].deliveryFee).toBe(3.0); // Custom campus fee
    });

    it("should apply free campus delivery when threshold met", async () => {
      const items = [
        {
          listingId: listing1._id,
          name: listing1.name,
          price: listing1.price,
          quantity: 1,
          type: listing1.type,
          stock: listing1.stock,
          images: listing1.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 60.0,
          listing: listing1,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.CAMPUS_DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].subtotal).toBe(60.0);
      expect(groups[0].deliveryFee).toBe(0); // Free (threshold = 50)
    });

    it("should apply zero fee for pickup", async () => {
      const items = [
        {
          listingId: listing1._id,
          name: listing1.name,
          price: listing1.price,
          quantity: 1,
          type: listing1.type,
          stock: listing1.stock,
          images: listing1.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 60.0,
          listing: listing1,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.SELF_PICKUP,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].deliveryFee).toBe(0); // Custom pickup = 0
    });
  });

  describe("groupItemsBySeller - Platform Default Fees", () => {
    it("should apply platform default personal delivery fee (RM 5.00)", async () => {
      const items = [
        {
          listingId: listing3._id,
          name: listing3.name,
          price: listing3.price,
          quantity: 1,
          type: listing3.type,
          stock: listing3.stock,
          images: listing3.images,
          sellerId: merchant2._id,
          sellerName: "merchant_two",
          itemTotal: 80.0,
          listing: listing3,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].deliveryFee).toBe(5.0); // Platform default
    });

    it("should apply platform default campus delivery fee (RM 2.50)", async () => {
      const items = [
        {
          listingId: listing3._id,
          name: listing3.name,
          price: listing3.price,
          quantity: 1,
          type: listing3.type,
          stock: listing3.stock,
          images: listing3.images,
          sellerId: merchant2._id,
          sellerName: "merchant_two",
          itemTotal: 80.0,
          listing: listing3,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.CAMPUS_DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].deliveryFee).toBe(2.5); // Platform default
    });

    it("should apply platform default pickup fee (RM 1.00)", async () => {
      const items = [
        {
          listingId: listing3._id,
          name: listing3.name,
          price: listing3.price,
          quantity: 1,
          type: listing3.type,
          stock: listing3.stock,
          images: listing3.images,
          sellerId: merchant2._id,
          sellerName: "merchant_two",
          itemTotal: 80.0,
          listing: listing3,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.SELF_PICKUP,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].deliveryFee).toBe(1.0); // Platform default
    });
  });

  describe("groupItemsBySeller - Legacy Method Support", () => {
    it("should support legacy 'delivery' method name", async () => {
      const items = [
        {
          listingId: listing1._id,
          name: listing1.name,
          price: listing1.price,
          quantity: 1,
          type: listing1.type,
          stock: listing1.stock,
          images: listing1.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 60.0,
          listing: listing1,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].deliveryFee).toBe(8.0); // Custom personal fee
    });

    it("should support legacy 'campus_delivery' method name", async () => {
      const items = [
        {
          listingId: listing2._id, // Use listing2 (RM40) instead
          name: listing2.name,
          price: listing2.price,
          quantity: 1,
          type: listing2.type,
          stock: listing2.stock,
          images: listing2.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 40.0, // Below 50 threshold
          listing: listing2,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.CAMPUS_DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].deliveryFee).toBe(3.0); // Custom campus fee
    });

    it("should support legacy 'self_pickup' method name", async () => {
      const items = [
        {
          listingId: listing1._id,
          name: listing1.name,
          price: listing1.price,
          quantity: 1,
          type: listing1.type,
          stock: listing1.stock,
          images: listing1.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 60.0,
          listing: listing1,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.SELF_PICKUP,
        "online"
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].deliveryFee).toBe(0); // Custom pickup = 0
    });
  });

  describe("groupItemsBySeller - Multiple Merchants", () => {
    it("should calculate separate delivery fees per merchant", async () => {
      const items = [
        {
          listingId: listing1._id,
          name: listing1.name,
          price: listing1.price,
          quantity: 1,
          type: listing1.type,
          stock: listing1.stock,
          images: listing1.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 60.0,
          listing: listing1,
        },
        {
          listingId: listing3._id,
          name: listing3.name,
          price: listing3.price,
          quantity: 1,
          type: listing3.type,
          stock: listing3.stock,
          images: listing3.images,
          sellerId: merchant2._id,
          sellerName: "merchant_two",
          itemTotal: 80.0,
          listing: listing3,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(2);

      // Merchant 1 group
      const merchant1Group = groups.find(
        (g) => g.sellerId.toString() === merchant1._id.toString()
      );
      expect(merchant1Group.deliveryFee).toBe(8.0); // Custom fee
      expect(merchant1Group.subtotal).toBe(60.0);

      // Merchant 2 group
      const merchant2Group = groups.find(
        (g) => g.sellerId.toString() === merchant2._id.toString()
      );
      expect(merchant2Group.deliveryFee).toBe(5.0); // Platform default
      expect(merchant2Group.subtotal).toBe(80.0);
    });

    it("should apply free delivery threshold per merchant independently", async () => {
      const items = [
        {
          listingId: listing1._id,
          name: listing1.name,
          price: listing1.price,
          quantity: 2, // 120 total (> 100 threshold)
          type: listing1.type,
          stock: listing1.stock,
          images: listing1.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 120.0,
          listing: listing1,
        },
        {
          listingId: listing3._id,
          name: listing3.name,
          price: listing3.price,
          quantity: 1, // 80 total (no threshold)
          type: listing3.type,
          stock: listing3.stock,
          images: listing3.images,
          sellerId: merchant2._id,
          sellerName: "merchant_two",
          itemTotal: 80.0,
          listing: listing3,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.DELIVERY,
        "online"
      );

      expect(groups).toHaveLength(2);

      // Merchant 1: Free delivery (threshold met)
      const merchant1Group = groups.find(
        (g) => g.sellerId.toString() === merchant1._id.toString()
      );
      expect(merchant1Group.subtotal).toBe(120.0);
      expect(merchant1Group.deliveryFee).toBe(0); // Free

      // Merchant 2: Platform fee (no threshold)
      const merchant2Group = groups.find(
        (g) => g.sellerId.toString() === merchant2._id.toString()
      );
      expect(merchant2Group.subtotal).toBe(80.0);
      expect(merchant2Group.deliveryFee).toBe(5.0); // Platform default
    });
  });

  describe("calculateCheckoutSummary - With Delivery Fees", () => {
    it("should sum delivery fees correctly across merchants", async () => {
      const items = [
        {
          listingId: listing1._id,
          name: listing1.name,
          price: listing1.price,
          quantity: 1,
          type: listing1.type,
          stock: listing1.stock,
          images: listing1.images,
          sellerId: merchant1._id,
          sellerName: "merchant_one",
          itemTotal: 60.0,
          listing: listing1,
        },
        {
          listingId: listing3._id,
          name: listing3.name,
          price: listing3.price,
          quantity: 1,
          type: listing3.type,
          stock: listing3.stock,
          images: listing3.images,
          sellerId: merchant2._id,
          sellerName: "merchant_two",
          itemTotal: 80.0,
          listing: listing3,
        },
      ];

      const groups = await groupItemsBySeller(
        items,
        DeliveryMethod.DELIVERY,
        "online"
      );
      const summary = calculateCheckoutSummary(groups);

      expect(summary.subtotal).toBe(140.0);
      expect(summary.totalDeliveryFee).toBe(13.0); // 8.0 + 5.0
      expect(summary.totalAmount).toBeGreaterThan(140.0);
    });
  });
});
