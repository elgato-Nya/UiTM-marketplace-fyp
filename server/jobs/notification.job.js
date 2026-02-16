/**
 * Notification Cleanup Scheduled Job
 * Automatically removes expired and soft-deleted notifications
 * Runs daily at 3:00 AM (Malaysia timezone) to avoid peak hours
 */

const cron = require("node-cron");
const {
  cleanupExpiredNotifications,
} = require("../services/notification/notification.service");
const logger = require("../utils/logger");

/**
 * Run the notification cleanup task
 * Removes notifications past their expiresAt date and soft-deleted notifications
 * @returns {Object} { success, deletedCount, durationMs }
 */
const runNotificationCleanup = async () => {
  const startTime = Date.now();

  try {
    const result = await cleanupExpiredNotifications();
    const duration = Date.now() - startTime;

    if (result.deletedCount > 0) {
      logger.info(
        `Notification cleanup completed: ${result.deletedCount} removed (${duration}ms)`
      );
    } else {
      logger.debug(`Notification cleanup completed: nothing to remove (${duration}ms)`);
    }

    return {
      success: true,
      deletedCount: result.deletedCount,
      durationMs: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Notification cleanup job failed", {
      error: error.message,
      durationMs: duration,
    });

    return {
      success: false,
      error: error.message,
      durationMs: duration,
    };
  }
};

/**
 * Schedule notification cleanup job
 * Runs daily at 3:00 AM Malaysia time
 */
let cleanupJobSchedule;

const startNotificationCleanupScheduler = () => {
  // Cron pattern: "0 3 * * *" = At 03:00 every day
  cleanupJobSchedule = cron.schedule(
    "0 3 * * *",
    async () => {
      await runNotificationCleanup();
    },
    {
      scheduled: true,
      timezone: "Asia/Kuala_Lumpur",
    }
  );

  logger.info(
    "Notification cleanup scheduler started (daily at 3:00 AM, Asia/Kuala_Lumpur timezone)"
  );
};

/**
 * Stop notification cleanup scheduler
 */
const stopNotificationCleanupScheduler = () => {
  if (cleanupJobSchedule) {
    cleanupJobSchedule.stop();
    logger.info("Notification cleanup scheduler stopped");
  }
};

module.exports = {
  runNotificationCleanup,
  startNotificationCleanupScheduler,
  stopNotificationCleanupScheduler,
};
