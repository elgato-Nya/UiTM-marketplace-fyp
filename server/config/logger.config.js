const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

/**
 * Winston Logger Configuration
 * Industrial standard logging with file rotation and structured logging
 * Features:
 * - Colored console output with optional JSON format
 * - JSON object keys with color highlighting
 * - Daily log rotation with size limits
 * - Automatic cleanup of old log directories on startup
 * - Environment variables:
 *   - CONSOLE_JSON=true: Enable colored JSON format for console
 *   - ENABLE_FILE_LOGGING=true: Enable file logging in non-production
 */

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "gray",
};

// Add colors to winston
winston.addColors(logColors);

// ANSI color codes for terminal output
const colors = {
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  reset: "\x1b[0m",
};

// Function to colorize JSON object keys
const colorizeJsonKeys = (obj, indent = 0) => {
  if (typeof obj !== "object" || obj === null) {
    return JSON.stringify(obj);
  }

  const spaces = "  ".repeat(indent);
  const nextSpaces = "  ".repeat(indent + 1);

  if (Array.isArray(obj)) {
    const items = obj
      .map((item) => nextSpaces + colorizeJsonKeys(item, indent + 1))
      .join(",\n");
    return `[\n${items}\n${spaces}]`;
  }

  const entries = Object.entries(obj)
    .map(([key, value]) => {
      const coloredKey = `${colors.cyan}"${key}"${colors.reset}`;
      const coloredValue = `${colors.magenta}${colorizeJsonKeys(
        value,
        indent + 1
      )}${colors.reset}`;
      return `${nextSpaces}${coloredKey}: ${coloredValue}`;
    })
    .join(",\n");

  return `{\n${entries}\n${spaces}}`;
};

// Log directory (flat structure - no date subdirectories)
const LOG_DIR = path.join(__dirname, "../logs");

// Max age in days for log retention
const LOG_RETENTION_DAYS = 14;

// Create flat log path (winston-daily-rotate-file handles date via %DATE%)
const createLogPath = (filename) => {
  return path.join(LOG_DIR, filename);
};

/**
 * Cleanup legacy date-based log subdirectories and stale log files
 * Runs on startup to reclaim disk space
 */
const cleanupOldLogs = () => {
  try {
    if (!fs.existsSync(LOG_DIR)) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);

    const entries = fs.readdirSync(LOG_DIR, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(LOG_DIR, entry.name);

      if (entry.isDirectory()) {
        // Remove legacy date-based subdirectories (format: YYYY-MM-DD)
        const dateMatch = entry.name.match(/^\d{4}-\d{2}-\d{2}$/);
        if (dateMatch) {
          const dirDate = new Date(entry.name);
          if (!isNaN(dirDate.getTime()) && dirDate < cutoffDate) {
            fs.rmSync(entryPath, { recursive: true, force: true });
          }
        }
      } else if (entry.isFile()) {
        // Clean old flat log files beyond retention period
        try {
          const stat = fs.statSync(entryPath);
          if (stat.mtime < cutoffDate && entry.name.endsWith(".log")) {
            fs.unlinkSync(entryPath);
          }
        } catch {
          // Skip files that can't be accessed
        }
      }
    }
  } catch (err) {
    // Use console directly since logger may not be ready
    console.error("[Logger] Failed to cleanup old logs:", err.message);
  }
};

// Run cleanup on module load (server startup)
cleanupOldLogs();

// Malaysian timestamp formatter
const malaysianTimestamp = () => {
  return new Date().toLocaleString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: malaysianTimestamp }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present with colored keys
    if (Object.keys(meta).length > 0) {
      log += `\n${colorizeJsonKeys(meta)}`;
    }

    return log;
  })
);

const prettyFileFormat = winston.format.combine(
  winston.format.timestamp({ format: malaysianTimestamp }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      // Use regular JSON.stringify for metadata
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Custom format for file output
const plainFileFormat = winston.format.combine(
  winston.format.timestamp({ format: malaysianTimestamp }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Combine all log properties into a single object
    const logObject = {
      timestamp,
      level,
      message,
      ...meta,
    };
    // Return as a JSON string for machine readability
    return JSON.stringify(logObject);
  })
);

// Create transports array
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: consoleFormat,
  }),
];

// Add file transports only in production or when explicitly enabled
if (
  process.env.NODE_ENV === "production" ||
  process.env.ENABLE_FILE_LOGGING === "true"
) {
  // Daily rotate file for all logs
  transports.push(
    new DailyRotateFile({
      filename: createLogPath("application-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "7d",
      format: plainFileFormat,
      level: "info",
    })
  );

  // Separate file for errors only
  transports.push(
    new DailyRotateFile({
      filename: createLogPath("error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "14d",
      format: plainFileFormat,
      level: "error",
    })
  );

  // HTTP requests log
  transports.push(
    new DailyRotateFile({
      filename: createLogPath("http-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "3d",
      format: plainFileFormat,
      level: "http",
    })
  );

  // Security events log
  transports.push(
    new DailyRotateFile({
      filename: createLogPath("security-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "30d",
      format: plainFileFormat,
      level: "warn",
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  levels: logLevels,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
  // Handle uncaught exceptions
  exceptionHandlers:
    process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: createLogPath("exceptions.log"),
            format: plainFileFormat,
          }),
        ]
      : [],
  // Handle unhandled promise rejections
  rejectionHandlers:
    process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: createLogPath("rejections.log"),
            format: plainFileFormat,
          }),
        ]
      : [],
});

module.exports = logger;
