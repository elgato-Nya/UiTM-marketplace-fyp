/**
 * Jest environment setup file
 * This file runs before all test files
 */

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "5001"; // Use different port for testing
process.env.MONGO_URI = "mongodb://localhost:27017/ecommerce_test";

// Suppress console.log during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  console.log = jest.fn();
  console.info = jest.fn();
}
