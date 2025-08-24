#!/usr/bin/env node

/**
 * Pretty Log Viewer for E-commerce Project
 *
 * Usage:
 *   node scripts/view-logs.js [type] [lines]
 *
 * Examples:
 *   node scripts/view-logs.js error 5      # Show last 5 error logs
 *   node scripts/view-logs.js http 10      # Show last 10 HTTP logs
 *   node scripts/view-logs.js app          # Show last 10 application logs
 */

const fs = require("fs");
const path = require("path");

// Configuration
const LOG_DIR = path.join(__dirname, "../logs");
const today = new Date().toISOString().split("T")[0];

// Arguments
const logType = process.argv[2] || "error";
const lineCount = parseInt(process.argv[3]) || 10;

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function colorize(level, text) {
  switch (level?.toLowerCase()) {
    case "error":
      return `${colors.red}${text}${colors.reset}`;
    case "warn":
      return `${colors.yellow}${text}${colors.reset}`;
    case "info":
      return `${colors.green}${text}${colors.reset}`;
    case "debug":
      return `${colors.gray}${text}${colors.reset}`;
    default:
      return text;
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${colors.gray}${date.toLocaleTimeString()}${colors.reset}`;
}

function formatLogEntry(entry) {
  try {
    const log = JSON.parse(entry);

    // Essential fields only
    const essential = {
      time: formatTimestamp(log.timestamp),
      level: colorize(log.level, log.level?.toUpperCase() || "LOG"),
      action: `${colors.cyan}${log.action || "unknown"}${colors.reset}`,
      message: `${colors.bright}${log.message}${colors.reset}`,
      endpoint: `${colors.blue}${log.method} ${log.originalUrl}${colors.reset}`,
      user: `${colors.magenta}${log.userId || "anonymous"}${colors.reset}`,
      ...(log.email && {
        email: `${colors.yellow}${log.email}${colors.reset}`,
      }),
      ...(log.params &&
        Object.keys(log.params).length > 0 && {
          params: `${colors.cyan}${JSON.stringify(log.params)}${colors.reset}`,
        }),
      ...(log.query &&
        Object.keys(log.query).length > 0 && {
          query: `${colors.cyan}${JSON.stringify(log.query)}${colors.reset}`,
        }),
    };

    // Format output
    let output = `${essential.time} ${essential.level} [${essential.action}] ${essential.message}\n`;
    output += `  ${essential.endpoint} | User: ${essential.user}`;

    if (essential.email) {
      output += ` | Email: ${essential.email}`;
    }
    if (essential.params) {
      output += ` | Params: ${essential.params}`;
    }
    if (essential.query) {
      output += ` | Query: ${essential.query}`;
    }

    return output;
  } catch (e) {
    return entry; // Return raw if parsing fails
  }
}

function viewLogs() {
  const logFile = path.join(LOG_DIR, today, `${logType}-current.log`);

  if (!fs.existsSync(logFile)) {
    console.log(`${colors.red}No log file found: ${logFile}${colors.reset}`);
    console.log(
      `${colors.yellow}Available log types: error, http, application${colors.reset}`
    );
    return;
  }

  console.log(
    `${
      colors.bright
    }=== ${logType.toUpperCase()} LOGS (Last ${lineCount} entries) ===${
      colors.reset
    }\n`
  );

  try {
    const content = fs.readFileSync(logFile, "utf8");
    const lines = content
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    const lastLines = lines.slice(-lineCount);

    if (lastLines.length === 0) {
      console.log(`${colors.yellow}No log entries found${colors.reset}`);
      return;
    }

    lastLines.forEach((line, index) => {
      console.log(
        `${colors.gray}${index + 1}.${colors.reset} ${formatLogEntry(line)}`
      );
      console.log(""); // Empty line for readability
    });

    console.log(
      `${colors.gray}Showing ${lastLines.length} of ${lines.length} total entries${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}Error reading log file: ${error.message}${colors.reset}`
    );
  }
}

// Run the viewer
viewLogs();
