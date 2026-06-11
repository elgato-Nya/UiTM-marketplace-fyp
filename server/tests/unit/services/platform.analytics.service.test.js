describe("platform analytics listing totals", () => {
  const fixedDate = new Date("2026-06-11T00:00:00.000Z");

  const loadService = () => {
    jest.resetModules();

    const countListingsByCategory = jest.fn().mockResolvedValue([
      { category: "electronics", count: 2 },
    ]);
    const listingCountDocuments = jest.fn().mockResolvedValue(5);
    const findOneAndUpdate = jest.fn().mockResolvedValue({ _id: "analytics-1" });

    jest.doMock("../../../models/analytic", () => ({
      PlatformAnalytics: { findOneAndUpdate },
    }));
    jest.doMock("../../../models/user", () => ({
      User: {
        countDocuments: jest.fn().mockResolvedValue(1),
      },
    }));
    jest.doMock("../../../models/listing/listing.model", () => ({
      countDocuments: listingCountDocuments,
    }));
    jest.doMock("../../../services/analytic/aggregations", () => ({
      getDateRange: jest.fn(() => ({
        start: fixedDate,
        end: fixedDate,
        previous: fixedDate,
      })),
      calculateGrowthRate: jest.fn().mockReturnValue(0),
      countUsersByRole: jest.fn().mockResolvedValue({
        total: 10,
        consumers: 6,
        merchants: 3,
        admins: 1,
      }),
      countActiveUsers: jest.fn().mockResolvedValue(4),
      countListingsByCategory,
      countUsersByCampus: jest.fn().mockResolvedValue([]),
      calculatePlatformGMV: jest.fn().mockResolvedValue({ total: 100, count: 2 }),
      countMerchantsByStatus: jest.fn().mockResolvedValue({
        total: 3,
        active: 2,
        verified: 2,
        pendingVerification: 1,
        suspended: 0,
      }),
    }));
    jest.doMock("../../../services/base.service", () => ({
      handleServiceError: jest.fn((error) => {
        throw error;
      }),
      getEnumValueByKey: jest.fn(),
    }));
    jest.doMock("../../../utils/logger", () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));
    jest.doMock("../../../utils/enums/user.enum", () => ({
      CampusEnum: {},
    }));

    return {
      service: require("../../../services/analytic/platform.analytics.service"),
      mocks: { listingCountDocuments, findOneAndUpdate, countListingsByCategory },
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.dontMock("../../../models/analytic");
    jest.dontMock("../../../models/user");
    jest.dontMock("../../../models/listing/listing.model");
    jest.dontMock("../../../services/analytic/aggregations");
    jest.dontMock("../../../services/base.service");
    jest.dontMock("../../../utils/logger");
    jest.dontMock("../../../utils/enums/user.enum");
  });

  it("excludes tombstoned listings from platform total listing metrics", async () => {
    const { service, mocks } = loadService();

    await service.calculatePlatformAnalytics("week");

    expect(mocks.listingCountDocuments).toHaveBeenCalledWith({
      isDeleted: { $ne: true },
    });
    expect(mocks.findOneAndUpdate).toHaveBeenCalled();
  });
});
