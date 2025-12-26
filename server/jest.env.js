/**
 * Jest environment setup file
 * This file runs before all test files
 */

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "5001"; // Use different port for testing
process.env.MONGO_URI = "mongodb://localhost:27017/ecommerce_test";

// Mock AWS credentials for tests
process.env.AWS_ACCESS_KEY_ID = "test-access-key-id";
process.env.AWS_SECRET_ACCESS_KEY = "test-secret-access-key";
process.env.AWS_REGION = "ap-southeast-1";
process.env.AWS_S3_BUCKET_NAME = "test-bucket";

// Mock JWT secrets for tests
process.env.JWT_ACCESS_SECRET =
  "test-jwt-access-secret-min-64-chars-for-testing-purposes-only";
process.env.JWT_REFRESH_SECRET =
  "test-jwt-refresh-secret-min-64-chars-for-testing-purposes-only";

// Mock email service
process.env.CLIENT_URL = "http://localhost:3000";
process.env.SES_FROM_EMAIL = "test@example.com";

// Suppress console.log during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  console.log = jest.fn();
  console.info = jest.fn();
}
