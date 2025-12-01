const { OrderValidator } = require("../../../validators/order/order.validator");

describe("Order Validator - Unit Tests", () => {
  describe("isValidOrderNumber", () => {
    it("should accept valid order numbers", () => {
      const validNumbers = [
        "ORD-20250129-ABC123",
        "ORD-20241225-XYZ789",
        "ORD-20230101-123ABC",
        "ORD-20220630-999ZZZ",
      ];

      validNumbers.forEach((num) => {
        expect(OrderValidator.isValidOrderNumber(num)).toBe(true);
      });
    });

    it("should reject invalid order numbers", () => {
      const invalidNumbers = [
        "ORDER-20250129-ABC123", // Wrong prefix
        "ORD-2025129-ABC123", // Wrong date format (7 digits)
        "ORD-20250129-ABC1234", // Wrong suffix length (7 chars)
        "ORD-20250129-ABC12", // Wrong suffix length (5 chars)
        "ORD-20250229-ABC123", // Invalid date (Feb 29 non-leap year)
        "ORD-20251301-ABC123", // Invalid month
        "ORD-20250132-ABC123", // Invalid day
        "ord-20250129-abc123", // Lowercase
        "ORD-20250129-abc123", // Lowercase suffix
        null,
        undefined,
        "",
        123,
        "random string",
      ];

      invalidNumbers.forEach((num) => {
        expect(OrderValidator.isValidOrderNumber(num)).toBe(false);
      });
    });

    it("should reject future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateStr = futureDate
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      const futureOrderNumber = `ORD-${futureDateStr}-ABC123`;

      expect(OrderValidator.isValidOrderNumber(futureOrderNumber)).toBe(false);
    });

    it("should accept today's date", () => {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const todayOrderNumber = `ORD-${todayStr}-ABC123`;

      expect(OrderValidator.isValidOrderNumber(todayOrderNumber)).toBe(true);
    });
  });

  describe("isValidAmounts", () => {
    it("should validate correct amount calculations", () => {
      const validCalculations = [
        [100, 10, 5, 105], // Basic calculation
        [50, 0, 0, 50], // No shipping, no discount
        [200, 25, 50, 175], // With shipping and discount
        [0, 10, 0, 10], // Zero items total
        [100, 10, 110, 0], // Discount equals items + shipping
      ];

      validCalculations.forEach(([items, shipping, discount, total]) => {
        expect(
          OrderValidator.isValidAmounts(items, shipping, discount, total)
        ).toBe(true);
      });
    });

    it("should reject incorrect calculations", () => {
      const invalidCalculations = [
        [100, 10, 5, 100], // Wrong total
        [100, 10, 5, 120], // Total too high
        [100, 10, 5, 90], // Total too low
        [50, 10, 0, 65], // Wrong total
      ];

      invalidCalculations.forEach(([items, shipping, discount, total]) => {
        expect(
          OrderValidator.isValidAmounts(items, shipping, discount, total)
        ).toBe(false);
      });
    });

    it("should handle floating point precision correctly", () => {
      // Common floating point precision issues
      expect(OrderValidator.isValidAmounts(99.99, 10.01, 5.0, 105.0)).toBe(
        true
      );
      expect(OrderValidator.isValidAmounts(33.33, 6.67, 0, 40.0)).toBe(true);
      expect(OrderValidator.isValidAmounts(19.99, 5.99, 2.5, 23.48)).toBe(true);
    });

    it("should handle edge cases", () => {
      // Very small amounts
      expect(OrderValidator.isValidAmounts(0.01, 0.01, 0, 0.02)).toBe(true);

      // Large amounts
      expect(
        OrderValidator.isValidAmounts(9999.99, 100.01, 50.0, 10050.0)
      ).toBe(true);
    });
  });

  describe("isValidStatusTransition", () => {
    it("should allow valid forward transitions", () => {
      const validTransitions = [
        ["pending", "confirmed"],
        ["confirmed", "processing"],
        ["processing", "shipped"],
        ["shipped", "delivered"],
        ["delivered", "completed"],
      ];

      validTransitions.forEach(([from, to]) => {
        expect(OrderValidator.isValidStatusTransition(from, to)).toBe(true);
      });
    });

    it("should allow cancellation from appropriate states", () => {
      const cancellationTransitions = [
        ["pending", "cancelled"],
        ["confirmed", "cancelled"],
        ["processing", "cancelled"],
      ];

      cancellationTransitions.forEach(([from, to]) => {
        expect(OrderValidator.isValidStatusTransition(from, to)).toBe(true);
      });
    });

    it("should reject invalid transitions", () => {
      const invalidTransitions = [
        ["pending", "delivered"], // Skip states
        ["pending", "shipped"], // Skip states
        ["confirmed", "delivered"], // Skip states
        ["completed", "pending"], // Backwards
        ["cancelled", "confirmed"], // From final state
        ["refunded", "pending"], // From final state
        ["delivered", "cancelled"], // Too late to cancel
        ["completed", "cancelled"], // Too late to cancel
        ["shipped", "confirmed"], // Backwards
      ];

      invalidTransitions.forEach(([from, to]) => {
        expect(OrderValidator.isValidStatusTransition(from, to)).toBe(false);
      });
    });

    it("should reject transitions from final states", () => {
      const finalStates = ["completed", "cancelled", "refunded"];
      const anyStatus = "pending";

      finalStates.forEach((finalState) => {
        expect(
          OrderValidator.isValidStatusTransition(finalState, anyStatus)
        ).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      // Invalid status names
      expect(OrderValidator.isValidStatusTransition("invalid", "pending")).toBe(
        false
      );
      expect(OrderValidator.isValidStatusTransition("pending", "invalid")).toBe(
        false
      );

      // Null/undefined
      expect(OrderValidator.isValidStatusTransition(null, "pending")).toBe(
        false
      );
      expect(OrderValidator.isValidStatusTransition("pending", null)).toBe(
        false
      );
      expect(OrderValidator.isValidStatusTransition(undefined, undefined)).toBe(
        false
      );

      // Same status
      expect(OrderValidator.isValidStatusTransition("pending", "pending")).toBe(
        false
      );
    });
  });

  describe("isValidOrderItems", () => {
    it("should accept valid order items", () => {
      const validItems = [
        [
          {
            listingId: "507f1f77bcf86cd799439011",
            quantity: 1,
            price: 100,
            discount: 0,
          },
        ],
        [
          {
            listingId: "507f1f77bcf86cd799439011",
            quantity: 2,
            price: 50,
            discount: 10,
          },
        ],
        [
          {
            listingId: "507f1f77bcf86cd799439011",
            quantity: 1,
            price: 100,
            discount: 0,
          },
          {
            listingId: "507f191e810c19729de860ea",
            quantity: 3,
            price: 25,
            discount: 5,
          },
        ],
      ];

      validItems.forEach((items) => {
        expect(OrderValidator.isValidOrderItems(items)).toBe(true);
      });
    });

    it("should reject invalid order items", () => {
      const invalidItems = [
        null, // Null
        undefined, // Undefined
        "not an array", // Not array
        [], // Empty array
        [{}], // Missing required fields
        [
          {
            listingId: "valid",
            quantity: 0, // Zero quantity
            price: 100,
            discount: 0,
          },
        ],
        [
          {
            listingId: "valid",
            quantity: 1,
            price: -50, // Negative price
            discount: 0,
          },
        ],
        [
          {
            listingId: "valid",
            quantity: 1,
            price: 100,
            discount: -10, // Negative discount
          },
        ],
        [
          {
            listingId: "valid",
            quantity: 1,
            price: 50,
            discount: 100, // Discount > price
          },
        ],
      ];

      invalidItems.forEach((items) => {
        expect(OrderValidator.isValidOrderItems(items)).toBe(false);
      });
    });
  });

  describe("isValidPaymentMethod", () => {
    it("should accept valid payment methods", () => {
      const validMethods = ["cod", "bank_transfer", "e_wallet", "credit_card"];

      validMethods.forEach((method) => {
        expect(OrderValidator.isValidPaymentMethod(method)).toBe(true);
      });
    });

    it("should reject invalid payment methods", () => {
      const invalidMethods = [
        "cash",
        "bitcoin",
        "paypal",
        "COD", // Case sensitive
        "BANK_TRANSFER", // Case sensitive
        null,
        undefined,
        "",
        123,
      ];

      invalidMethods.forEach((method) => {
        expect(OrderValidator.isValidPaymentMethod(method)).toBe(false);
      });
    });
  });

  describe("isValidDeliveryDetails", () => {
    it("should validate campus delivery details", () => {
      const validCampusDelivery = {
        type: "campus",
        recipientName: "John Doe",
        recipientPhone: "0123456789",
        campusAddress: {
          campus: "SHAH_ALAM", // Use enum key
          building: "Test Building",
          floor: "1",
          room: "101",
        },
      };

      expect(
        OrderValidator.isValidDeliveryDetails(
          "campus_delivery",
          validCampusDelivery
        )
      ).toBe(true);
    });

    it("should validate personal delivery details", () => {
      const validPersonalDelivery = {
        type: "personal",
        recipientName: "John Doe",
        recipientPhone: "0123456789",
        personalAddress: {
          addressLine1: "123 Main St",
          city: "Kuala Lumpur",
          state: "Selangor",
          postcode: "40000",
        },
      };

      expect(
        OrderValidator.isValidDeliveryDetails("delivery", validPersonalDelivery)
      ).toBe(true);
    });

    it("should validate pickup details", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Set to tomorrow

      const validPickupDetails = {
        type: "pickup",
        recipientName: "John Doe",
        recipientPhone: "0123456789",
        pickupDetails: {
          location: "Main Gate",
          specialInstructions: "Wait by the security post",
          pickupTime: futureDate,
        },
      };

      expect(
        OrderValidator.isValidDeliveryDetails("self_pickup", validPickupDetails)
      ).toBe(true);
    });

    it("should reject invalid delivery method", () => {
      const deliveryDetails = {
        type: "campus",
        recipientName: "John Doe",
      };

      expect(
        OrderValidator.isValidDeliveryDetails("invalid_method", deliveryDetails)
      ).toBe(false);
    });

    it("should handle null/undefined inputs", () => {
      expect(OrderValidator.isValidDeliveryDetails(null, {})).toBe(false);
      expect(
        OrderValidator.isValidDeliveryDetails("campus_delivery", null)
      ).toBe(false);
      expect(OrderValidator.isValidDeliveryDetails(undefined, undefined)).toBe(
        false
      );
    });
  });
});
