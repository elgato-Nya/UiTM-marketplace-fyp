describe("checkout.service cart session guards", () => {
  const userId = "507f1f77bcf86cd799439011";

  const loadCheckoutService = ({ cart }) => {
    jest.resetModules();

    const populate = jest.fn().mockResolvedValue(cart);
    const findOne = jest.fn().mockReturnValue({ populate });
    const createValidationError = jest.fn((message, details, code) => {
      const error = new Error(message);
      error.code = code;
      error.statusCode = 400;
      error.details = details;
      throw error;
    });
    const validateCheckoutItems = jest.fn();

    jest.doMock("../../../models", () => ({
      Cart: { findOne },
      User: {},
      Order: {},
    }));
    jest.doMock("../../../models/checkout/checkoutSession.model", () => ({
      cancelActiveSessionsForUser: jest.fn().mockResolvedValue(0),
    }));
    jest.doMock("../../../services/checkout/checkout.helpers", () => ({
      validateCheckoutItems,
      groupItemsBySeller: jest.fn(),
      calculateCheckoutSummary: jest.fn(),
      reserveStock: jest.fn(),
      releaseStock: jest.fn(),
      validateDeliveryAddress: jest.fn(),
      validateCampusDeliveryForSellers: jest.fn(),
      checkPaymentMethodAllowed: jest.fn(),
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
      convertAddressEnumsToValues: jest.fn((value) => value),
    }));
    jest.doMock("../../../utils/errors", () => ({
      createValidationError,
    }));
    jest.doMock("../../../validators/checkout/checkout.validator", () => ({
      checkoutErrorMessages: {
        cart: { empty: "Cart is empty" },
        items: { unavailable: "Some items are unavailable" },
        listing: { unavailable: "Listing unavailable" },
      },
    }));
    jest.doMock("../../../utils/logger", () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));

    return {
      checkoutService: require("../../../services/checkout/checkout.service"),
      mocks: { findOne, populate, createValidationError, validateCheckoutItems },
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.dontMock("../../../models");
    jest.dontMock("../../../models/checkout/checkoutSession.model");
    jest.dontMock("../../../services/checkout/checkout.helpers");
    jest.dontMock("../../../services/base.service");
    jest.dontMock("../../../utils/errors");
    jest.dontMock("../../../validators/checkout/checkout.validator");
    jest.dontMock("../../../utils/logger");
  });

  it("returns a controlled validation error when a populated cart item listing is null", async () => {
    const { checkoutService, mocks } = loadCheckoutService({
      cart: {
        items: [{ listing: null, quantity: 1, variantId: null }],
      },
    });

    await expect(checkoutService.createCartCheckoutSession(userId)).rejects.toMatchObject({
      code: "CART_VALIDATION_FAILED",
      statusCode: 400,
    });

    expect(mocks.validateCheckoutItems).not.toHaveBeenCalled();
    expect(mocks.createValidationError).toHaveBeenCalledWith(
      "Some items are unavailable",
      expect.objectContaining({
        errors: [
          "One or more listings in your cart are no longer available. Please remove them and try again.",
        ],
      }),
      "CART_VALIDATION_FAILED"
    );
  });
});
