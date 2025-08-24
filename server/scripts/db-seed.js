#!/usr/bin/env node

/**
 * Database Seeder Script
 *
 * PURPOSE: Populate database with sample data for development and testing
 *
 * Usage:
 *   npm run db:seed              # Seed all data
 *   npm run db:seed users        # Seed only users
 *   npm run db:seed products     # Seed only products
 *   npm run db:seed --clear      # Clear all data first
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { User } = require("../models/user");
const logger = require("../utils/logger");

// Sample data
const sampleUsers = [
  {
    email: "admin@student.uitm.edu.my",
    password: "AdminPass123!",
    profile: {
      username: "admin_user",
      phoneNumber: "0123456789",
      bio: "System Administrator",
      campus: "UiTM Shah Alam",
      faculty: "Fakulti Sains Komputer dan Matematik",
    },
    role: ["admin", "consumer"],
  },
  {
    email: "merchant1@student.uitm.edu.my",
    password: "MerchantPass123!",
    profile: {
      username: "tech_merchant",
      phoneNumber: "0198765432",
      bio: "Technology products seller",
      campus: "UiTM Shah Alam",
      faculty: "Fakulti Kejuruteraan Elektrik",
    },
    role: ["merchant", "consumer"],
    merchantDetails: {
      shopName: "TechHub Store",
      shopDescription: "Your one-stop tech solution",
      shopSlug: "techhub-store",
      businessType: "retail",
      isVerified: true,
      shopStatus: "active",
    },
  },
  {
    email: "consumer1@student.uitm.edu.my",
    password: "ConsumerPass123!",
    profile: {
      username: "student_buyer",
      phoneNumber: "0187654321",
      bio: "Computer Science student",
      campus: "UiTM Puncak Alam",
      faculty: "Fakulti Sains Komputer dan Matematik",
    },
    role: ["consumer"],
  },
  {
    email: "consumer2@student.uitm.edu.my",
    password: "ConsumerPass123!",
    profile: {
      username: "engineering_student",
      phoneNumber: "0176543210",
      bio: "Electrical Engineering student",
      campus: "UiTM Shah Alam",
      faculty: "Fakulti Kejuruteraan Elektrik",
    },
    role: ["consumer"],
  },
];

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log("green", "✅ Connected to MongoDB");
  } catch (error) {
    log("red", `❌ Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    log("yellow", "🗑️  Cleared existing data");
  } catch (error) {
    log("red", `❌ Error clearing data: ${error.message}`);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  try {
    log("blue", "👥 Seeding users...");

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        log("yellow", `⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      log(
        "green",
        `✅ Created user: ${userData.email} (${userData.role.join(", ")})`
      );
    }

    log("green", `✅ Successfully seeded ${sampleUsers.length} users`);
  } catch (error) {
    log("red", `❌ Error seeding users: ${error.message}`);
    throw error;
  }
};

// Main seeder function
const runSeeder = async () => {
  const args = process.argv.slice(2);
  const shouldClear = args.includes("--clear");
  const seedType = args.find((arg) => !arg.startsWith("--"));

  try {
    await connectDB();

    log("cyan", "🌱 Starting database seeder...");

    if (shouldClear) {
      await clearData();
    }

    if (!seedType || seedType === "users") {
      await seedUsers();
    }

    // Add more seed types here as needed
    // if (!seedType || seedType === 'products') {
    //   await seedProducts();
    // }

    log("green", "🎉 Database seeding completed successfully!");

    // Display created accounts
    log("cyan", "\n📋 Test Accounts Created:");
    sampleUsers.forEach((user) => {
      log("blue", `   Email: ${user.email}`);
      log("blue", `   Password: ${user.password}`);
      log("blue", `   Role: ${user.role.join(", ")}`);
      log("blue", "   ---");
    });
  } catch (error) {
    log("red", `❌ Seeding failed: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log("yellow", "📡 Database connection closed");
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  log("yellow", "\n🛑 Received SIGINT, shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

// Run the seeder
runSeeder();
