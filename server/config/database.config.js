const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Database Connection Manager
 * Uses CLASS because it:
 * - Manages connection state
 * - Has multiple related methods
 * - Needs to track connection status
 */

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
  }

  // Method to connect to database
  async connect() {
    try {
      // Disable mongoose command buffering so operations fail fast when
      // there is no active connection. This prevents long "buffering timed out"
      // errors and surfaces connection problems immediately.
      mongoose.set("bufferCommands", false);
      // Use recommended connection options and a short server selection
      // timeout so failed connections return quickly in development.
      const connectOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      };
      this.connectionAttempts++;
      logger.database("Attempting MongoDB connection", {
        attempt: this.connectionAttempts,
        uri: this.sanitizeUri(process.env.MONGO_URI),
      });

      const conn = await mongoose.connect(
        process.env.MONGO_URI,
        connectOptions
      );

      this.isConnected = true;
      this.setupEventListeners();

      logger.database("MongoDB connected successfully", {
        host: conn.connection.host,
        database: conn.connection.name,
        attempt: this.connectionAttempts,
      });

      return conn;
    } catch (error) {
      logger.errorWithStack(error, {
        action: "connecting_to_mongodb",
        attempt: this.connectionAttempts,
        maxRetries: this.maxRetries,
      });

      if (this.connectionAttempts < this.maxRetries) {
        logger.warn(
          `Retrying connection in 5 seconds (${this.connectionAttempts}/${this.maxRetries})`
        );
        await this.delay(5000);
        return this.connect();
      }

      throw error;
    }
  }

  // Method to get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      attempts: this.connectionAttempts,
    };
  }

  // Method to close connection gracefully
  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.database("MongoDB disconnected gracefully");
    } catch (error) {
      logger.errorWithStack(error, { context: "database_disconnect" });
      throw error;
    }
  }

  // Private method to setup event listeners
  setupEventListeners() {
    mongoose.connection.on("connected", () => {
      logger.database("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB");
      this.isConnected = false;
    });
  }

  // Private helper methods
  sanitizeUri(uri) {
    return uri ? uri.replace(/\/\/.*@/, "//***:***@") : "undefined";
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export a single instance (Singleton pattern)
module.exports = new DatabaseManager();
