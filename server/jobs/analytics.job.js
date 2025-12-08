/**
 * Analytics Scheduled Jobs
 * Automatically calculate analytics every 15 minutes
 */

const cron = require("node-cron");
const { User } = require("../models/user");
const {
  calculateMerchantAnalytics,
} = require("../services/analytic/merchant.analytics.service");
const {
  calculatePlatformAnalytics,
} = require("../services/analytic/platform.analytics.service");
const logger = require("../utils/logger");

/**
 * Calculate analytics for all active merchants
 * Runs for each period: week, month, year
 */
const calculateAllMerchantAnalytics = async () => {
  const startTime = Date.now();

  try {
    // Get all merchants (silent operation)
    const merchants = await User.find({
      roles: "merchant",
      isActive: true,
    }).select("_id profile.username");

    if (merchants.length === 0) {
      logger.info("No active merchants found");
      return { success: true, merchantsProcessed: 0, errors: [] };
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Process merchants in batches to avoid overwhelming database
    const BATCH_SIZE = 10;
    const periods = ["week", "month", "year"];

    for (let i = 0; i < merchants.length; i += BATCH_SIZE) {
      const batch = merchants.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.flatMap((merchant) =>
          periods.map(async (period) => {
            try {
              await calculateMerchantAnalytics(merchant._id, period);
              results.success++;
            } catch (error) {
              results.failed++;
              results.errors.push({
                merchantId: merchant._id.toString(),
                username: merchant.profile.username,
                period,
                error: error.message,
              });
              // Only log errors, not successes
              logger.error(
                `Analytics failed for ${merchant.profile.username} (${period})`,
                {
                  merchantId: merchant._id.toString(),
                  error: error.message,
                }
              );
            }
          })
        )
      );

      // Small delay between batches to prevent database overload
      if (i + BATCH_SIZE < merchants.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    const duration = Date.now() - startTime;

    // Only log summary, not individual calculations
    logger.info(
      `Merchant analytics: ${results.success} successful, ${results.failed} failed (${merchants.length} merchants, ${duration}ms)`
    );

    return {
      success: true,
      merchantsProcessed: merchants.length,
      successfulCalculations: results.success,
      failedCalculations: results.failed,
      errors: results.errors,
      durationMs: duration,
    };
  } catch (error) {
    logger.error("Critical error in merchant analytics job", {
      error: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Calculate platform-wide analytics
 * Runs for each period: week, month, year
 */
const calculateAllPlatformAnalytics = async () => {
  const startTime = Date.now();

  try {
    const periods = ["week", "month", "year"];
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const period of periods) {
      try {
        await calculatePlatformAnalytics(period);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          period,
          error: error.message,
        });
        // Only log errors
        logger.error(`Platform analytics failed for ${period}`, {
          error: error.message,
        });
      }
    }

    const duration = Date.now() - startTime;

    // Only log summary
    logger.info(
      `Platform analytics: ${results.success} successful, ${results.failed} failed (${duration}ms)`
    );

    return {
      success: true,
      successfulCalculations: results.success,
      failedCalculations: results.failed,
      errors: results.errors,
      durationMs: duration,
    };
  } catch (error) {
    logger.error("Critical error in platform analytics job", {
      error: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Run all analytics jobs
 * Called by cron scheduler
 */
const runAnalyticsJobs = async () => {
  const startTime = Date.now();

  try {
    // Run both jobs in parallel (no start log, just run)
    const [merchantResults, platformResults] = await Promise.allSettled([
      calculateAllMerchantAnalytics(),
      calculateAllPlatformAnalytics(),
    ]);

    const totalDuration = Date.now() - startTime;

    // Only log if there are errors, otherwise just a simple success
    const hasErrors =
      merchantResults.status === "rejected" ||
      platformResults.status === "rejected" ||
      merchantResults.value?.failedCalculations > 0 ||
      platformResults.value?.failedCalculations > 0;

    if (hasErrors) {
      logger.warn(`Analytics completed with errors (${totalDuration}ms)`, {
        merchantJob:
          merchantResults.status === "fulfilled"
            ? merchantResults.value
            : { error: merchantResults.reason?.message },
        platformJob:
          platformResults.status === "fulfilled"
            ? platformResults.value
            : { error: platformResults.reason?.message },
      });
    } else {
      logger.info(`Analytics completed successfully (${totalDuration}ms)`);
    }

    return {
      success: true,
      merchantJob: merchantResults.value,
      platformJob: platformResults.value,
      totalDurationMs: totalDuration,
    };
  } catch (error) {
    logger.error("Critical error running analytics jobs", {
      error: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Schedule analytics jobs
 * Runs every 15 minutes
 */
let analyticsJobSchedule;

const startAnalyticsScheduler = () => {
  // Cron pattern: every 15 minutes
  // "*/15 * * * *" = At minute 0, 15, 30, and 45 of every hour
  analyticsJobSchedule = cron.schedule(
    "*/15 * * * *",
    async () => {
      await runAnalyticsJobs();
    },
    {
      scheduled: true,
      timezone: "Asia/Kuala_Lumpur", // Malaysia timezone
    }
  );

  logger.info(
    "Analytics scheduler started (every 15 minutes, Asia/Kuala_Lumpur timezone)"
  );

  // Run immediately on startup (silent, will log results)
  setImmediate(() => {
    runAnalyticsJobs().catch((error) => {
      logger.error("Initial analytics run failed", {
        error: error.message,
      });
    });
  });
};

/**
 * Stop analytics scheduler
 */
const stopAnalyticsScheduler = () => {
  if (analyticsJobSchedule) {
    analyticsJobSchedule.stop();
    logger.info("Analytics scheduler stopped");
  }
};

module.exports = {
  runAnalyticsJobs,
  calculateAllMerchantAnalytics,
  calculateAllPlatformAnalytics,
  startAnalyticsScheduler,
  stopAnalyticsScheduler,
};
