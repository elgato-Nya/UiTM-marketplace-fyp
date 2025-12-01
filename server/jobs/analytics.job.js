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
  logger.info("Starting merchant analytics calculation job");

  try {
    // Get all merchants
    const merchants = await User.find({
      roles: "merchant",
      isActive: true,
    }).select("_id profile.username");

    if (merchants.length === 0) {
      logger.info("No active merchants found for analytics calculation");
      return { success: true, merchantsProcessed: 0, errors: [] };
    }

    logger.info(`Found ${merchants.length} merchants to process`);

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
              logger.debug(
                `Analytics calculated for merchant ${merchant._id}`,
                {
                  merchantId: merchant._id.toString(),
                  username: merchant.profile.username,
                  period,
                }
              );
            } catch (error) {
              results.failed++;
              results.errors.push({
                merchantId: merchant._id.toString(),
                period,
                error: error.message,
              });
              logger.error(`Failed to calculate analytics for merchant`, {
                merchantId: merchant._id.toString(),
                period,
                error: error.message,
              });
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
    logger.info("Merchant analytics calculation job completed", {
      merchantCount: merchants.length,
      successfulCalculations: results.success,
      failedCalculations: results.failed,
      durationMs: duration,
    });

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
  logger.info("Starting platform analytics calculation job");

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
        logger.debug(`Platform analytics calculated for ${period}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          period,
          error: error.message,
        });
        logger.error(`Failed to calculate platform analytics`, {
          period,
          error: error.message,
        });
      }
    }

    const duration = Date.now() - startTime;
    logger.info("Platform analytics calculation job completed", {
      successfulCalculations: results.success,
      failedCalculations: results.failed,
      durationMs: duration,
    });

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
  logger.info("=== STARTING ANALYTICS JOBS ===");

  try {
    // Run both jobs in parallel
    const [merchantResults, platformResults] = await Promise.allSettled([
      calculateAllMerchantAnalytics(),
      calculateAllPlatformAnalytics(),
    ]);

    const totalDuration = Date.now() - startTime;

    logger.info("=== ANALYTICS JOBS COMPLETED ===", {
      totalDurationMs: totalDuration,
      merchantJob:
        merchantResults.status === "fulfilled"
          ? merchantResults.value
          : { error: merchantResults.reason?.message },
      platformJob:
        platformResults.status === "fulfilled"
          ? platformResults.value
          : { error: platformResults.reason?.message },
    });

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
      logger.info("Analytics scheduler triggered");
      await runAnalyticsJobs();
    },
    {
      scheduled: true,
      timezone: "Asia/Kuala_Lumpur", // Malaysia timezone
    }
  );

  logger.info("Analytics scheduler started", {
    schedule: "Every 15 minutes",
    timezone: "Asia/Kuala_Lumpur",
    nextRun: analyticsJobSchedule.nextDate().toISOString(),
  });

  // Run immediately on startup (optional - remove if you don't want initial run)
  logger.info("Running initial analytics calculation...");
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
