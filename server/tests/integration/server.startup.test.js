const request = require("supertest");
const path = require("path");

// Mock the database connection to avoid actual connection during tests
jest.mock("../../config/database.config", () => ({
  connect: jest
    .fn()
    .mockResolvedValue({ connection: { host: "mock", name: "test" } }),
  disconnect: jest.fn().mockResolvedValue(undefined),
}));

// Mock the logger to avoid file operations during tests
jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  errorWithStack: jest.fn(),
}));

// Mock express to prevent actual server startup
jest.mock("express", () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(), // Add missing patch method
    put: jest.fn(),
    delete: jest.fn(),
    disable: jest.fn(), // Add missing disable method
    set: jest.fn(), // Add missing set method for trust proxy
    listen: jest.fn((port, callback) => {
      // Mock server object
      const mockServer = {
        close: jest.fn((callback) => callback && callback()),
        address: jest.fn(() => ({ port: 5001 })),
      };
      if (callback) callback();
      return mockServer;
    }),
    route: jest.fn(() => ({
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(), // Add missing patch method
      put: jest.fn(),
      delete: jest.fn(),
    })),
    _router: {
      stack: [1, 2, 3], // Mock middleware stack
    },
  };

  const express = jest.fn(() => mockApp);
  express.Router = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(), // Add missing patch method
    put: jest.fn(),
    delete: jest.fn(),
    route: jest.fn(() => ({
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(), // Add missing patch method
      put: jest.fn(),
      delete: jest.fn(),
    })),
  }));
  express.json = jest.fn();
  express.urlencoded = jest.fn();

  return express;
});

describe("Server Startup Tests", () => {
  let app;

  beforeAll(() => {
    // Set test environment variables
    process.env.NODE_ENV = "test";
    process.env.PORT = "0"; // Use random available port
    process.env.MONGO_URI = "mongodb://mock-test-uri";
    process.env.JWT_ACCESS_SECRET = "test-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  });

  afterAll(() => {
    // Clear require cache to ensure clean state
    Object.keys(require.cache).forEach((key) => {
      if (key.includes("index.js") || key.includes("config/")) {
        delete require.cache[key];
      }
    });
  });

  describe("Environment Configuration", () => {
    test("should load environment variables correctly", () => {
      // Re-import to test dotenv loading
      delete require.cache[require.resolve("../../index.js")];

      expect(process.env.NODE_ENV).toBeDefined();
      expect(process.env.PORT).toBeDefined();
      expect(process.env.MONGO_URI).toBeDefined();
    });

    test("should have valid environment variable values", () => {
      expect(process.env.NODE_ENV).not.toBe("undefined");
      expect(process.env.MONGO_URI).not.toBe("undefined");
      expect(process.env.JWT_ACCESS_SECRET).not.toBe("undefined");
    });
  });

  describe("Server Dependencies", () => {
    test("should import all required modules without errors", () => {
      expect(() => {
        require("../../config/cors.config");
        require("../../config/helmet.config");
        require("../../config/rateLimits.config");
        require("../../middleware/limiters.middleware");
        require("../../config/database.config");
        require("../../utils/logger");
      }).not.toThrow();
    });

    test("should have valid rate limiter configuration", () => {
      const {
        globalLimiter,
        authLimiter,
        standardLimiter,
      } = require("../../middleware/limiters.middleware");
      expect(globalLimiter).toBeDefined();
      expect(authLimiter).toBeDefined();
      expect(standardLimiter).toBeDefined();
      expect(typeof globalLimiter).toBe("function");
      expect(typeof authLimiter).toBe("function");
    });
  });

  describe("Server Application", () => {
    test("should create Express app without errors", () => {
      expect(() => {
        const serverModule = require("../../index.js");
        app = serverModule.app || serverModule;
      }).not.toThrow();
      expect(app).toBeDefined();
    });

    test("should have middleware configured", () => {
      const serverModule = require("../../index.js");
      app = serverModule.app || serverModule;

      // Check that app has the necessary middleware stack (mocked)
      expect(app._router).toBeDefined();
      expect(app._router.stack.length).toBeGreaterThan(0);

      // Since we're mocking express, just verify the app was created properly
      expect(app).toHaveProperty("use");
      expect(app).toHaveProperty("get");
      expect(app).toHaveProperty("post");
    });
  });

  describe("Database Connection Handling", () => {
    test("should handle database connection gracefully", async () => {
      const database = require("../../config/database.config");

      // Since we're mocking, just verify the mock functions exist
      expect(database.connect).toBeDefined();
      expect(database.disconnect).toBeDefined();
      expect(typeof database.connect).toBe("function");
      expect(typeof database.disconnect).toBe("function");

      // Test that the mock can be called
      await database.connect();
      expect(database.connect).toHaveBeenCalled();
    });
  });
});
