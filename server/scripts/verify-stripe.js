require("dotenv").config();
const logger = require("../utils/logger");

/**
 * Stripe Configuration Verification Script
 *
 * PURPOSE: Verify Stripe keys and configuration before deployment
 * USAGE: node scripts/verify-stripe.js
 */

async function verifyStripe() {
  console.log("\n🔍 Verifying Stripe configuration...\n");

  try {
    // 1. Check if key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY not found in environment variables");
      console.log(
        "\n📝 To set up Stripe payments, add these to your .env file:\n"
      );
      console.log(
        "STRIPE_SECRET_KEY=sk_test_xxx           # Get from https://dashboard.stripe.com/apikeys"
      );
      console.log(
        "STRIPE_PUBLISHABLE_KEY=pk_test_xxx     # Get from https://dashboard.stripe.com/apikeys"
      );
      console.log(
        "STRIPE_WEBHOOK_SECRET=whsec_xxx        # Optional: Get from https://dashboard.stripe.com/webhooks"
      );
      console.log(
        "STRIPE_MINIMUM_AMOUNT=10               # Minimum payment amount in MYR"
      );
      console.log(
        "\n⚠️  For Malaysia: Use sk_live_xxx and pk_live_xxx keys (test keys may not work for MYR)"
      );
      console.log(
        "\nℹ️  Visit https://dashboard.stripe.com/register to create a Stripe account if you don't have one.\n"
      );
      process.exit(1);
    }

    // Initialize Stripe only after checking key exists
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    // 2. Check key format
    const key = process.env.STRIPE_SECRET_KEY;
    const isLive = key.startsWith("sk_live_");
    const isTest = key.startsWith("sk_test_");

    if (!isLive && !isTest) {
      console.error("❌ Invalid Stripe key format");
      console.log("\n💡 Key should start with 'sk_live_' or 'sk_test_'\n");
      process.exit(1);
    }

    // 3. Display key info (masked)
    const keyPrefix = key.substring(0, 12);
    const keySuffix = key.substring(key.length - 4);
    console.log(`✅ Key format valid: ${isLive ? "🔴 LIVE" : "🟢 TEST"} mode`);
    console.log(`🔑 Key: ${keyPrefix}...${keySuffix}\n`);

    // 4. Environment check
    const nodeEnv = process.env.NODE_ENV || "development";
    console.log(`🌍 Environment: ${nodeEnv}`);

    // Warn about key/environment mismatch
    if (nodeEnv === "production" && isTest) {
      console.warn("⚠️  WARNING: Using TEST keys in PRODUCTION environment!");
      console.warn("⚠️  Real payments will NOT work with test keys!\n");
    }
    if (nodeEnv === "development" && isLive) {
      console.error("\n❌ DANGER: Using LIVE keys in DEVELOPMENT environment!");
      console.error("❌ This could result in real charges during testing!\n");
      process.exit(1);
    }

    // 5. Test API connection
    console.log("\n📡 Testing Stripe API connection...");
    const balance = await stripe.balance.retrieve();

    console.log("✅ Stripe API connection successful!");
    if (balance.available && balance.available.length > 0) {
      const amount = (balance.available[0].amount / 100).toFixed(2);
      const currency = (balance.available[0].currency || "myr").toUpperCase();
      console.log(`💰 Available balance: ${amount} ${currency}`);
    }

    // 6. Check publishable key
    if (process.env.STRIPE_PUBLISHABLE_KEY) {
      const pubKey = process.env.STRIPE_PUBLISHABLE_KEY;
      const pubIsLive = pubKey.startsWith("pk_live_");
      const pubIsTest = pubKey.startsWith("pk_test_");

      if (pubIsLive || pubIsTest) {
        console.log(`✅ Publishable key found: ${pubIsLive ? "LIVE" : "TEST"}`);

        // Check if secret and publishable keys match
        if (isLive !== pubIsLive) {
          console.error(
            "\n❌ KEY MISMATCH: Secret and publishable keys are from different modes!"
          );
          process.exit(1);
        }
      } else {
        console.warn("⚠️  Publishable key has invalid format");
      }
    } else {
      console.warn(
        "⚠️  STRIPE_PUBLISHABLE_KEY not found (needed for frontend)"
      );
    }

    // 7. Check webhook secret
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (webhookSecret.startsWith("whsec_")) {
        console.log("✅ Webhook secret found");
      } else {
        console.warn("⚠️  Webhook secret has invalid format");
      }
    } else {
      console.warn("⚠️  STRIPE_WEBHOOK_SECRET not found (needed for webhooks)");
    }

    // 8. Test payment intent creation (test only)
    if (isTest) {
      console.log("\n🧪 Testing payment intent creation...");
      try {
        const testIntent = await stripe.paymentIntents.create({
          amount: 1000, // RM 10.00
          currency: "myr",
          description: "Test payment intent - verification script",
          metadata: { test: "verification" },
        });

        console.log(
          `✅ Test payment intent created: ${testIntent.id.substring(0, 20)}...`
        );

        // Cancel the test payment
        await stripe.paymentIntents.cancel(testIntent.id);
        console.log("✅ Test payment intent cancelled");
      } catch (error) {
        console.error("❌ Payment intent test failed:", error.message);
      }
    }

    // 9. Display configuration summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 STRIPE CONFIGURATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Mode:                ${isLive ? "🔴 LIVE" : "🟢 TEST"}`);
    console.log(`Environment:         ${nodeEnv}`);
    console.log(`Secret Key:          ${keyPrefix}...${keySuffix}`);
    console.log(
      `Publishable Key:     ${
        process.env.STRIPE_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing"
      }`
    );
    console.log(
      `Webhook Secret:      ${
        process.env.STRIPE_WEBHOOK_SECRET ? "✅ Set" : "❌ Missing"
      }`
    );
    console.log(
      `Minimum Amount:      ${process.env.STRIPE_MINIMUM_AMOUNT || "10.00"} MYR`
    );
    console.log("=".repeat(60));

    // 10. Final recommendations
    console.log("\n📝 RECOMMENDATIONS:\n");

    if (isTest) {
      console.log("✅ Test mode - Safe for development and testing");
      console.log(
        "💡 Use test cards: 4242 4242 4242 4242 (success) or 4000 0000 0000 0002 (decline)"
      );
      console.log(
        "💡 When ready for production, switch to live keys in .env.production"
      );
    } else {
      console.log("🔴 LIVE MODE ACTIVE - Real payments will be processed!");
      console.log("⚠️  Ensure you have:");
      console.log("   1. Completed Stripe business verification");
      console.log("   2. Connected your bank account");
      console.log("   3. Set up webhooks in Stripe Dashboard");
      console.log("   4. Tested payment flow thoroughly");
      console.log("   5. Enabled required payment methods");
    }

    console.log("\n✅ All checks passed!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Stripe verification failed!\n");
    console.error("Error:", error.message);

    if (error.type === "StripeAuthenticationError") {
      console.error(
        "\n💡 Your API key is invalid or has been revoked. Get a new key from:"
      );
      console.error("   https://dashboard.stripe.com/apikeys\n");
    }

    if (error.type === "StripeConnectionError") {
      console.error(
        "\n💡 Cannot connect to Stripe. Check your internet connection.\n"
      );
    }

    logger.error("Stripe verification error", {
      error: error.message,
      type: error.type,
    });

    process.exit(1);
  }
}

// Run verification
verifyStripe();
