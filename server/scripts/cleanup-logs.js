#!/usr/bin/env node

/**
 * Log Cleanup Script
 *
 * PURPOSE: Clean up old log files to save disk space
 *
 * Usage:
 *   npm run logs:cleanup           # Clean logs older than 30 days
 *   npm run logs:cleanup 7         # Clean logs older than 7 days
 *   npm run logs:cleanup --dry-run # Show what would be deleted
 */

const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Configuration
const LOG_DIR = path.join(__dirname, "..", "logs");
const DEFAULT_RETENTION_DAYS = 30;

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);

  return {
    retentionDays:
      parseInt(args.find((arg) => !isNaN(arg) && !arg.startsWith("--"))) ||
      DEFAULT_RETENTION_DAYS,
    dryRun: args.includes("--dry-run"),
    verbose: args.includes("--verbose") || args.includes("-v"),
    help: args.includes("--help") || args.includes("-h"),
  };
};

// Show help message
const showHelp = () => {
  log("cyan", "🧹 Log Cleanup Script");
  log("gray", "====================\n");
  log("blue", "Usage:");
  log("blue", "  npm run logs:cleanup [days] [options]\n");
  log("blue", "Arguments:");
  log(
    "blue",
    "  days              Number of days to retain logs (default: 30)\n"
  );
  log("blue", "Options:");
  log(
    "blue",
    "  --dry-run         Show what would be deleted without deleting"
  );
  log("blue", "  --verbose, -v     Show detailed information");
  log("blue", "  --help, -h        Show this help message\n");
  log("blue", "Examples:");
  log(
    "blue",
    "  npm run logs:cleanup              # Clean logs older than 30 days"
  );
  log(
    "blue",
    "  npm run logs:cleanup 7            # Clean logs older than 7 days"
  );
  log(
    "blue",
    "  npm run logs:cleanup --dry-run    # Preview what would be deleted"
  );
};

// Get directory size in bytes
const getDirectorySize = (dirPath) => {
  if (!fs.existsSync(dirPath)) return 0;

  let size = 0;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  });

  return size;
};

// Format bytes to human readable format
const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Check if directory is old enough to delete
const isOldDirectory = (dirName, retentionDays) => {
  // Check if directory name is a date (YYYY-MM-DD format)
  const dateMatch = dirName.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!dateMatch) return false;

  const dirDate = new Date(dirName);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  return dirDate < cutoffDate;
};

// Delete directory recursively
const deleteDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      deleteDirectory(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  });

  fs.rmdirSync(dirPath);
};

// Main cleanup function
const cleanupLogs = async () => {
  const { retentionDays, dryRun, verbose, help } = parseArgs();

  if (help) {
    showHelp();
    return;
  }

  log("cyan", "🧹 Log Cleanup Script");
  log("gray", "====================\n");

  log(
    "blue",
    `Retention period: ${colors.bright}${retentionDays} days${colors.reset}`
  );
  log(
    "blue",
    `Mode: ${colors.bright}${dryRun ? "DRY RUN" : "ACTUAL CLEANUP"}${
      colors.reset
    }`
  );
  log("blue", `Log directory: ${colors.gray}${LOG_DIR}${colors.reset}\n`);

  // Check if logs directory exists
  if (!fs.existsSync(LOG_DIR)) {
    log("yellow", "⚠️  Logs directory does not exist");
    log("gray", `   Expected: ${LOG_DIR}`);
    return;
  }

  // Get initial directory size
  const initialSize = getDirectorySize(LOG_DIR);
  log("blue", `Current logs size: ${formatBytes(initialSize)}\n`);

  // Get all subdirectories
  const items = fs.readdirSync(LOG_DIR);
  const logDirectories = items.filter((item) => {
    const itemPath = path.join(LOG_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });

  if (logDirectories.length === 0) {
    log("yellow", "⚠️  No log directories found");
    return;
  }

  // Find directories to clean up
  const directoriesToDelete = logDirectories.filter((dir) =>
    isOldDirectory(dir, retentionDays)
  );

  if (directoriesToDelete.length === 0) {
    log("green", "✅ No old log directories found");
    log(
      "blue",
      `   All directories are within ${retentionDays} days retention period`
    );
    return;
  }

  log(
    "cyan",
    `📁 Found ${directoriesToDelete.length} directories to ${
      dryRun ? "review" : "delete"
    }:\n`
  );

  let totalSizeToDelete = 0;
  let deletedCount = 0;

  // Process each directory
  for (const dirName of directoriesToDelete) {
    const dirPath = path.join(LOG_DIR, dirName);
    const dirSize = getDirectorySize(dirPath);
    totalSizeToDelete += dirSize;

    const dirDate = new Date(dirName);
    const daysOld = Math.floor((new Date() - dirDate) / (1000 * 60 * 60 * 24));

    log(
      "yellow",
      `📂 ${dirName} (${daysOld} days old, ${formatBytes(dirSize)})`
    );

    if (verbose) {
      // List files in directory
      try {
        const files = fs.readdirSync(dirPath);
        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          const fileSize = fs.statSync(filePath).size;
          log("gray", `   📄 ${file} (${formatBytes(fileSize)})`);
        });
      } catch (error) {
        log("red", `   ❌ Error reading directory: ${error.message}`);
      }
    }

    if (!dryRun) {
      try {
        deleteDirectory(dirPath);
        log("green", `   ✅ Deleted`);
        deletedCount++;
      } catch (error) {
        log("red", `   ❌ Error deleting: ${error.message}`);
      }
    } else {
      log("blue", `   👁️  Would be deleted`);
    }

    console.log();
  }

  // Summary
  log("cyan", "📊 Summary");
  log("gray", "===========");

  if (dryRun) {
    log(
      "blue",
      `Directories that would be deleted: ${directoriesToDelete.length}`
    );
    log("blue", `Space that would be freed: ${formatBytes(totalSizeToDelete)}`);
    log("yellow", "\n💡 Run without --dry-run to actually delete the files");
  } else {
    log(
      "green",
      `Directories deleted: ${deletedCount}/${directoriesToDelete.length}`
    );
    log("green", `Space freed: ${formatBytes(totalSizeToDelete)}`);

    const finalSize = getDirectorySize(LOG_DIR);
    const spaceFreed = initialSize - finalSize;
    log("blue", `New logs size: ${formatBytes(finalSize)}`);

    if (spaceFreed > 0) {
      log(
        "green",
        `\n🎉 Successfully freed ${formatBytes(spaceFreed)} of disk space!`
      );
    }
  }
};

// Handle errors
process.on("uncaughtException", (error) => {
  log("red", `❌ Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log("red", `❌ Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run cleanup
cleanupLogs().catch((error) => {
  log("red", `❌ Cleanup failed: ${error.message}`);
  process.exit(1);
});
