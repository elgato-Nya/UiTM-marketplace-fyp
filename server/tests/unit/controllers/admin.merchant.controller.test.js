describe("admin merchant controller listing stats", () => {
  const userId = "507f1f77bcf86cd799439011";

  const loadController = () => {
    jest.resetModules();

    const sendSuccess = jest.fn((res, payload) => payload);
    const logAction = jest.fn();
    const findByIdSelectLean = jest.fn().mockResolvedValue({
      _id: userId,
      email: "merchant@example.com",
      roles: ["merchant"],
      merchantDetails: {
        shopName: "Shop",
        shopMetrics: {},
      },
    });
    const User = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: findByIdSelectLean,
        }),
      }),
    };
    const listingCountDocuments = jest.fn().mockResolvedValue(6);
    const orderCountDocuments = jest.fn().mockResolvedValue(2);

    jest.doMock("../../../models/user", () => ({ User }));
    jest.doMock("../../../utils/logger", () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));
    jest.doMock("../../../utils/errors", () => ({
      AppError: class AppError extends Error {
        constructor(message, statusCode) {
          super(message);
          this.statusCode = statusCode;
        }
      },
    }));
    jest.doMock("../../../controllers/base.controller", () =>
      jest.fn().mockImplementation(() => ({
        sendSuccess,
        logAction,
      }))
    );
    jest.doMock("../../../utils/asyncHandler", () => (fn) => fn);
    jest.doMock("fuse.js", () => jest.fn());
    jest.doMock("../../../services/notification/notification.service", () => ({
      createNotification: jest.fn(),
    }));
    jest.doMock("../../../utils/enums/notification.enum", () => ({
      NotificationType: {},
    }));
    jest.doMock("../../../models/listing/listing.model", () => ({
      countDocuments: listingCountDocuments,
    }));
    jest.doMock("../../../models/order", () => ({
      Order: { countDocuments: orderCountDocuments },
    }));

    return {
      controller: require("../../../controllers/admin/merchant.controller"),
      mocks: { listingCountDocuments, sendSuccess, logAction },
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.dontMock("../../../models/user");
    jest.dontMock("../../../utils/logger");
    jest.dontMock("../../../utils/errors");
    jest.dontMock("../../../controllers/base.controller");
    jest.dontMock("../../../utils/asyncHandler");
    jest.dontMock("fuse.js");
    jest.dontMock("../../../services/notification/notification.service");
    jest.dontMock("../../../utils/enums/notification.enum");
    jest.dontMock("../../../models/listing/listing.model");
    jest.dontMock("../../../models/order");
  });

  it("excludes tombstoned listings from admin merchant detail stats", async () => {
    const { controller, mocks } = loadController();
    const req = { params: { userId } };
    const res = {};

    await controller.handleGetMerchantDetails(req, res);

    expect(mocks.listingCountDocuments).toHaveBeenCalledWith({
      "seller.userId": userId,
      isDeleted: { $ne: true },
    });
    expect(mocks.sendSuccess).toHaveBeenCalled();
  });
});
