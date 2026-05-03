const BaseController = require("../base.controller");
const asyncHandler = require("../../utils/asyncHandler");
const { User } = require("../../models");
const withdrawalService = require("../../services/withdrawal/withdrawal.service");
const { runPaymentMaintenance } = require("../../jobs/payment.job");

const baseController = new BaseController();

/**
 * Get all withdrawal requests with optional status filter.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends withdrawal request list
 */
const handleGetWithdrawals = asyncHandler(async (req, res) => {
  const result = await withdrawalService.getAllWithdrawalRequests({
    status: req.query.status,
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 20,
  });

  return baseController.sendSuccess(res, result, "Withdrawal requests retrieved successfully");
}, "handle_admin_get_withdrawals");

/**
 * Mark withdrawal request as completed.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends completed withdrawal request
 */
const handleCompleteWithdrawal = asyncHandler(async (req, res) => {
  const result = await withdrawalService.completeWithdrawalRequest(
    req.params.id,
    req.user._id,
    req.body.adminNote,
  );

  return baseController.sendSuccess(res, result, "Withdrawal marked as completed");
}, "handle_admin_complete_withdrawal");

/**
 * Reject withdrawal request and refund balance.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends rejected withdrawal request
 */
const handleRejectWithdrawal = asyncHandler(async (req, res) => {
  const result = await withdrawalService.rejectWithdrawalRequest(
    req.params.id,
    req.user._id,
    req.body.adminNote,
  );

  return baseController.sendSuccess(res, result, "Withdrawal rejected and refunded");
}, "handle_admin_reject_withdrawal");

/**
 * Get wallet summary metrics.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends wallet summary
 */
const handleGetWalletSummary = asyncHandler(async (req, res) => {
  const summary = await withdrawalService.getAdminWalletSummary();
  return baseController.sendSuccess(res, summary, "Wallet summary retrieved successfully");
}, "handle_admin_wallet_summary");

/**
 * Get wallet transactions across the platform.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends paginated wallet transactions
 */
const handleGetWalletTransactions = asyncHandler(async (req, res) => {
  const result = await withdrawalService.getAdminWalletTransactions({
    type: req.query.type,
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 20,
  });

  return baseController.sendSuccess(res, result, "Wallet transactions retrieved successfully");
}, "handle_admin_wallet_transactions");

/**
 * Approve seller verified badge.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends updated seller record
 */
const handleVerifyBadge = asyncHandler(async (req, res) => {
  const seller = await User.findById(req.params.id);
  if (!seller) {
    return baseController.sendError(res, "Seller not found", 404, "SELLER_NOT_FOUND");
  }

  seller.merchantDetails = seller.merchantDetails || {};
  seller.merchantDetails.isUiTMVerified = true;
  seller.merchantDetails.verificationStatus = "verified";
  seller.merchantDetails.permanentVerification = true;
  seller.merchantDetails.verificationDate = new Date();
  await seller.save();

  return baseController.sendSuccess(
    res,
    {
      sellerId: seller._id,
      isUiTMVerified: seller.merchantDetails.isUiTMVerified,
    },
    "Verified badge approved",
  );
}, "handle_admin_verify_badge");

/**
 * Manually trigger payment maintenance for staging/debug/ops.
 * Admin-only and rate-limited at route level.
 * Returns only safe summary counters.
 */
const handleRunPaymentMaintenance = asyncHandler(async (req, res) => {
  const summary = await runPaymentMaintenance();

  return baseController.sendSuccess(
    res,
    {
      expiredOrdersCount: summary.expiredOrdersCount,
      stockRestoredCount: summary.stockRestoredCount,
      reconciliationCheckedCount: summary.reconciliationCheckedCount,
      potentialPaidFindingsCount: summary.potentialPaidFindingsCount,
    },
    "Payment maintenance completed",
  );
}, "handle_admin_run_payment_maintenance");

module.exports = {
  handleGetWithdrawals,
  handleCompleteWithdrawal,
  handleRejectWithdrawal,
  handleGetWalletSummary,
  handleGetWalletTransactions,
  handleVerifyBadge,
  handleRunPaymentMaintenance,
};
