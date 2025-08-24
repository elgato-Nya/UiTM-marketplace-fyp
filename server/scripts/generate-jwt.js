#!/usr/bin/env node

/**
 * JWT Secret Generator
 *
 * PURPOSE: Generate cryptographically secure JWT secrets for production
 *
 * Usage:
 *   npm run generate:jwt           # Generate both access and refresh tokens
 *   npm run generate:jwt access    # Generate only access token secret
 *   npm run generate:jwt refresh   # Generate only refresh token secret
 *   npm run generate:jwt --length 64  # Generate with specific length
 */

const crypto = require("crypto");
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

// Configuration
const DEFAULT_LENGTH = 64; // 512 bits
const MIN_LENGTH = 32; // 256 bits minimum for production
const MAX_LENGTH = 128; // 1024 bits maximum

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);

  const lengthArg = args.find((arg) => arg.startsWith("--length="));
  const length = lengthArg
    ? parseInt(lengthArg.split("=")[1])
    : args.includes("--length")
    ? parseInt(args[args.indexOf("--length") + 1])
    : DEFAULT_LENGTH;

  const tokenType =
    args.find((arg) => ["access", "refresh", "both"].includes(arg)) || "both";

  return {
    tokenType,
    length: Math.max(
      MIN_LENGTH,
      Math.min(MAX_LENGTH, length || DEFAULT_LENGTH)
    ),
    help: args.includes("--help") || args.includes("-h"),
    output: args.includes("--output") || args.includes("-o"),
    env: args.includes("--env"),
    base64: args.includes("--base64"),
    copy: args.includes("--copy"),
  };
};

// Show help message
const showHelp = () => {
  log("cyan", "🔐 JWT Secret Generator");
  log("gray", "=====================\n");
  log("blue", "Usage:");
  log("blue", "  npm run generate:jwt [type] [options]\n");
  log("blue", "Token Types:");
  log("blue", "  access            Generate access token secret only");
  log("blue", "  refresh           Generate refresh token secret only");
  log("blue", "  both              Generate both secrets (default)\n");
  log("blue", "Options:");
  log(
    "blue",
    "  --length <num>    Secret length in bytes (32-128, default: 64)"
  );
  log("blue", "  --base64          Output in base64 format");
  log("blue", "  --env             Show as environment variable format");
  log("blue", "  --output, -o      Save to secrets.txt file");
  log("blue", "  --copy            Copy to clipboard (if available)");
  log("blue", "  --help, -h        Show this help message\n");
  log("blue", "Examples:");
  log(
    "blue",
    "  npm run generate:jwt                    # Generate both secrets"
  );
  log(
    "blue",
    "  npm run generate:jwt access --length 32 # Generate 32-byte access secret"
  );
  log(
    "blue",
    "  npm run generate:jwt --env              # Show in .env format"
  );
  log("blue", "  npm run generate:jwt --output           # Save to file");
};

// Generate cryptographically secure random string
const generateSecret = (length, format = "hex") => {
  const bytes = crypto.randomBytes(length);

  if (format === "base64") {
    return bytes.toString("base64");
  }

  return bytes.toString("hex");
};

// Calculate entropy bits
const calculateEntropy = (length) => {
  return length * 8; // bits
};

// Get security level description
const getSecurityLevel = (bits) => {
  if (bits >= 512) return { level: "Excellent", color: "green" };
  if (bits >= 256) return { level: "Good", color: "blue" };
  if (bits >= 128) return { level: "Adequate", color: "yellow" };
  return { level: "Weak", color: "red" };
};

// Save secrets to file
const saveToFile = (secrets, format) => {
  const outputDir = path.join(__dirname, "..");
  const outputFile = path.join(outputDir, "secrets.txt");

  let content = `# JWT Secrets Generated on ${new Date().toISOString()}\n`;
  content += `# Security Level: ${format.entropy} bits entropy\n\n`;

  if (format.env) {
    secrets.forEach((secret) => {
      content += `${secret.env}=${secret.value}\n`;
    });
  } else {
    secrets.forEach((secret) => {
      content += `${secret.name}: ${secret.value}\n`;
    });
  }

  content +=
    "\n# IMPORTANT: Keep these secrets secure and never commit to version control!\n";

  fs.writeFileSync(outputFile, content);
  return outputFile;
};

// Copy to clipboard (basic implementation)
const copyToClipboard = (text) => {
  try {
    const { spawn } = require("child_process");

    if (process.platform === "win32") {
      const proc = spawn("clip", [], { stdio: "pipe" });
      proc.stdin.write(text);
      proc.stdin.end();
      return true;
    } else if (process.platform === "darwin") {
      const proc = spawn("pbcopy", [], { stdio: "pipe" });
      proc.stdin.write(text);
      proc.stdin.end();
      return true;
    } else {
      // Linux - try xclip
      const proc = spawn("xclip", ["-selection", "clipboard"], {
        stdio: "pipe",
      });
      proc.stdin.write(text);
      proc.stdin.end();
      return true;
    }
  } catch (error) {
    return false;
  }
};

// Validate secret strength
const validateSecret = (secret, length) => {
  const issues = [];

  // Check for patterns
  if (/(.)\1{3,}/.test(secret)) {
    issues.push("Contains repeated character sequences");
  }

  // Check for low entropy patterns
  const uniqueChars = new Set(secret).size;
  const expectedUnique = Math.min(16, length / 2); // For hex

  if (uniqueChars < expectedUnique) {
    issues.push("Low character diversity");
  }

  return issues;
};

// Main generation function
const generateJWTSecrets = async () => {
  const { tokenType, length, help, output, env, base64, copy } = parseArgs();

  if (help) {
    showHelp();
    return;
  }

  log("cyan", "🔐 JWT Secret Generator");
  log("gray", "=====================\n");

  const entropy = calculateEntropy(length);
  const security = getSecurityLevel(entropy);

  log("blue", `Secret length: ${colors.bright}${length} bytes${colors.reset}`);
  log("blue", `Entropy: ${colors.bright}${entropy} bits${colors.reset}`);
  log(
    security.color,
    `Security level: ${colors.bright}${security.level}${colors.reset}`
  );
  log(
    "blue",
    `Format: ${colors.bright}${base64 ? "Base64" : "Hexadecimal"}${
      colors.reset
    }\n`
  );

  // Security warning for weak secrets
  if (entropy < 256) {
    log(
      "yellow",
      "⚠️  WARNING: Consider using at least 32 bytes (256 bits) for production"
    );
    log("yellow", "   Use --length 32 or higher for better security\n");
  }

  const secrets = [];

  // Generate secrets based on type
  if (tokenType === "both" || tokenType === "access") {
    const accessSecret = generateSecret(length, base64 ? "base64" : "hex");
    const issues = validateSecret(accessSecret, length);

    secrets.push({
      name: "JWT Access Token Secret",
      env: "JWT_ACCESS_SECRET",
      value: accessSecret,
      issues,
    });
  }

  if (tokenType === "both" || tokenType === "refresh") {
    const refreshSecret = generateSecret(length, base64 ? "base64" : "hex");
    const issues = validateSecret(refreshSecret, length);

    secrets.push({
      name: "JWT Refresh Token Secret",
      env: "JWT_REFRESH_SECRET",
      value: refreshSecret,
      issues,
    });
  }

  // Display secrets
  secrets.forEach((secret, index) => {
    log("green", `🔑 ${secret.name}:`);

    if (env) {
      log("cyan", `   ${secret.env}=${secret.value}`);
    } else {
      log("cyan", `   ${secret.value}`);
    }

    // Show validation issues
    if (secret.issues.length > 0) {
      log("yellow", `   ⚠️  Issues: ${secret.issues.join(", ")}`);
    } else {
      log("green", `   ✅ Secret validation passed`);
    }

    if (index < secrets.length - 1) console.log();
  });

  console.log();

  // Save to file if requested
  if (output) {
    try {
      const outputFile = saveToFile(secrets, { env, entropy });
      log(
        "green",
        `💾 Secrets saved to: ${colors.gray}${outputFile}${colors.reset}`
      );
    } catch (error) {
      log("red", `❌ Failed to save file: ${error.message}`);
    }
  }

  // Copy to clipboard if requested
  if (copy) {
    const textToCopy = secrets
      .map((s) => (env ? `${s.env}=${s.value}` : s.value))
      .join("\n");

    if (copyToClipboard(textToCopy)) {
      log("green", "📋 Secrets copied to clipboard");
    } else {
      log("yellow", "⚠️  Could not copy to clipboard (install xclip on Linux)");
    }
  }

  // Security reminders
  log("yellow", "\n🔒 Security Reminders:");
  log(
    "yellow",
    "   • Store these secrets securely (environment variables, secrets manager)"
  );
  log("yellow", "   • Never commit secrets to version control");
  log("yellow", "   • Use different secrets for different environments");
  log("yellow", "   • Rotate secrets regularly in production");

  if (env) {
    log(
      "blue",
      "\n💡 Add these to your .env file and restart your application"
    );
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

// Run generator
generateJWTSecrets().catch((error) => {
  log("red", `❌ Generation failed: ${error.message}`);
  process.exit(1);
});
