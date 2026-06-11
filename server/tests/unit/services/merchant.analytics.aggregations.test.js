describe("merchant analytics listing filters", () => {
  const merchantId = "507f1f77bcf86cd799439011";

  const loadAggregations = () => {
    jest.resetModules();

    const aggregate = jest.fn();
    const countDocuments = jest.fn();

    jest.doMock("../../../models/listing/listing.model", () => ({
      aggregate,
      countDocuments,
    }));
    jest.doMock("../../../models/order", () => ({
      Order: { aggregate: jest.fn() },
    }));
    jest.doMock("../../../utils/logger", () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));
    jest.doMock("../../../services/analytic/aggregations/helpers", () => ({
      fillMissingDates: jest.fn(),
    }));

    return {
      aggregations: require("../../../services/analytic/aggregations/merchant.aggregations"),
      mocks: { aggregate, countDocuments },
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.dontMock("../../../models/listing/listing.model");
    jest.dontMock("../../../models/order");
    jest.dontMock("../../../utils/logger");
    jest.dontMock("../../../services/analytic/aggregations/helpers");
  });

  it("excludes tombstoned listings from merchant active/inactive counts", async () => {
    const { aggregations, mocks } = loadAggregations();
    mocks.aggregate.mockResolvedValue([{ _id: true, count: 2 }, { _id: false, count: 3 }]);

    await aggregations.countMerchantListings(merchantId);

    expect(mocks.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          "seller.userId": expect.any(Object),
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: "$isAvailable",
          count: { $sum: 1 },
        },
      },
    ]);
  });

  it("excludes tombstoned listings from low stock counts", async () => {
    const { aggregations, mocks } = loadAggregations();
    mocks.countDocuments.mockResolvedValue(4);

    await aggregations.countLowStockProducts(merchantId);

    expect(mocks.countDocuments).toHaveBeenCalledWith({
      "seller.userId": expect.any(Object),
      isDeleted: { $ne: true },
      type: "product",
      stock: { $lt: 5, $gt: 0 },
      isAvailable: true,
    });
  });
});
