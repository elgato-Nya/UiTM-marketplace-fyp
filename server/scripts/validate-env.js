#!/usr/bin/env node

/**
 * Environment Variables Validator
 *
 * PURPOSE: Validate all required environment variables before deployment
 *
 * Usage:
 *   npm run env:check           # Check all variables
 *   npm run env:check --strict  # Fail on warnings
 *   npm run env:check --prod    # Check production variables only
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

// Required environment variables
const requiredVars = {
  // Database
  MONGO_URI: {
    required: true,
    description: "MongoDB connection string",
    example: "mongodb://localhost:27017/ecommerce",
    validate: (value) =>
      value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
    errorMsg: "Must be a valid MongoDB connection string",
  },

  // JWT Configuration
  JWT_ACCESS_SECRET: {
    required: true,
    description: "Secret key for JWT access tokens",
    minLength: 32,
    validate: (value) => value.length >= 32,
    errorMsg: "Must be at least 32 characters long",
  },
  JWT_REFRESH_SECRET: {
    required: true,
    description: "Secret key for JWT refresh tokens",
    minLength: 32,
    validate: (value) => value.length >= 32,
    errorMsg: "Must be at least 32 characters long",
  },
  JWT_ACCESS_EXPIRATION: {
    required: false,
    description: "JWT access token expiration time",
    default: "30m",
    example: "30m, 1h, 2d",
  },
  JWT_REFRESH_EXPIRY: {
    required: false,
    description: "JWT refresh token expiration time",
    default: "7d",
    example: "7d, 30d",
  },
  JWT_ISSUER: {
    required: true,
    description: "JWT token issuer",
    example: "uitm-marketplace",
  },
  JWT_AUDIENCE: {
    required: true,
    description: "JWT token audience",
    example: "uitm-students",
  },

  // Server Configuration
  PORT: {
    required: false,
    description: "Server port number",
    default: "5000",
    validate: (value) =>
      !isNaN(value) && parseInt(value) > 0 && parseInt(value) <= 65535,
    errorMsg: "Must be a valid port number (1-65535)",
  },
  NODE_ENV: {
    required: true,
    description: "Node environment",
    validate: (value) => ["development", "production", "test"].includes(value),
    errorMsg: "Must be development, production, or test",
  },

  // Security (Production)
  CORS_ORIGIN: {
    required: "production",
    description: "CORS allowed origins",
    example: "https://yourdomain.com,https://api.yourdomain.com",
  },
};

// Check if .env file exists
const checkEnvFile = () => {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    log("red", "❌ .env file not found!");
    log("yellow", `   Expected location: ${envPath}`);
    log("blue", "   💡 Create a .env file with required variables");
    return false;
  }
  log("green", "✅ .env file found");
  return true;
};

// Load environment variables
const loadEnv = () => {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
};

// Validate a single environment variable
const validateVar = (name, config, isProduction) => {
  const value = process.env[name];
  const errors = [];
  const warnings = [];

  // Check if required
  if (
    config.required === true ||
    (config.required === "production" && isProduction)
  ) {
    if (!value) {
      errors.push(`${name} is required but not set`);
      return { errors, warnings, status: "error" };
    }
  }

  // If not set and not required, check for default
  if (!value) {
    if (config.default) {
      warnings.push(`${name} not set, using default: ${config.default}`);
      return { errors, warnings, status: "warning" };
    }
    return { errors, warnings, status: "ok" };
  }

  // Validate value if present
  if (config.validate && !config.validate(value)) {
    errors.push(`${name}: ${config.errorMsg || "Invalid value"}`);
    return { errors, warnings, status: "error" };
  }

  // Check minimum length
  if (config.minLength && value.length < config.minLength) {
    errors.push(`${name} must be at least ${config.minLength} characters long`);
    return { errors, warnings, status: "error" };
  }

  return { errors, warnings, status: "ok" };
};

// Main validation function
const validateEnvironment = () => {
  const args = process.argv.slice(2);
  const isStrict = args.includes("--strict");
  const isProdCheck = args.includes("--prod");
  const isProduction = process.env.NODE_ENV === "production" || isProdCheck;

  log("cyan", "🔍 Environment Variables Validation");
  log("gray", "=====================================\n");

  if (!checkEnvFile()) {
    process.exit(1);
  }

  loadEnv();

  let totalErrors = 0;
  let totalWarnings = 0;

  log(
    "blue",
    `Environment: ${colors.bright}${process.env.NODE_ENV || "not set"}${
      colors.reset
    }${colors.blue}`
  );
  log(
    "blue",
    `Production check: ${colors.bright}${isProduction ? "Yes" : "No"}${
      colors.reset
    }${colors.blue}\n`
  );

  // Validate each variable
  Object.entries(requiredVars).forEach(([name, config]) => {
    const { errors, warnings, status } = validateVar(
      name,
      config,
      isProduction
    );

    totalErrors += errors.length;
    totalWarnings += warnings.length;

    // Display result
    const statusIcon =
      status === "error" ? "❌" : status === "warning" ? "⚠️" : "✅";
    const value = process.env[name];
    const displayValue = value
      ? name.includes("SECRET") || name.includes("PASSWORD")
        ? "***hidden***"
        : value
      : "not set";

    log(
      "blue",
      `${statusIcon} ${name}: ${colors.gray}${displayValue}${colors.reset}`
    );

    if (config.description) {
      log("gray", `   📝 ${config.description}`);
    }

    errors.forEach((error) => {
      log("red", `   ❌ ${error}`);
    });

    warnings.forEach((warning) => {
      log("yellow", `   ⚠️  ${warning}`);
    });

    if (config.example && !value) {
      log("gray", `   💡 Example: ${config.example}`);
    }

    console.log();
  });

  // Summary
  log("cyan", "📊 Validation Summary");
  log("gray", "==================");
  log(
    "green",
    `✅ Valid variables: ${
      Object.keys(requiredVars).length - totalErrors - totalWarnings
    }`
  );

  if (totalWarnings > 0) {
    log("yellow", `⚠️  Warnings: ${totalWarnings}`);
  }

  if (totalErrors > 0) {
    log("red", `❌ Errors: ${totalErrors}`);
  }

  // Exit codes
  if (totalErrors > 0) {
    log("red", "\n💥 Environment validation failed!");
    process.exit(1);
  } else if (totalWarnings > 0 && isStrict) {
    log("yellow", "\n⚠️  Environment validation failed (strict mode)!");
    process.exit(1);
  } else if (totalWarnings > 0) {
    log("yellow", "\n⚠️  Environment validation passed with warnings");
    process.exit(0);
  } else {
    log("green", "\n🎉 Environment validation passed!");
    process.exit(0);
  }
};

// Run validation
validateEnvironment();
