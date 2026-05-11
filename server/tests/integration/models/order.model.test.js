const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Order, User, Listing } = require("../../../models");

/**
 * ORDER MODEL INTEGRATION TESTS
 * Tests order creation and management with real database operations
 */
describe("Order Model Integration Tests", () => {
  let mongoServer;
  let buyer;
  let merchant;
  let testListing;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});
    await Listing.deleteMany({});

    buyer = await User.create({
      email: "buyer@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "orderbuyer",
        phoneNumber: "01234567890",
        campus: "SHAH_ALAM",
        faculty: "COMPUTER_SCIENCE_MATH",
      },
    });

    merchant = await User.create({
      email: "seller@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "orderseller",
        phoneNumber: "01234567891",
        campus: "PUNCAK_ALAM",
        faculty: "BUSINESS_MANAGEMENT",
      },
      roles: ["merchant"],
    });

    testListing = await Listing.create({
      name: "Gaming Laptop",
      price: 3500,
      category: "electronics",
      type: "product",
      stock: 5,
      images: ["https://example.com/laptop.jpg"],
      seller: {
        userId: merchant._id,
        username: merchant.profile.username,
      },
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("Order Creation", () => {
    it("should create order and auto-generate orderNumber", async () => {
      const order = await Order.create({
        checkoutSessionId: new mongoose.Types.ObjectId(),
        buyer: {
          userId: buyer._id,
          username: buyer.profile.username,
          email: buyer.email,
          phone: buyer.profile.phoneNumber,
        },
        seller: {
          userId: merchant._id,
          name: merchant.profile.username,
          email: merchant.email,
          phone: merchant.profile.phoneNumber,
        },
        items: [
          {
            listingId: testListing._id,
            name: testListing.name,
            price: testListing.price,
            quantity: 2,
          },
        ],
        itemsTotal: 7000,
        shippingFee: 10,
        totalAmount: 7010,
        paymentMethod: "cod",
        deliveryMethod: "campus_delivery",
        deliveryAddress: {
          type: "campus",
          campus: "SHAH_ALAM",
          block: "A",
          roomNumber: "101",
          recipientName: buyer.profile.username,
          recipientPhone: buyer.profile.phoneNumber,
        },
      });

      expect(order.orderNumber).toMatch(/^ORD-\d{8}-[A-Z0-9]{6}$/);
      expect(order.status).toBe("pending");
      expect(order.paymentStatus).toBe("pending_payment");
    });

    it("should generate unique orderNumbers", async () => {
      const order1 = await Order.create({
        checkoutSessionId: new mongoose.Types.ObjectId(),
        buyer: {
          userId: buyer._id,
          username: buyer.profile.username,
          email: buyer.email,
          phone: buyer.profile.phoneNumber,
        },
        seller: {
          userId: merchant._id,
          name: merchant.profile.username,
          email: merchant.email,
          phone: merchant.profile.phoneNumber,
        },
        items: [
          {
            listingId: testListing._id,
            name: "Test Product",
            price: 100,
            quantity: 1,
          },
        ],
        itemsTotal: 100,
        shippingFee: 10,
        totalAmount: 110,
        paymentMethod: "cod",
        deliveryMethod: "campus_delivery",
        deliveryAddress: {
          type: "campus",
          campus: "SHAH_ALAM",
          block: "A",
          roomNumber: "101",
          recipientName: buyer.profile.username,
          recipientPhone: buyer.profile.phoneNumber,
        },
      });

      const order2 = await Order.create({
        checkoutSessionId: new mongoose.Types.ObjectId(),
        buyer: {
          userId: buyer._id,
          username: buyer.profile.username,
          email: buyer.email,
          phone: buyer.profile.phoneNumber,
        },
        seller: {
          userId: merchant._id,
          name: merchant.profile.username,
          email: merchant.email,
          phone: merchant.profile.phoneNumber,
        },
        items: [
          {
            listingId: testListing._id,
            name: "Test Product",
            price: 100,
            quantity: 1,
          },
        ],
        itemsTotal: 100,
        shippingFee: 10,
        totalAmount: 110,
        paymentMethod: "cod",
        deliveryMethod: "campus_delivery",
        deliveryAddress: {
          type: "campus",
          campus: "SHAH_ALAM",
          block: "A",
          roomNumber: "102",
          recipientName: buyer.profile.username,
          recipientPhone: buyer.profile.phoneNumber,
        },
      });

      expect(order1.orderNumber).not.toBe(order2.orderNumber);
    });

    it("should validate totalAmount calculation", async () => {
      await expect(
        Order.create({
          buyer: {
            userId: buyer._id,
            username: buyer.profile.username,
            email: buyer.email,
            phone: buyer.profile.phoneNumber,
          },
          seller: {
            userId: merchant._id,
            name: merchant.profile.username,
            email: merchant.email,
            phone: merchant.profile.phoneNumber,
          },
          items: [
            {
              listingId: testListing._id,
              name: "Test Product",
              price: 100,
              quantity: 1,
            },
          ],
          itemsTotal: 100,
          shippingFee: 10,
          totalAmount: 999, // Wrong calculation
          paymentMethod: "cod",
          deliveryMethod: "campus_delivery",
          deliveryAddress: {
            type: "campus",
            campus: "SHAH_ALAM",
            block: "A",
            roomNumber: "101",
            recipientName: buyer.profile.username,
            recipientPhone: buyer.profile.phoneNumber,
          },
        })
      ).rejects.toThrow();
    });

    it("should allow non-UiTM snapshot emails for buyer and seller", async () => {
      const externalBuyer = await User.create({
        email: "buyer@gmail.com",
        password: "SecurePass123!",
        profile: {
          username: "buyerext",
          phoneNumber: "01234567892",
        },
      });

      const externalMerchant = await User.create({
        email: "seller@yahoo.com",
        password: "SecurePass123!",
        profile: {
          username: "sellerext",
          phoneNumber: "01234567893",
        },
        roles: ["merchant"],
      });

      const order = await Order.create({
        checkoutSessionId: new mongoose.Types.ObjectId(),
        buyer: {
          userId: externalBuyer._id,
          username: externalBuyer.profile.username,
          email: externalBuyer.email,
          phone: externalBuyer.profile.phoneNumber,
        },
        seller: {
          userId: externalMerchant._id,
          name: externalMerchant.profile.username,
          email: externalMerchant.email,
          phone: externalMerchant.profile.phoneNumber,
        },
        items: [
          {
            listingId: testListing._id,
            name: "External Email Product",
            price: 100,
            quantity: 1,
          },
        ],
        itemsTotal: 100,
        shippingFee: 10,
        totalAmount: 110,
        paymentMethod: "cod",
        deliveryMethod: "campus_delivery",
        deliveryAddress: {
          type: "campus",
          campus: "SHAH_ALAM",
          block: "A",
          roomNumber: "103",
          recipientName: externalBuyer.profile.username,
          recipientPhone: externalBuyer.profile.phoneNumber,
        },
      });

      expect(order.buyer.email).toBe("buyer@gmail.com");
      expect(order.seller.email).toBe("seller@yahoo.com");
    });
  });

  describe("Payment Methods", () => {
    it("should accept valid payment methods", async () => {
      const validMethods = ["cod", "bank_transfer", "e_wallet", "credit_card"];

      for (const method of validMethods) {
        const order = await Order.create({
          checkoutSessionId: new mongoose.Types.ObjectId(),
          buyer: {
            userId: buyer._id,
            username: buyer.profile.username,
            email: buyer.email,
            phone: buyer.profile.phoneNumber,
          },
          seller: {
            userId: merchant._id,
            name: merchant.profile.username,
            email: merchant.email,
            phone: merchant.profile.phoneNumber,
          },
          items: [
            {
              listingId: testListing._id,
              name: "Test Product",
              price: 100,
              quantity: 1,
            },
          ],
          itemsTotal: 100,
          shippingFee: 10,
          totalAmount: 110,
          paymentMethod: method,
          deliveryMethod: "campus_delivery",
          deliveryAddress: {
            type: "campus",
            campus: "SHAH_ALAM",
            block: "A",
            roomNumber: method,
            recipientName: buyer.profile.username,
            recipientPhone: buyer.profile.phoneNumber,
          },
        });

        expect(order.paymentMethod).toBe(method);
      }
    });
  });

  describe("Delivery Methods", () => {
    it("should accept valid delivery methods", async () => {
      const validMethods = [
        "campus_delivery",
        "room_delivery",
        "self_pickup",
        "meetup",
      ];

      for (const method of validMethods) {
        const order = await Order.create({
          checkoutSessionId: new mongoose.Types.ObjectId(),
          buyer: {
            userId: buyer._id,
            username: buyer.profile.username,
            email: buyer.email,
            phone: buyer.profile.phoneNumber,
          },
          seller: {
            userId: merchant._id,
            name: merchant.profile.username,
            email: merchant.email,
            phone: merchant.profile.phoneNumber,
          },
          items: [
            {
              listingId: testListing._id,
              name: "Test Product",
              price: 100,
              quantity: 1,
            },
          ],
          itemsTotal: 100,
          shippingFee: 10,
          totalAmount: 110,
          paymentMethod: "cod",
          deliveryMethod: method,
          deliveryAddress: {
            type: "campus",
            campus: "SHAH_ALAM",
            block: "A",
            roomNumber: method,
            recipientName: buyer.profile.username,
            recipientPhone: buyer.profile.phoneNumber,
          },
        });

        expect(order.deliveryMethod).toBe(method);
      }
    });
  });

  describe("Timestamps", () => {
    it("should auto-generate timestamps", async () => {
      const order = await Order.create({
        checkoutSessionId: new mongoose.Types.ObjectId(),
        buyer: {
          userId: buyer._id,
          username: buyer.profile.username,
          email: buyer.email,
          phone: buyer.profile.phoneNumber,
        },
        seller: {
          userId: merchant._id,
          name: merchant.profile.username,
          email: merchant.email,
          phone: merchant.profile.phoneNumber,
        },
        items: [
          {
            listingId: testListing._id,
            name: "Test Product",
            price: 100,
            quantity: 1,
          },
        ],
        itemsTotal: 100,
        shippingFee: 10,
        totalAmount: 110,
        paymentMethod: "cod",
        deliveryMethod: "campus_delivery",
        deliveryAddress: {
          type: "campus",
          campus: "SHAH_ALAM",
          block: "A",
          roomNumber: "101",
          recipientName: buyer.profile.username,
          recipientPhone: buyer.profile.phoneNumber,
        },
      });

      expect(order.createdAt).toBeDefined();
      expect(order.updatedAt).toBeDefined();
    });
  });

  describe("Indexes", () => {
    it("should have compound indexes", async () => {
      const indexes = await Order.collection.getIndexes();
      const hasBuyerIndex = Object.keys(indexes).some((key) =>
        key.includes("buyer.userId")
      );
      expect(hasBuyerIndex).toBe(true);
    });
  });
});
