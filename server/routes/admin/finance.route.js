const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../../middleware/auth/auth.middleware");
const adminFinanceController = require("../../controllers/admin/finance.controller");
const { adminStrictLimiter } = require("../../middleware/limiters.middleware");
const {
  validateWithdrawalIdParam,
  validateSellerIdParam,
  validateAdminWithdrawalsQuery,
  validateWithdrawalAction,
  validateWalletTransactionsQuery,
} = require("../../middleware/validations/admin/finance.validation");

router.use(protect);
router.use(authorize("admin"));

router.get(
  "/withdrawals",
  validateAdminWithdrawalsQuery,
  adminFinanceController.handleGetWithdrawals,
);
router.patch(
  "/withdrawals/:id/complete",
  validateWithdrawalIdParam,
  validateWithdrawalAction,
  adminFinanceController.handleCompleteWithdrawal,
);
router.patch(
  "/withdrawals/:id/reject",
  validateWithdrawalIdParam,
  validateWithdrawalAction,
  adminFinanceController.handleRejectWithdrawal,
);
router.get("/wallet/summary", adminFinanceController.handleGetWalletSummary);
router.get(
  "/wallet/transactions",
  validateWalletTransactionsQuery,
  adminFinanceController.handleGetWalletTransactions,
);
router.patch(
  "/sellers/:id/verify-badge",
  validateSellerIdParam,
  adminFinanceController.handleVerifyBadge,
);
router.post(
  "/ops/payments/maintenance/run",
  adminStrictLimiter,
  adminFinanceController.handleRunPaymentMaintenance,
);

module.exports = router;
