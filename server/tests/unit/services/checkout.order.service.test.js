describe("checkout.order.service tombstone safety", () => {
  const sessionId = "507f1f77bcf86cd799439011";
  const userId = "507f1f77bcf86cd799439012";
  const listingId = "507f1f77bcf86cd799439013";
  const sellerId = "507f1f77bcf86cd799439014";

  const createSessionQuery = (value) => ({
    session: jest.fn().mockResolvedValue(value),
  });

  const createSelectQuery = (value) => ({
    select: jest.fn().mockReturnValue({
      session: jest.fn().mockResolvedValue(value),
    }),
  });

  const loadCheckoutOrderService = ({ listingDoc, updateResult = { modifiedCount: 1 } }) => {
    jest.resetModules();

    const mongoSession = {
      withTransaction: jest.fn(async (callback) => callback()),
      endSession: jest.fn().mockResolvedValue(undefined),
    };
    const startSession = jest.fn().mockResolvedValue(mongoSession);
    const createValidationError = jest.fn((message, details, code) => {
      const error = new Error(message);
      error.code = code;
      error.statusCode = 400;
      error.details = details;
      throw error;
    });

    const checkoutSessionDoc = {
      _id: sessionId,
      userId,
      isExpired: false,
      status: "pending",
      checkoutSessionKey: "checkout-key",
      deliveryMethod: "delivery",
      deliveryAddress: { label: "Hostel" },
      paymentMethod: "cod",
      items: [{ listingId, quantity: 1, variantId: null }],
      sellerGroups: [],
      pricing: {},
      markCompleted(orderIds) {
        this.status = "completed";
        this.createdOrders = orderIds;
      },
      save: jest.fn().mockResolvedValue(undefined),
    };

    const CheckoutSession = {
      findOne: jest.fn().mockReturnValue(createSessionQuery(checkoutSessionDoc)),
      findOneAndUpdate: jest.fn().mockResolvedValue(checkoutSessionDoc),
      findById: jest.fn().mockResolvedValue({ sessionType: "direct" }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const validateCheckoutItems = jest.fn().mockResolvedValue({
      valid: true,
      validatedItems: [
        {
          listingId,
          name: "Product",
          price: 10,
          quantity: 1,
          type: "product",
          stock: 5,
          images: [],
          sellerId,
          sellerName: "seller",
          itemTotal: 10,
        },
      ],
      errors: [],
    });

    const groupItemsBySeller = jest.fn().mockResolvedValue([
      {
        sellerId,
        items: [{ listingId, name: "Product", price: 10, quantity: 1 }],
        subtotal: 10,
        deliveryFee: 0,
        totalAmount: 10,
      },
    ]);

    const calculateCheckoutSummary = jest.fn().mockReturnValue({ totalAmount: 10 });
    const listingFindById = jest.fn().mockReturnValue(createSessionQuery(listingDoc));
    const updateOne = jest.fn().mockResolvedValue(updateResult);

    const Order = jest.fn().mockImplementation(function Order(data) {
      Object.assign(this, data);
      this._id = "order-1";
      this.save = jest.fn().mockResolvedValue(this);
    });
    Order.find = jest.fn().mockResolvedValue([]);

    jest.doMock("mongoose", () => ({
      startSession,
    }));
    jest.doMock("../../../models", () => ({
      User: {
        findById: jest
          .fn()
          .mockImplementationOnce(() =>
            createSelectQuery({
              _id: userId,
              email: "buyer@example.com",
              profile: { username: "buyer", phoneNumber: "0123456789" },
              roles: ["buyer"],
            })
          )
          .mockImplementationOnce(() =>
            createSelectQuery({
              _id: sellerId,
              email: "seller@example.com",
              profile: { username: "seller", phoneNumber: "0123456788" },
              roles: ["merchant"],
              merchantDetails: { shopName: "Seller Shop" },
            })
          ),
      },
      Cart: {},
      Order,
    }));
    jest.doMock("../../../models/listing/listing.model", () => ({
      findById: listingFindById,
      updateOne,
    }));
    jest.doMock("../../../models/checkout", () => ({
      CheckoutSession,
    }));
    jest.doMock("../../../services/checkout/checkout.helpers", () => ({
      validateCheckoutItems,
      groupItemsBySeller,
      calculateCheckoutSummary,
    }));
    jest.doMock("../../../services/base.service", () => ({
      handleServiceError: jest.fn((error) => {
        throw error;
      }),
      handleNotFoundError: jest.fn((entity, code) => {
        const error = new Error(`${entity} not found`);
        error.code = code;
        error.statusCode = 404;
        throw error;
      }),
    }));
    jest.doMock("../../../utils/errors", () => ({
      createValidationError,
    }));
    jest.doMock("../../../utils/logger", () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));
    jest.doMock("../../../config/stripe.config", () => ({
      getStripe: jest.fn(),
      isStripeReady: jest.fn().mockReturnValue(false),
    }));

    return {
      checkoutOrderService: require("../../../services/checkout/checkout.order.service"),
      mocks: {
        startSession,
        mongoSession,
        CheckoutSession,
        validateCheckoutItems,
        groupItemsBySeller,
        calculateCheckoutSummary,
        listingFindById,
        updateOne,
        createValidationError,
        Order,
      },
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.dontMock("mongoose");
    jest.dontMock("../../../models");
    jest.dontMock("../../../models/listing/listing.model");
    jest.dontMock("../../../models/checkout");
    jest.dontMock("../../../services/checkout/checkout.helpers");
    jest.dontMock("../../../services/base.service");
    jest.dontMock("../../../utils/errors");
    jest.dontMock("../../../utils/logger");
    jest.dontMock("../../../config/stripe.config");
  });

  it("rejects deleted listings during final checkout confirmation", async () => {
    const { checkoutOrderService, mocks } = loadCheckoutOrderService({
      listingDoc: {
        _id: listingId,
        isDeleted: true,
        isAvailable: true,
        type: "product",
        description: "Deleted listing",
        images: [],
      },
    });

    await expect(
      checkoutOrderService.confirmCheckoutAndCreateOrders(sessionId, userId, "checkout-key")
    ).rejects.toMatchObject({
      code: "LISTING_DELETED",
      statusCode: 400,
    });

    expect(mocks.updateOne).not.toHaveBeenCalled();
  });

  it("still confirms normal active listings and guards stock updates against deleted listings", async () => {
    const { checkoutOrderService, mocks } = loadCheckoutOrderService({
      listingDoc: {
        _id: listingId,
        isDeleted: false,
        isAvailable: true,
        type: "product",
        description: "Active listing",
        images: ["image.jpg"],
      },
    });

    const result = await checkoutOrderService.confirmCheckoutAndCreateOrders(
      sessionId,
      userId,
      "checkout-key"
    );

    expect(result).toMatchObject({
      success: true,
      orderIds: ["order-1"],
    });
    expect(mocks.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: listingId,
        isDeleted: { $ne: true },
        isAvailable: true,
      }),
      { $inc: { stock: -1 } },
      expect.any(Object)
    );
  });
});
