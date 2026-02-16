const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../../middleware/auth/auth.middleware");
const { standardLimiter } = require("../../middleware/limiters.middleware");
const payoutController = require("../../controllers/payout");
const {
  validateUpdatePayoutSettings,
  validateUpdateBankDetails,
  validateRequestPayout,
  validatePayoutIdParam,
  validateGetPayoutHistory,
  validateGetBalance,
  validateSellerIdParam,
  validateProcessPayout,
} = require("../../middleware/validations/payout");

// All routes require authentication
router.use(protect);

// -------------------------------------------
// Seller routes
// -------------------------------------------

// Get seller balance and transactions
router.get(
  "/balance",
  standardLimiter,
  authorize("merchant"),
  validateGetBalance,
  payoutController.handleGetBalance,
);

// Update payout settings
router.patch(
  "/settings",
  standardLimiter,
  authorize("merchant"),
  validateUpdatePayoutSettings,
  payoutController.handleUpdatePayoutSettings,
);

// Update bank details
router.put(
  "/bank-details",
  standardLimiter,
  authorize("merchant"),
  validateUpdateBankDetails,
  payoutController.handleUpdateBankDetails,
);

// Request manual payout
router.post(
  "/request",
  standardLimiter,
  authorize("merchant"),
  validateRequestPayout,
  payoutController.handleRequestPayout,
);

// Get payout history
router.get(
  "/history",
  standardLimiter,
  authorize("merchant"),
  validateGetPayoutHistory,
  payoutController.handleGetPayoutHistory,
);

// Get single payout
router.get(
  "/:id",
  standardLimiter,
  authorize("merchant", "admin"),
  validatePayoutIdParam,
  payoutController.handleGetPayout,
);

// Cancel payout
router.patch(
  "/:id/cancel",
  standardLimiter,
  authorize("merchant"),
  validatePayoutIdParam,
  payoutController.handleCancelPayout,
);

// -------------------------------------------
// Admin routes
// -------------------------------------------

// Get pending bank verifications
router.get(
  "/admin/pending-verifications",
  standardLimiter,
  authorize("admin"),
  payoutController.handleGetPendingBankVerifications,
);

// Get pending payouts
router.get(
  "/admin/pending-payouts",
  standardLimiter,
  authorize("admin"),
  payoutController.handleGetPendingPayouts,
);

// Get seller balance (admin view)
router.get(
  "/admin/seller/:sellerId",
  standardLimiter,
  authorize("admin"),
  validateSellerIdParam,
  payoutController.handleGetSellerBalance,
);

// Verify seller bank details
router.patch(
  "/admin/verify/:sellerId",
  standardLimiter,
  authorize("admin"),
  validateSellerIdParam,
  payoutController.handleVerifyBankDetails,
);

// Process payout (complete/fail)
router.patch(
  "/admin/:id/process",
  standardLimiter,
  authorize("admin"),
  validateProcessPayout,
  payoutController.handleProcessPayout,
);

module.exports = router;
