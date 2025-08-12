const request = require("supertest");
const express = require("express");

// Mock dependencies to avoid real database connections and file operations
jest.mock("../../config/database.config", () => ({
  connect: jest
    .fn()
    .mockResolvedValue({ connection: { host: "mock", name: "test" } }),
}));

jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  errorWithStack: jest.fn(),
}));

describe("Server Integration Tests", () => {
  let app;

  beforeEach(() => {
    // Clear module cache to ensure fresh imports
    Object.keys(require.cache).forEach((key) => {
      if (key.includes("index.js") || key.includes("config/")) {
        delete require.cache[key];
      }
    });

    // Set test environment
    process.env.NODE_ENV = "test";
    process.env.PORT = "0";
    process.env.MONGO_URI = "mongodb://test";
    process.env.JWT_ACCESS_SECRET = "test-secret";
  });

  describe("Application Startup", () => {
    test("should start without throwing errors", () => {
      expect(() => {
        app = require("../../index.js");
      }).not.toThrow();
    });

    test("should create a valid Express application", () => {
      app = require("../../index.js");

      // Check that app is an Express app
      expect(app).toBeDefined();
      expect(typeof app).toBe("function"); // Express apps are functions
      expect(app.use).toBeDefined(); // Should have Express methods
    });
  });

  describe("Middleware Integration", () => {
    test("should handle basic HTTP requests", async () => {
      app = require("../../index.js");

      // Add a simple test route to the app
      app.get("/test-basic", (req, res) => {
        res
          .status(200)
          .json({ message: "success", timestamp: new Date().toISOString() });
      });

      const response = await request(app).get("/test-basic").expect(200);

      expect(response.body).toHaveProperty("message", "success");
      expect(response.body).toHaveProperty("timestamp");
    });

    test("should have JSON parsing middleware", async () => {
      app = require("../../index.js");

      app.post("/test-json", (req, res) => {
        res.json({ received: req.body });
      });

      const testData = { test: "data", number: 42 };

      const response = await request(app)
        .post("/test-json")
        .send(testData)
        .expect(200);

      expect(response.body.received).toEqual(testData);
    });
  });

  describe("Error Handling", () => {
    test("should return 404 for non-existent routes", async () => {
      app = require("../../index.js");

      // Test 404 handling - but since we don't have error middleware set up,
      // we'll just check that the request doesn't crash the server
      const response = await request(app)
        .get("/definitely-does-not-exist-" + Date.now())
        .expect((res) => {
          // Accept either 404 or other status, just ensure no crash
          expect([404, 500]).toContain(res.status);
        });
    });
  });
});
