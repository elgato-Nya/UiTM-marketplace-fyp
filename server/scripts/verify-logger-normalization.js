#!/usr/bin/env node

/**
 * Local verification helper for logger normalization behavior.
 * Run: node scripts/verify-logger-normalization.js
 */

const mongoose = require("mongoose");
const logger = require("../utils/logger");

const mongoObjectId = new mongoose.Types.ObjectId();
const nested = {
  user: {
    _id: mongoObjectId,
    profile: {
      nestedId: new mongoose.Types.ObjectId(),
    },
  },
};

const circular = { name: "circular-root" };
circular.self = circular;

const largeBuffer = Buffer.alloc(4096, 0xab);
const textBuffer = Buffer.from("hello-buffer-preview", "utf8");

const testError = new Error("Verification error sample");
testError.code = "LOGGER_VERIFY";

logger.info("verify.normalization.objectid", {
  mongoObjectId,
  nested,
});

logger.info("verify.normalization.buffers", {
  textBuffer,
  largeBuffer,
});

logger.errorWithStack("verify.normalization.error", testError, {
  action: "logger_verification",
});

logger.info("verify.normalization.circular-and-redaction", {
  circular,
  password: "super-secret",
  Authorization: "Bearer should-not-show",
  access_token: "token-123",
  refreshToken: "token-456",
  API_KEY: "apikey-789",
});

console.log("Logger normalization verification logs emitted.");
console.log("Check console output or log files for normalized/redacted values.");
