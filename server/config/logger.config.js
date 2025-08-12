const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

/**
 * Winston Logger Configuration
 * Industrial standard logging with file rotation and structured logging
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
  info: "cyan",
  http: "magenta",
  debug: "gray",
};

// Add colors to winston
winston.addColors(logColors);

// Create logs directory path with date-based folders
const createLogPath = (filename) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const dailyDir = path.join(__dirname, "../logs", today);
  return path.join(dailyDir, filename);
};

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
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
      maxSize: "20m",
      maxFiles: "14d",
      format: fileFormat,
      level: "info",
      createSymlink: true,
      symlinkName: "application-current.log",
    })
  );

  // Separate file for errors only
  transports.push(
    new DailyRotateFile({
      filename: createLogPath("error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
      level: "error",
      createSymlink: true,
      symlinkName: "error-current.log",
    })
  );

  // HTTP requests log
  transports.push(
    new DailyRotateFile({
      filename: createLogPath("http-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "7d",
      format: fileFormat,
      level: "http",
      createSymlink: true,
      symlinkName: "http-current.log",
    })
  );

  // Security events log
  transports.push(
    new DailyRotateFile({
      filename: createLogPath("security-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "90d",
      format: fileFormat,
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
            format: fileFormat,
          }),
        ]
      : [],
  // Handle unhandled promise rejections
  rejectionHandlers:
    process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: createLogPath("rejections.log"),
            format: fileFormat,
          }),
        ]
      : [],
});

module.exports = logger;
