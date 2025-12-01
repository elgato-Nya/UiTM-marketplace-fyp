const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

/**
 * Setup test database using MongoDB Memory Server
 * This creates an in-memory MongoDB instance for testing
 */
const setupTestDB = () => {
  // Connect to the in-memory database before running any tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  // Clean up database connections after all tests are done
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Clear all test data after each test
  beforeEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });
};

/**
 * Clean up function to ensure proper test isolation
 */
const cleanupTestDB = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

module.exports = {
  setupTestDB,
  cleanupTestDB,
};
