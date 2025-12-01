const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const {
  MerchantAnalytics,
  PlatformAnalytics,
  User,
} = require("../../../models");

/**
 * ANALYTICS MODELS INTEGRATION TESTS
 * Tests merchant and platform analytics with database operations
 */
describe("Analytics Models Integration Tests", () => {
  let mongoServer;
  let merchantUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await MerchantAnalytics.deleteMany({});
    await PlatformAnalytics.deleteMany({});
    await User.deleteMany({});

    merchantUser = await User.create({
      email: "merchant@student.uitm.edu.my",
      password: "SecurePass123!",
      profile: {
        username: "analyticmer",
        phoneNumber: "01234567890",
        campus: "SHAH_ALAM",
        faculty: "BUSINESS_MANAGEMENT",
      },
      roles: ["merchant"],
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("MerchantAnalytics Model", () => {
    describe("Creation", () => {
      it("should create weekly merchant analytics record", async () => {
        const analytics = await MerchantAnalytics.create({
          merchantId: merchantUser._id,
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
          revenue: {
            total: 5000,
          },
          orders: {
            total: 25,
            averageValue: 200,
          },
        });

        expect(analytics.merchantId.toString()).toBe(
          merchantUser._id.toString()
        );
        expect(analytics.period).toBe("week");
        expect(analytics.revenue.total).toBe(5000);
      });

      it("should require merchantId, period, startDate, endDate", async () => {
        await expect(
          MerchantAnalytics.create({
            merchantId: merchantUser._id,
            revenue: { total: 1000 },
          })
        ).rejects.toThrow();
      });

      it("should enforce unique merchantId + period combination", async () => {
        await MerchantAnalytics.create({
          merchantId: merchantUser._id,
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
        });

        await expect(
          MerchantAnalytics.create({
            merchantId: merchantUser._id,
            period: "week",
            startDate: new Date("2025-01-20"),
            endDate: new Date("2025-01-26"),
          })
        ).rejects.toThrow();
      });
    });

    describe("Revenue Metrics", () => {
      it("should track revenue by category", async () => {
        const analytics = await MerchantAnalytics.create({
          merchantId: merchantUser._id,
          period: "month",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-31"),
          revenue: {
            byCategory: [
              { category: "electronics", amount: 3000, count: 15 },
              { category: "books", amount: 500, count: 10 },
            ],
          },
        });

        expect(analytics.revenue.byCategory).toHaveLength(2);
        expect(analytics.revenue.byCategory[0].category).toBe("electronics");
        expect(analytics.revenue.byCategory[0].amount).toBe(3000);
      });

      it("should track revenue growth rate", async () => {
        const analytics = await MerchantAnalytics.create({
          merchantId: merchantUser._id,
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
          revenue: {
            total: 5000,
            previousPeriod: 4000,
            growthRate: 25,
          },
        });

        expect(analytics.revenue.growthRate).toBe(25);
        expect(analytics.revenue.previousPeriod).toBe(4000);
      });
    });

    describe("Listing Metrics", () => {
      it("should track top selling listings", async () => {
        const analytics = await MerchantAnalytics.create({
          merchantId: merchantUser._id,
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
          listings: {
            topSelling: [
              {
                listingId: new mongoose.Types.ObjectId(),
                name: "Gaming Laptop",
                sales: 5,
                revenue: 17500,
                category: "electronics",
              },
            ],
          },
        });

        expect(analytics.listings.topSelling[0].name).toBe("Gaming Laptop");
        expect(analytics.listings.topSelling[0].sales).toBe(5);
      });
    });

    describe("Conversion Metrics", () => {
      it("should track conversion rate", async () => {
        const analytics = await MerchantAnalytics.create({
          merchantId: merchantUser._id,
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
          conversion: {
            views: 500,
            purchases: 50,
            rate: 10,
          },
        });

        expect(analytics.conversion.views).toBe(500);
        expect(analytics.conversion.rate).toBe(10);
      });
    });

    describe("Timestamps", () => {
      it("should auto-generate timestamps", async () => {
        const analytics = await MerchantAnalytics.create({
          merchantId: merchantUser._id,
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
        });

        expect(analytics.createdAt).toBeDefined();
        expect(analytics.updatedAt).toBeDefined();
        expect(analytics.lastCalculated).toBeDefined();
      });
    });

    describe("Indexes", () => {
      it("should have merchantId and period compound index", async () => {
        const indexes = await MerchantAnalytics.collection.getIndexes();
        const hasCompoundIndex = Object.keys(indexes).some(
          (key) => key.includes("merchantId") && key.includes("period")
        );
        expect(hasCompoundIndex).toBe(true);
      });
    });
  });

  describe("PlatformAnalytics Model", () => {
    describe("Creation", () => {
      it("should create weekly platform analytics record", async () => {
        const analytics = await PlatformAnalytics.create({
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
          users: {
            total: 1000,
            activeWeek: 750,
          },
          orders: {
            total: 200,
          },
        });

        expect(analytics.period).toBe("week");
        expect(analytics.users.total).toBe(1000);
      });

      it("should require period, startDate, endDate", async () => {
        await expect(
          PlatformAnalytics.create({
            users: { total: 1000 },
          })
        ).rejects.toThrow();
      });

      it("should enforce unique period", async () => {
        await PlatformAnalytics.create({
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
        });

        await expect(
          PlatformAnalytics.create({
            period: "week",
            startDate: new Date("2025-01-20"),
            endDate: new Date("2025-01-26"),
          })
        ).rejects.toThrow();
      });
    });

    describe("User Metrics", () => {
      it("should track users by campus", async () => {
        const analytics = await PlatformAnalytics.create({
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
          users: {
            byCampus: [
              { campus: "SHAH_ALAM", count: 500 }, // Stores enum KEYS, not values
              { campus: "PUNCAK_ALAM", count: 300 },
            ],
          },
        });

        expect(analytics.users.byCampus).toHaveLength(2);
        expect(analytics.users.byCampus[0].campus).toBe("SHAH_ALAM");
        expect(analytics.users.byCampus[0].count).toBe(500);
      });

      it("should track user growth rate", async () => {
        const analytics = await PlatformAnalytics.create({
          period: "month",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-31"),
          users: {
            total: 1100,
            growthRate: 10,
          },
        });

        expect(analytics.users.growthRate).toBe(10);
      });
    });

    describe("Listing Metrics", () => {
      it("should track listings by category", async () => {
        const analytics = await PlatformAnalytics.create({
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
          listings: {
            byCategory: [
              { category: "electronics", count: 150 },
              { category: "books", count: 200 },
            ],
          },
        });

        expect(analytics.listings.byCategory).toHaveLength(2);
        expect(analytics.listings.byCategory[0].category).toBe("electronics");
        expect(analytics.listings.byCategory[0].count).toBe(150);
      });
    });

    describe("Order Metrics", () => {
      it("should track GMV (Gross Merchandise Value)", async () => {
        const analytics = await PlatformAnalytics.create({
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
          orders: {
            total: 200,
            completed: 180,
            gmv: {
              total: 50000,
              week: 50000,
            },
            averageOrderValue: 250,
          },
        });

        expect(analytics.orders.gmv.total).toBe(50000);
        expect(analytics.orders.averageOrderValue).toBe(250);
      });
    });

    describe("Timestamps", () => {
      it("should auto-generate timestamps", async () => {
        const analytics = await PlatformAnalytics.create({
          period: "week",
          startDate: new Date("2025-01-13"),
          endDate: new Date("2025-01-19"),
        });

        expect(analytics.createdAt).toBeDefined();
        expect(analytics.updatedAt).toBeDefined();
        expect(analytics.lastCalculated).toBeDefined();
      });
    });

    describe("Indexes", () => {
      it("should have unique period index", async () => {
        const indexes = await PlatformAnalytics.collection.getIndexes();
        expect(indexes).toHaveProperty("period_1");
      });

      it("should have endDate descending index", async () => {
        const indexes = await PlatformAnalytics.collection.getIndexes();
        expect(indexes).toHaveProperty("endDate_-1");
      });
    });
  });
});
