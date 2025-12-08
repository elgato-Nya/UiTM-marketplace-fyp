/**
 * Quick script to check listings count
 * Usage: node scripts/check-listings.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing/listing.model");
const config = require("../config/env.config");

async function checkListings() {
  try {
    // Connect to database
    await mongoose.connect(config.database.uri);
    console.log("✓ Connected to MongoDB");

    // Count total listings
    const totalListings = await Listing.countDocuments();
    console.log(`\nTotal listings: ${totalListings}`);

    // Count available listings
    const availableListings = await Listing.countDocuments({
      isAvailable: true,
    });
    console.log(`Available listings: ${availableListings}`);

    // Count unavailable listings
    const unavailableListings = await Listing.countDocuments({
      isAvailable: false,
    });
    console.log(`Unavailable listings: ${unavailableListings}`);

    // Get sample of listings with their isAvailable status
    const sampleListings = await Listing.find()
      .select("title isAvailable category seller")
      .limit(5)
      .lean();

    console.log("\nSample listings:");
    sampleListings.forEach((listing, index) => {
      console.log(
        `${index + 1}. ${listing.title} - Available: ${
          listing.isAvailable
        } - Category: ${listing.category}`
      );
    });

    // Get count by category (available only)
    const byCategory = await Listing.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\nAvailable listings by category:");
    byCategory.forEach((cat) => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkListings();
