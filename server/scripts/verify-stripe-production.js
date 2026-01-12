/**
 * Stripe Production Configuration Verification
 *
 * PURPOSE: Verify Stripe LIVE keys in production environment
 * USAGE: npm run verify:stripe:prod
 */

// Load production environment
require("dotenv").config({ path: ".env.production" });

// Override NODE_ENV
process.env.NODE_ENV = "production";

// Run verification
require("./verify-stripe");
