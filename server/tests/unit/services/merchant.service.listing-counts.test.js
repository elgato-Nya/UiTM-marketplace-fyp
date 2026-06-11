describe("merchant service listing count filters", () => {
  const userId = "507f1f77bcf86cd799439011";

  const createMerchantDetails = (overrides = {}) => ({
    shopName: "Test Shop",
    shopSlug: "test-shop",
    shopUrl: "/shops/test-shop",
    isVerified: true,
    isShopActive: true,
    shopMetrics: {
      totalViews: 8,
      totalSales: 3,
      totalRevenue: 50,
      totalProducts: 0,
      toObject() {
        return {
          totalViews: 8,
          totalSales: 3,
          totalRevenue: 50,
          totalProducts: 0,
        };
      },
    },
    toObject() {
      return {
        shopName: this.shopName,
        shopSlug: this.shopSlug,
        shopUrl: this.shopUrl,
        shopMetrics: this.shopMetrics.toObject(),
      };
    },
    ...overrides,
  });

  const loadMerchantService = ({
    findByIdUser,
    findOneUser,
    findUsers = [],
    totalUsers = 1,
  }) => {
    jest.resetModules();

    const aggregate = jest.fn().mockResolvedValue([{ totalProducts: 3, activeListings: 2 }]);
    const countDocuments = jest.fn().mockResolvedValue(4);
    const userFindById = jest.fn().mockResolvedValue(findByIdUser);
    const userFindOne = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(findOneUser),
    });
    const userFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(findUsers),
          }),
        }),
      }),
    });
    const userCountDocuments = jest.fn().mockResolvedValue(totalUsers);

    jest.doMock("../../../models/user", () => ({
      User: {
        findById: userFindById,
        findOne: userFindOne,
        find: userFind,
        countDocuments: userCountDocuments,
      },
    }));
    jest.doMock("../../../models/listing/listing.model", () => ({
      aggregate,
      countDocuments,
      updateMany: jest.fn(),
    }));
    jest.doMock("../../../services/analytic/aggregations/merchant.aggregations", () => ({
      calculateMerchantRevenue: jest.fn().mockResolvedValue({ total: 120 }),
    }));
    jest.doMock("../../../utils/logger", () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));
    jest.doMock("../../../services/base.service", () => ({
      handleServiceError: jest.fn((error) => {
        throw error;
      }),
      handleNotFoundError: jest.fn((entity, id) => {
        const error = new Error(`${entity} not found`);
        error.statusCode = 404;
        error.code = `${entity.toUpperCase()}_NOT_FOUND`;
        error.details = { id };
        throw error;
      }),
      sanitizeUserData: jest.fn((user) => user),
    }));

    return {
      service: require("../../../services/user/merchant.service"),
      mocks: {
        aggregate,
        countDocuments,
        userFindById,
        userFindOne,
        userFind,
        userCountDocuments,
      },
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.dontMock("../../../models/user");
    jest.dontMock("../../../models/listing/listing.model");
    jest.dontMock("../../../services/analytic/aggregations/merchant.aggregations");
    jest.dontMock("../../../utils/logger");
    jest.dontMock("../../../services/base.service");
  });

  it("excludes tombstoned listings from shop dashboard counts", async () => {
    const { service, mocks } = loadMerchantService({
      findByIdUser: {
        _id: userId,
        roles: ["merchant"],
        merchantDetails: createMerchantDetails(),
        toObject() {
          return { _id: userId };
        },
      },
      findOneUser: null,
    });

    await service.getOrCreateShop(userId);

    expect(mocks.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          "seller.userId": expect.any(Object),
          isDeleted: { $ne: true },
        },
      },
      expect.any(Object),
    ]);
  });

  it("excludes tombstoned listings from public merchant profile counts", async () => {
    const { service, mocks } = loadMerchantService({
      findByIdUser: null,
      findOneUser: {
        _id: userId,
        roles: ["merchant"],
        profile: {
          username: "merchant",
          avatar: "avatar.jpg",
          phoneNumber: "0123456789",
        },
        merchantDetails: createMerchantDetails(),
      },
    });

    await service.getMerchantBySlug("test-shop");

    expect(mocks.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          "seller.userId": expect.any(Object),
          isDeleted: { $ne: true },
        },
      },
      expect.any(Object),
    ]);
  });

  it("excludes tombstoned listings from merchant search product counts", async () => {
    const merchant = {
      _id: userId,
      profile: { username: "merchant", avatar: "avatar.jpg" },
      merchantDetails: createMerchantDetails(),
    };
    const { service, mocks } = loadMerchantService({
      findByIdUser: null,
      findOneUser: null,
      findUsers: [merchant],
      totalUsers: 1,
    });

    await service.searchMerchants("test");

    expect(mocks.countDocuments).toHaveBeenCalledWith({
      "seller.userId": merchant._id,
      isDeleted: { $ne: true },
      isAvailable: true,
    });
  });
});
