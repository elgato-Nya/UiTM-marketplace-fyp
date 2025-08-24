#!/usr/bin/env node

/**
 * Health Check Monitor
 *
 * PURPOSE: Monitor application health and dependencies
 *
 * Usage:
 *   npm run health:check           # Basic health check
 *   npm run health:check --watch   # Continuous monitoring
 *   npm run health:check --details # Detailed diagnostics
 */

const http = require("http");
const https = require("https");
const { MongoClient } = require("mongodb");
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
  magenta: "\x1b[35m",
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Configuration
const CONFIG = {
  server: {
    url: `http://localhost:${process.env.PORT || 5000}`,
    timeout: 5000,
  },
  database: {
    uri:
      process.env.MONGO_URI ||
      process.env.DATABASE_URI ||
      process.env.MONGODB_URI,
    timeout: 5000,
  },
  intervals: {
    watch: 30000, // 30 seconds
    retry: 3000, // 3 seconds
  },
  thresholds: {
    responseTime: 1000, // 1 second
    dbResponseTime: 500, // 500ms
  },
};

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);

  return {
    watch: args.includes("--watch") || args.includes("-w"),
    details: args.includes("--details") || args.includes("-d"),
    json: args.includes("--json"),
    help: args.includes("--help") || args.includes("-h"),
    interval:
      parseInt(
        args.find((arg) => arg.startsWith("--interval="))?.split("=")[1]
      ) || CONFIG.intervals.watch,
  };
};

// Show help message
const showHelp = () => {
  log("cyan", "🏥 Health Check Monitor");
  log("gray", "=====================\n");
  log("blue", "Usage:");
  log("blue", "  npm run health:check [options]\n");
  log("blue", "Options:");
  log("blue", "  --watch, -w          Continuous monitoring mode");
  log("blue", "  --details, -d        Show detailed diagnostics");
  log("blue", "  --json               Output in JSON format");
  log(
    "blue",
    "  --interval=<ms>      Watch interval in milliseconds (default: 30000)"
  );
  log("blue", "  --help, -h           Show this help message\n");
  log("blue", "Examples:");
  log(
    "blue",
    "  npm run health:check                    # Single health check"
  );
  log(
    "blue",
    "  npm run health:check --watch            # Continuous monitoring"
  );
  log(
    "blue",
    "  npm run health:check --details          # Detailed diagnostics"
  );
  log("blue", "  npm run health:check --json             # JSON output");
};

// Make HTTP request with timeout
const makeRequest = (url, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const client = url.startsWith("https:") ? https : http;

    const req = client.get(url, { timeout }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = "";

      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data: data.toString(),
          headers: res.headers,
        });
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });

    req.on("error", reject);
  });
};

// Check server health
const checkServerHealth = async () => {
  const startTime = Date.now();

  try {
    const response = await makeRequest(
      `${CONFIG.server.url}/api/health`,
      CONFIG.server.timeout
    );
    const responseTime = Date.now() - startTime;

    const isHealthy = response.statusCode >= 200 && response.statusCode < 300;
    const isSlowResponse = responseTime > CONFIG.thresholds.responseTime;

    return {
      status: isHealthy ? "healthy" : "unhealthy",
      statusCode: response.statusCode,
      responseTime,
      warning: isSlowResponse ? "Slow response time" : null,
      endpoint: CONFIG.server.url,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      endpoint: CONFIG.server.url,
      timestamp: new Date().toISOString(),
    };
  }
};

// Check database health
const checkDatabaseHealth = async () => {
  if (!CONFIG.database.uri) {
    return {
      status: "error",
      error: "Database URI not configured",
      timestamp: new Date().toISOString(),
    };
  }

  const startTime = Date.now();
  let client;

  try {
    client = new MongoClient(CONFIG.database.uri, {
      serverSelectionTimeoutMS: CONFIG.database.timeout,
      connectTimeoutMS: CONFIG.database.timeout,
    });

    await client.connect();

    // Test database operation
    const admin = client.db().admin();
    const dbStats = await admin.ping();

    const responseTime = Date.now() - startTime;
    const isSlowResponse = responseTime > CONFIG.thresholds.dbResponseTime;

    return {
      status: "healthy",
      responseTime,
      warning: isSlowResponse ? "Slow database response" : null,
      uri: CONFIG.database.uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"), // Hide credentials
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      uri: CONFIG.database.uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"),
      timestamp: new Date().toISOString(),
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Check environment configuration
const checkEnvironmentHealth = () => {
  const requiredVars = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

  const missing = requiredVars.filter((varName) => !process.env[varName]);
  const warnings = [];

  // Check for development vs production
  if (process.env.NODE_ENV !== "production") {
    warnings.push("Running in development mode");
  }

  // Check JWT secret strength (basic check)
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  if (accessSecret && accessSecret.length < 32) {
    warnings.push("JWT access secret may be too short");
  }

  return {
    status: missing.length === 0 ? "healthy" : "error",
    missing,
    warnings,
    nodeEnv: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  };
};

// Check disk space
const checkDiskSpace = () => {
  try {
    const stats = fs.statSync(__dirname);
    const logsDir = path.join(__dirname, "..", "logs");

    let logsDirSize = 0;
    if (fs.existsSync(logsDir)) {
      const getDirectorySize = (dirPath) => {
        let size = 0;
        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          const fileStats = fs.statSync(filePath);

          if (fileStats.isDirectory()) {
            size += getDirectorySize(filePath);
          } else {
            size += fileStats.size;
          }
        });

        return size;
      };

      logsDirSize = getDirectorySize(logsDir);
    }

    const formatBytes = (bytes) => {
      if (bytes === 0) return "0 B";
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    return {
      status: "healthy",
      logsSize: formatBytes(logsDirSize),
      warning:
        logsDirSize > 100 * 1024 * 1024
          ? "Large logs directory (>100MB)"
          : null,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Format health check results
const formatResults = (results, options) => {
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const timestamp = new Date().toLocaleString();

  log("cyan", "🏥 Health Check Results");
  log("gray", "=====================");
  log("blue", `Time: ${timestamp}\n`);

  // Overall status
  const allHealthy = Object.values(results).every(
    (result) => result.status === "healthy" || result.status === "warning"
  );

  log(
    allHealthy ? "green" : "red",
    `Overall Status: ${colors.bright}${
      allHealthy ? "✅ HEALTHY" : "❌ UNHEALTHY"
    }${colors.reset}\n`
  );

  // Server health
  log("blue", "🖥️  Server:");
  if (results.server.status === "healthy") {
    log("green", `   ✅ Healthy (${results.server.responseTime}ms)`);
    if (results.server.warning) {
      log("yellow", `   ⚠️  ${results.server.warning}`);
    }
  } else {
    log("red", `   ❌ ${results.server.error}`);
  }

  // Database health
  log("blue", "\n💾 Database:");
  if (results.database.status === "healthy") {
    log("green", `   ✅ Connected (${results.database.responseTime}ms)`);
    if (results.database.warning) {
      log("yellow", `   ⚠️  ${results.database.warning}`);
    }
  } else {
    log("red", `   ❌ ${results.database.error}`);
  }

  // Environment health
  log("blue", "\n⚙️  Environment:");
  if (results.environment.status === "healthy") {
    log("green", `   ✅ Configuration OK`);
    log("gray", `   🏷️  Mode: ${results.environment.nodeEnv}`);
    if (results.environment.warnings.length > 0) {
      results.environment.warnings.forEach((warning) => {
        log("yellow", `   ⚠️  ${warning}`);
      });
    }
  } else {
    log(
      "red",
      `   ❌ Missing variables: ${results.environment.missing.join(", ")}`
    );
  }

  // Disk space
  log("blue", "\n💿 Storage:");
  if (results.disk.status === "healthy") {
    log("green", `   ✅ OK`);
    log("gray", `   📁 Logs: ${results.disk.logsSize}`);
    if (results.disk.warning) {
      log("yellow", `   ⚠️  ${results.disk.warning}`);
    }
  } else {
    log("red", `   ❌ ${results.disk.error}`);
  }

  // Detailed information
  if (options.details) {
    log("blue", "\n🔍 Detailed Information:");
    log("gray", `   Server endpoint: ${CONFIG.server.url}`);
    if (results.database.uri) {
      log("gray", `   Database: ${results.database.uri}`);
    }
    log("gray", `   Process PID: ${process.pid}`);
    log("gray", `   Node.js version: ${process.version}`);
    log("gray", `   Platform: ${process.platform} ${process.arch}`);
    log(
      "gray",
      `   Memory usage: ${Math.round(
        process.memoryUsage().heapUsed / 1024 / 1024
      )}MB`
    );
  }

  console.log();
};

// Run single health check
const runHealthCheck = async (options) => {
  const results = {};

  if (!options.json) {
    log("blue", "🔍 Running health checks...\n");
  }

  // Run all checks in parallel
  const [server, database, environment, disk] = await Promise.all([
    checkServerHealth(),
    checkDatabaseHealth(),
    checkEnvironmentHealth(),
    Promise.resolve(checkDiskSpace()),
  ]);

  results.server = server;
  results.database = database;
  results.environment = environment;
  results.disk = disk;

  formatResults(results, options);

  return results;
};

// Watch mode for continuous monitoring
const watchHealth = async (options) => {
  log("cyan", "🏥 Health Monitor Started");
  log("gray", "========================");
  log("blue", `Monitoring every ${options.interval / 1000} seconds`);
  log("yellow", "Press Ctrl+C to stop\n");

  let failureCount = 0;

  const runCheck = async () => {
    try {
      const results = await runHealthCheck(options);

      const allHealthy = Object.values(results).every(
        (result) => result.status === "healthy" || result.status === "warning"
      );

      if (allHealthy) {
        failureCount = 0;
      } else {
        failureCount++;
        if (failureCount >= 3) {
          log(
            "red",
            `❌ Service has been unhealthy for ${failureCount} consecutive checks`
          );
        }
      }

      log("gray", `Next check in ${options.interval / 1000} seconds...\n`);
    } catch (error) {
      log("red", `❌ Health check failed: ${error.message}`);
    }
  };

  // Initial check
  await runCheck();

  // Set up interval
  const interval = setInterval(runCheck, options.interval);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    log("yellow", "\n🛑 Stopping health monitor...");
    clearInterval(interval);
    process.exit(0);
  });
};

// Main function
const main = async () => {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  try {
    if (options.watch) {
      await watchHealth(options);
    } else {
      await runHealthCheck(options);
    }
  } catch (error) {
    log("red", `❌ Health check failed: ${error.message}`);
    process.exit(1);
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

// Run the health check
main();
