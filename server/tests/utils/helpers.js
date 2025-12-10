const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Generate a valid JWT token for testing
 * @param {string} userId - User ID to encode in token
 * @param {object} options - Additional JWT options
 * @returns {string} JWT token
 */
const generateJWT = (userId, options = {}) => {
  const defaultOptions = {
    expiresIn: "1h",
    ...options,
  };

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "test-secret-key",
    defaultOptions
  );
};

/**
 * Create test user data with default values
 * @param {object} overrides - Fields to override default values
 * @returns {object} User data object
 */
const createTestUserData = (overrides = {}) => {
  const timestamp = Date.now();

  const defaultUser = {
    email: `test${timestamp}@uitm.edu.my`,
    password: "Test123456",
    profile: {
      username: `testuser${timestamp}`,
      phoneNumber: "0123456789",
      campus: "Shah Alam",
      faculty: "Computer Science",
      bio: "Test user bio",
    },
    roles: ["user"],
    emailVerification: {
      isVerified: true,
      verifiedAt: new Date(),
    },
    ...overrides,
  };

  // Add merchant data if role includes merchant
  if (defaultUser.roles.includes("merchant")) {
    defaultUser.merchant = {
      shopName: `Test Shop ${timestamp}`,
      description: "Test shop description",
      isVerified: true,
      ...overrides.merchant,
    };
  }

  return defaultUser;
};

/**
 * Create test order data with default values
 * @param {object} overrides - Fields to override default values
 * @returns {object} Order data object
 */
const createTestOrderData = (overrides = {}) => {
  const defaultOrder = {
    buyer: {
      userId: new mongoose.Types.ObjectId(),
      username: "testbuyer",
      email: "buyer@uitm.edu.my",
      phone: "0123456789",
      ...overrides.buyer,
    },
    seller: {
      userId: new mongoose.Types.ObjectId(),
      name: "Test Seller",
      shopName: "Test Shop",
      email: "seller@uitm.edu.my",
      phone: "0123456789",
      ...overrides.seller,
    },
    items: [
      {
        listingId: new mongoose.Types.ObjectId(),
        name: "Test Product Name",
        description: "Test product description",
        price: 100,
        quantity: 1,
        images: ["https://example.com/image.jpg"],
        discount: 0,
        ...(overrides.items && overrides.items[0]),
      },
    ],
    itemsTotal: 100,
    shippingFee: 10,
    totalDiscount: 0,
    totalAmount: 110,
    paymentMethod: "cod",
    paymentStatus: "pending",
    status: "pending",
    deliveryMethod: "campus_delivery",
    deliveryAddress: {
      type: "campus",
      recipientName: "John Doe",
      recipientPhone: "0123456789",
      campusAddress: {
        campus: "Shah Alam",
        building: "Test Building",
        floor: "1",
        room: "101",
      },
      ...overrides.deliveryAddress,
    },
    notes: {
      buyer: "Test buyer note",
      seller: "Test seller note",
    },
    ...overrides,
  };

  // Recalculate total if items changed
  if (overrides.items) {
    const itemsTotal = overrides.items.reduce((total, item) => {
      return total + item.price * item.quantity - (item.discount || 0);
    }, 0);

    defaultOrder.itemsTotal = itemsTotal;
    defaultOrder.totalAmount =
      itemsTotal + defaultOrder.shippingFee - defaultOrder.totalDiscount;
  }

  return defaultOrder;
};

/**
 * Create test listing data with default values
 * @param {object} overrides - Fields to override default values
 * @returns {object} Listing data object
 */
const createTestListingData = (overrides = {}) => {
  const timestamp = Date.now();

  return {
    name: `Test Product ${timestamp}`,
    description: "This is a test product description",
    price: 100,
    category: "electronics",
    type: "product",
    images: ["https://example.com/image1.jpg"],
    seller: {
      userId: new mongoose.Types.ObjectId(),
      username: "testseller",
      shopName: "Test Shop",
      email: "seller@uitm.edu.my",
    },
    availability: {
      isAvailable: true,
      stock: 10,
    },
    location: {
      campus: "Shah Alam",
      meetupPoints: ["Library", "Cafeteria"],
    },
    ...overrides,
  };
};

/**
 * Create multiple test objects
 * @param {number} count - Number of objects to create
 * @param {function} createFn - Function to create individual object
 * @param {object} overrides - Base overrides to apply
 * @returns {array} Array of created objects
 */
const createMultiple = (count, createFn, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createFn({ ...overrides, index })
  );
};

/**
 * Wait for a specified amount of time (for testing async operations)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after timeout
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate random test data
 */
const randomTestData = {
  email: () =>
    `test${Date.now()}${Math.random().toString(36).substr(2, 5)}@uitm.edu.my`,
  username: () => `user${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
  phone: () =>
    `01${Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0")}`,
  price: (min = 1, max = 1000) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  objectId: () => new mongoose.Types.ObjectId(),
  string: (length = 10) => Math.random().toString(36).substr(2, length),
  arrayElement: (array) => array[Math.floor(Math.random() * array.length)],
};

/**
 * Common test expectations and assertions
 */
const expectValidation = {
  toHaveValidationError: (result, field) => {
    expect(result.errors).toBeDefined();
    expect(result.errors[field]).toBeDefined();
  },

  toHaveValidObjectId: (value) => {
    expect(mongoose.Types.ObjectId.isValid(value)).toBe(true);
  },

  toHaveValidEmail: (email) => {
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(email).toMatch(/uitm\.edu\.my$/);
  },

  toHaveValidDate: (date) => {
    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).not.toBeNaN();
  },
};

/**
 * Mock external dependencies for testing
 */
const mockServices = {
  jwt: {
    sign: jest.fn(() => "mock-jwt-token"),
    verify: jest.fn(() => ({ id: "mock-user-id" })),
  },

  bcrypt: {
    hash: jest.fn(() => Promise.resolve("hashed-password")),
    compare: jest.fn(() => Promise.resolve(true)),
  },

  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
};

module.exports = {
  generateJWT,
  createTestUserData,
  createTestOrderData,
  createTestListingData,
  createMultiple,
  wait,
  randomTestData,
  expectValidation,
  mockServices,
};
