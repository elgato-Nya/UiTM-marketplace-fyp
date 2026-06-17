describe("merchant analytics listing filters", () => {
  const merchantId = "507f1f77bcf86cd799439011";

  const loadAggregations = () => {
    jest.resetModules();

    const aggregate = jest.fn();

    jest.doMock("../../../models/listing/listing.model", () => ({
      aggregate,
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
      mocks: { aggregate },
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
    mocks.aggregate.mockResolvedValue([{ count: 4 }]);

    await aggregations.countLowStockProducts(merchantId);

    expect(mocks.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          "seller.userId": expect.any(Object),
          isDeleted: { $ne: true },
          type: "product",
          isAvailable: true,
        },
      },
      {
        $addFields: {
          availableVariants: {
            $filter: {
              input: { $ifNull: ["$variants", []] },
              as: "variant",
              cond: { $eq: ["$$variant.isAvailable", true] },
            },
          },
          variantCount: { $size: { $ifNull: ["$variants", []] } },
          baseStockSafe: { $ifNull: ["$stock", 0] },
        },
      },
      {
        $addFields: {
          lowStockVariants: {
            $filter: {
              input: "$availableVariants",
              as: "variant",
              cond: {
                $and: [
                  { $gt: [{ $ifNull: ["$$variant.stock", 0] }, 0] },
                  { $lt: [{ $ifNull: ["$$variant.stock", 0] }, 5] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              {
                $and: [
                  { $eq: ["$variantCount", 0] },
                  { $gt: ["$baseStockSafe", 0] },
                  { $lt: ["$baseStockSafe", 5] },
                ],
              },
              {
                $and: [
                  { $gt: ["$variantCount", 0] },
                  { $gt: [{ $size: "$lowStockVariants" }, 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          attentionStock: {
            $cond: [
              { $gt: ["$variantCount", 0] },
              { $min: "$lowStockVariants.stock" },
              "$baseStockSafe",
            ],
          },
        },
      },
      {
        $count: "count",
      },
    ]);
  });

  it("returns zero when no low stock listings match", async () => {
    const { aggregations, mocks } = loadAggregations();
    mocks.aggregate.mockResolvedValue([]);

    await expect(aggregations.countLowStockProducts(merchantId)).resolves.toBe(
      0
    );
  });

  it("builds paginated low stock inventory using per-variant low-stock matching", async () => {
    const { aggregations, mocks } = loadAggregations();
    const returnedVariants = [
      { _id: "variant-1", stock: 1, sku: "SKU-1" },
      { _id: "variant-2", stock: 2, sku: "SKU-2" },
      { _id: "variant-3", stock: 1, sku: "SKU-3" },
    ];

    mocks.aggregate
      .mockResolvedValueOnce([{ total: 2 }])
      .mockResolvedValueOnce([
        {
          _id: "listing-1",
          lowStockVariants: returnedVariants,
        },
      ]);

    const result = await aggregations.getLowStockInventory(merchantId, {
      page: 2,
      limit: 5,
      threshold: 3,
    });

    expect(mocks.aggregate).toHaveBeenNthCalledWith(1, [
      {
        $match: {
          "seller.userId": expect.any(Object),
          isDeleted: { $ne: true },
          type: "product",
          isAvailable: true,
        },
      },
      {
        $addFields: {
          availableVariants: {
            $filter: {
              input: { $ifNull: ["$variants", []] },
              as: "variant",
              cond: { $eq: ["$$variant.isAvailable", true] },
            },
          },
          variantCount: { $size: { $ifNull: ["$variants", []] } },
          baseStockSafe: { $ifNull: ["$stock", 0] },
        },
      },
      {
        $addFields: {
          lowStockVariants: {
            $filter: {
              input: "$availableVariants",
              as: "variant",
              cond: {
                $and: [
                  { $gt: [{ $ifNull: ["$$variant.stock", 0] }, 0] },
                  { $lt: [{ $ifNull: ["$$variant.stock", 0] }, 3] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              {
                $and: [
                  { $eq: ["$variantCount", 0] },
                  { $gt: ["$baseStockSafe", 0] },
                  { $lt: ["$baseStockSafe", 3] },
                ],
              },
              {
                $and: [
                  { $gt: ["$variantCount", 0] },
                  { $gt: [{ $size: "$lowStockVariants" }, 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          attentionStock: {
            $cond: [
              { $gt: ["$variantCount", 0] },
              { $min: "$lowStockVariants.stock" },
              "$baseStockSafe",
            ],
          },
        },
      },
      { $count: "total" },
    ]);

    expect(mocks.aggregate).toHaveBeenNthCalledWith(2, expect.arrayContaining([
      { $sort: { attentionStock: 1, updatedAt: -1, _id: 1 } },
      { $skip: 5 },
      { $limit: 5 },
      expect.objectContaining({
        $project: expect.objectContaining({
          lowStockVariants: expect.any(Object),
          stock: expect.any(Object),
        }),
      }),
    ]));

    expect(result).toEqual({
      items: [{ _id: "listing-1", lowStockVariants: returnedVariants }],
      threshold: 3,
      pagination: {
        currentPage: 2,
        totalPages: 1,
        totalItems: 2,
        hasNextPage: false,
        hasPrevPage: true,
        limit: 5,
      },
    });
  });

  it("keeps variant low-stock filtering in the aggregation and listing-level counting in the dashboard metric", async () => {
    const { aggregations, mocks } = loadAggregations();
    mocks.aggregate.mockResolvedValue([{ count: 1 }]);

    const count = await aggregations.countLowStockProducts(merchantId);

    expect(count).toBe(1);

    const countPipeline = mocks.aggregate.mock.calls[0][0];
    const lowStockStage = countPipeline.find(
      (stage) => stage.$addFields?.lowStockVariants
    );

    expect(lowStockStage).toEqual({
      $addFields: {
        lowStockVariants: {
          $filter: {
            input: "$availableVariants",
            as: "variant",
            cond: {
              $and: [
                { $gt: [{ $ifNull: ["$$variant.stock", 0] }, 0] },
                { $lt: [{ $ifNull: ["$$variant.stock", 0] }, 5] },
              ],
            },
          },
        },
      },
    });
  });
});
