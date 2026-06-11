describe("listing.service variant visibility guards", () => {
  const listingId = "507f1f77bcf86cd799439012";
  const variantId = "507f1f77bcf86cd799439013";

  const loadListingService = () => {
    jest.resetModules();

    const findOne = jest.fn();
    const listingConstructor = jest.fn();
    listingConstructor.findOne = findOne;
    listingConstructor.countDocuments = jest.fn().mockResolvedValue(0);
    listingConstructor.findById = jest.fn();
    listingConstructor.findByIdAndDelete = jest.fn();

    const handleNotFoundError = jest.fn((entity, code) => {
      const error = new Error(`${entity} not found`);
      error.code = code;
      error.statusCode = 404;
      throw error;
    });

    jest.doMock("../../../models/listing/listing.model", () => listingConstructor);
    jest.doMock("../../../models/user/user.model", () => ({}));
    jest.doMock("../../../config/env.config", () => ({
      finance: { enforceListingLimits: false },
    }));
    jest.doMock("../../../utils/sanitizer", () => ({
      sanitizeObject: jest.fn((value) => ({ ...value })),
    }));
    jest.doMock("../../../utils/errors", () => ({
      createForbiddenError: jest.fn(),
    }));
    jest.doMock("../../../services/base.service", () => ({
      handleServiceError: jest.fn((error) => {
        throw error;
      }),
      handleNotFoundError,
      buildSort: jest.fn(() => ({ createdAt: -1 })),
      generateCacheKey: jest.fn(() => "cache-key"),
      buildSelect: jest.fn(() => ""),
    }));
    jest.doMock("../../../utils/logger", () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));
    jest.doMock("../../../services/plan/plan.service", () => ({
      getActiveSellerPlan: jest.fn().mockResolvedValue({
        planType: "basic",
        rules: { listingLimit: 5 },
      }),
    }));

    return {
      listingService: require("../../../services/listing/listing.service"),
      mocks: { findOne, handleNotFoundError },
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.dontMock("../../../models/listing/listing.model");
    jest.dontMock("../../../models/user/user.model");
    jest.dontMock("../../../config/env.config");
    jest.dontMock("../../../utils/sanitizer");
    jest.dontMock("../../../utils/errors");
    jest.dontMock("../../../services/base.service");
    jest.dontMock("../../../utils/logger");
    jest.dontMock("../../../services/plan/plan.service");
  });

  it("does not expose a tombstoned listing variant", async () => {
    const { listingService, mocks } = loadListingService();
    mocks.findOne.mockResolvedValue(null);

    await expect(listingService.getVariant(listingId, variantId)).rejects.toMatchObject({
      code: "LISTING_NOT_FOUND",
      statusCode: 404,
    });

    expect(mocks.findOne).toHaveBeenCalledWith({
      _id: listingId,
      isDeleted: { $ne: true },
    });
  });

  it("does not expose variants for a tombstoned listing", async () => {
    const { listingService, mocks } = loadListingService();
    const select = jest.fn().mockResolvedValue(null);
    mocks.findOne.mockReturnValue({ select });

    await expect(listingService.getListingVariants(listingId)).rejects.toMatchObject({
      code: "LISTING_NOT_FOUND",
      statusCode: 404,
    });

    expect(mocks.findOne).toHaveBeenCalledWith({
      _id: listingId,
      isDeleted: { $ne: true },
    });
    expect(select).toHaveBeenCalledWith("variants type");
  });

  it("still returns available variants for an active listing", async () => {
    const { listingService, mocks } = loadListingService();
    const activeListing = {
      variants: [
        {
          toObject: () => ({ _id: variantId, name: "Red", isAvailable: true }),
        },
        {
          toObject: () => ({ _id: "507f1f77bcf86cd799439014", name: "Blue", isAvailable: false }),
        },
      ],
    };
    const select = jest.fn().mockResolvedValue(activeListing);
    mocks.findOne.mockReturnValue({ select });

    const variants = await listingService.getListingVariants(listingId);

    expect(variants).toEqual([{ _id: variantId, name: "Red", isAvailable: true }]);
  });
});
