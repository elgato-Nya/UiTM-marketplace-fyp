describe("listing.service active listing limit enforcement", () => {
  const userId = "507f1f77bcf86cd799439011";
  const listingId = "507f1f77bcf86cd799439012";

  const loadListingService = ({
    enforceListingLimits = true,
    activeListingCount = 0,
    listingLimit = 5,
    listingDoc = null,
  } = {}) => {
    jest.resetModules();

    const countDocuments = jest.fn().mockResolvedValue(activeListingCount);
    const save = jest.fn().mockResolvedValue(undefined);
    const findById = jest.fn().mockResolvedValue(listingDoc);
    const listingConstructor = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: listingId,
      save,
      toObject() {
        return {
          ...data,
          _id: listingId,
          seller: data.seller,
        };
      },
    }));

    listingConstructor.countDocuments = countDocuments;
    listingConstructor.findById = findById;

    const createForbiddenError = jest.fn((message, code) => {
      const error = new Error(message);
      error.statusCode = 403;
      error.code = code;
      throw error;
    });

    jest.doMock("../../../models/listing/listing.model", () => listingConstructor);
    jest.doMock("../../../models/user/user.model", () => ({}));
    jest.doMock("../../../config/env.config", () => ({
      finance: { enforceListingLimits },
    }));
    jest.doMock("../../../utils/sanitizer", () => ({
      sanitizeObject: jest.fn((value) => ({ ...value })),
    }));
    jest.doMock("../../../utils/errors", () => ({
      createForbiddenError,
    }));
    jest.doMock("../../../services/base.service", () => ({
      handleServiceError: jest.fn((error) => {
        throw error;
      }),
      handleNotFoundError: jest.fn(() => {
        throw new Error("Not found");
      }),
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
        rules: { listingLimit },
      }),
    }));

    const listingService = require("../../../services/listing/listing.service");
    const planService = require("../../../services/plan/plan.service");

    return {
      listingService,
      mocks: {
        Listing: listingConstructor,
        countDocuments,
        findById,
        save,
        createForbiddenError,
        getActiveSellerPlan: planService.getActiveSellerPlan,
      },
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

  it("blocks active listing creation at the limit when enforcement is enabled", async () => {
    const { listingService } = loadListingService({
      enforceListingLimits: true,
      activeListingCount: 5,
      listingLimit: 5,
    });

    await expect(
      listingService.createListing(userId, {
        name: "Test Listing",
        isAvailable: true,
      }),
    ).rejects.toMatchObject({
      code: "LISTING_LIMIT_REACHED",
      statusCode: 403,
    });
  });

  it("allows inactive listing creation without consuming the active cap", async () => {
    const { listingService, mocks } = loadListingService({
      enforceListingLimits: true,
      activeListingCount: 5,
      listingLimit: 5,
    });

    const result = await listingService.createListing(userId, {
      name: "Inactive Listing",
      isAvailable: false,
    });

    expect(mocks.countDocuments).not.toHaveBeenCalled();
    expect(result.seller).toEqual({ userId });
  });

  it("blocks inactive to active update at the limit when enforcement is enabled", async () => {
    const listingDoc = {
      _id: listingId,
      isAvailable: false,
      save: jest.fn().mockResolvedValue(undefined),
      toObject() {
        return { _id: listingId, isAvailable: true };
      },
    };
    const { listingService, mocks } = loadListingService({
      enforceListingLimits: true,
      activeListingCount: 5,
      listingLimit: 5,
      listingDoc,
    });

    await expect(
      listingService.updateListing(listingId, userId, { isAvailable: true }),
    ).rejects.toMatchObject({
      code: "LISTING_LIMIT_REACHED",
      statusCode: 403,
    });

    expect(mocks.countDocuments).toHaveBeenCalledWith({
      "seller.userId": userId,
      isAvailable: true,
      _id: { $ne: listingId },
    });
  });

  it("blocks inactive to active toggle at the limit when enforcement is enabled", async () => {
    const listingDoc = {
      _id: listingId,
      isAvailable: false,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const { listingService } = loadListingService({
      enforceListingLimits: true,
      activeListingCount: 5,
      listingLimit: 5,
      listingDoc,
    });

    await expect(
      listingService.toggleAvailability(listingId, userId),
    ).rejects.toMatchObject({
      code: "LISTING_LIMIT_REACHED",
      statusCode: 403,
    });
  });

  it("allows active to inactive toggle even at the limit", async () => {
    const listingDoc = {
      _id: listingId,
      isAvailable: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const { listingService, mocks } = loadListingService({
      enforceListingLimits: true,
      activeListingCount: 5,
      listingLimit: 5,
      listingDoc,
    });

    const result = await listingService.toggleAvailability(listingId, userId);

    expect(mocks.countDocuments).not.toHaveBeenCalled();
    expect(result.isAvailable).toBe(false);
  });

  it("allows editing an already-active listing at the limit", async () => {
    const listingDoc = {
      _id: listingId,
      isAvailable: true,
      name: "Original",
      save: jest.fn().mockResolvedValue(undefined),
      toObject() {
        return { _id: listingId, isAvailable: true, name: this.name };
      },
    };
    const { listingService, mocks } = loadListingService({
      enforceListingLimits: true,
      activeListingCount: 5,
      listingLimit: 5,
      listingDoc,
    });

    const result = await listingService.updateListing(listingId, userId, {
      name: "Updated",
    });

    expect(mocks.countDocuments).not.toHaveBeenCalled();
    expect(result.name).toBe("Updated");
  });

  it("skips create and reactivation checks when enforcement is disabled", async () => {
    const inactiveListing = {
      _id: listingId,
      isAvailable: false,
      save: jest.fn().mockResolvedValue(undefined),
      toObject() {
        return { _id: listingId, isAvailable: true };
      },
    };
    const { listingService, mocks } = loadListingService({
      enforceListingLimits: false,
      activeListingCount: 99,
      listingLimit: 1,
      listingDoc: inactiveListing,
    });

    await expect(
      listingService.createListing(userId, {
        name: "Unlimited Listing",
        isAvailable: true,
      }),
    ).resolves.toBeTruthy();

    await expect(
      listingService.updateListing(listingId, userId, { isAvailable: true }),
    ).resolves.toBeTruthy();

    inactiveListing.isAvailable = false;
    await expect(
      listingService.toggleAvailability(listingId, userId),
    ).resolves.toBeTruthy();

    expect(mocks.countDocuments).not.toHaveBeenCalled();
    expect(mocks.getActiveSellerPlan).not.toHaveBeenCalled();
  });
});
