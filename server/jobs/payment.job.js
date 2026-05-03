const cron = require("node-cron");
const logger = require("../utils/logger");
const {
  expirePendingPaymentsAndRestoreStock,
  reconcileStalePendingPayments,
} = require("../services/payment/payment.lifecycle.service");

let paymentJobSchedule;

const runPaymentMaintenance = async () => {
  try {
    const expireResult = await expirePendingPaymentsAndRestoreStock();
    const reconcileResult = await reconcileStalePendingPayments();
    logger.info("payment.maintenance.completed", {
      expired: expireResult.expiredCount,
      restored: expireResult.restoredStockOrderCount,
      reconciledChecked: reconcileResult.checked,
      reconciledPotentialPaid: reconcileResult.potentialPaid,
    });
    return {
      expiredOrdersCount: expireResult.expiredCount,
      stockRestoredCount: expireResult.restoredStockOrderCount,
      reconciliationCheckedCount: reconcileResult.checked,
      potentialPaidFindingsCount: reconcileResult.potentialPaid,
    };
  } catch (error) {
    logger.error("payment.maintenance.failed", {
      error: error.message,
    });
    throw error;
  }
};

const startPaymentScheduler = () => {
  paymentJobSchedule = cron.schedule(
    "*/2 * * * *",
    async () => {
      await runPaymentMaintenance();
    },
    {
      scheduled: true,
      timezone: "Asia/Kuala_Lumpur",
    },
  );
  logger.info("Payment scheduler started (every 2 minutes)");
};

const stopPaymentScheduler = () => {
  if (paymentJobSchedule) {
    paymentJobSchedule.stop();
    logger.info("Payment scheduler stopped");
  }
};

module.exports = {
  runPaymentMaintenance,
  startPaymentScheduler,
  stopPaymentScheduler,
};
