/**
 * migrate-chat-index.js
 *
 * PURPOSE: Drop the old per-listing unique index on conversations
 * and let the updated schema recreate the correct non-unique index.
 *
 * CONTEXT: The original Conversation model had:
 *   { "participants.userId": 1, listing: 1 } (unique: true)
 * which caused separate conversations per listing between the same
 * user pair. The new schema uses:
 *   { "participants.userId": 1 } (unique: false)
 *
 * USAGE: node server/scripts/migrate-chat-index.js
 */

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const mongoose = require("mongoose");
const database = require("../config/database.config");

const INDEX_NAME = "participants.userId_1_listing_1";
const COLLECTION = "conversations";

async function migrateChatIndex() {
  try {
    await database.connect();
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection(COLLECTION);

    // List existing indexes
    const indexes = await collection.indexes();
    const oldIndex = indexes.find((idx) => idx.name === INDEX_NAME);

    if (oldIndex) {
      console.log(`Found old index: ${INDEX_NAME}`);
      console.log("  Keys:", JSON.stringify(oldIndex.key));
      console.log("  Unique:", oldIndex.unique ?? false);
      console.log("Dropping...");

      await collection.dropIndex(INDEX_NAME);
      console.log(`✅ Successfully dropped index: ${INDEX_NAME}`);
    } else {
      console.log(
        `Index "${INDEX_NAME}" not found — it may have already been dropped.`,
      );
    }

    // List remaining indexes for confirmation
    const remaining = await collection.indexes();
    console.log(
      "\nCurrent indexes on conversations:",
      remaining.map((i) => `${i.name} (${JSON.stringify(i.key)})`),
    );
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

migrateChatIndex();
