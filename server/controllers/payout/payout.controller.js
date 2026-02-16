const BaseController = require("../base.controller");
const payoutService = require("../../services/payout");
const asyncHandler = require("../../utils/asyncHandler");

const baseController = new BaseController();

// -------------------------------------------
// Seller handlers
// -------------------------------------------

const handleGetBalance = asyncHandler(async (req, res) => {
  const { page, limit, type } = req.query;

  const result = await payoutService.getBalanceWithTransactions(req.user._id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    type,
  });

  baseController.sendSuccess(res, result, "Balance retrieved");
}, "handleGetBalance");

const handleUpdatePayoutSettings = asyncHandler(async (req, res) => {
  const { schedule, autoPayoutEnabled, minimumPayoutAmount } = req.body;

  const balance = await payoutService.updatePayoutSettings(req.user._id, {
    schedule,
    autoPayoutEnabled,
    minimumPayoutAmount,
  });

  baseController.logAction("payout_settings_updated", req, {
    schedule: balance.payoutSettings.schedule,
    autoPayoutEnabled: balance.payoutSettings.autoPayoutEnabled,
  });

  baseController.sendSuccess(
    res,
    balance.payoutSettings,
    "Payout settings updated",
  );
}, "handleUpdatePayoutSettings");

const handleUpdateBankDetails = asyncHandler(async (req, res) => {
  const { bankName, bankCode, accountNumber, accountHolderName } = req.body;

  const result = await payoutService.updateBankDetails(req.user._id, {
    bankName,
    bankCode,
    accountNumber,
    accountHolderName,
  });

  baseController.logAction("bank_details_updated", req, {
    bankName,
    accountNumberLast4: accountNumber.slice(-4),
  });

  baseController.sendSuccess(res, result, "Bank details updated");
}, "handleUpdateBankDetails");

const handleRequestPayout = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const payout = await payoutService.requestPayout(req.user._id, amount);

  baseController.logAction("payout_requested", req, {
    payoutId: payout._id,
    amount: payout.amount,
  });

  baseController.sendSuccess(res, payout, "Payout requested", 201);
}, "handleRequestPayout");

const handleGetPayoutHistory = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;

  const result = await payoutService.getPayoutHistory(req.user._id, {
    status,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  });

  baseController.sendSuccess(res, result, "Payout history retrieved");
}, "handleGetPayoutHistory");

const handleGetPayout = asyncHandler(async (req, res) => {
  const payout = await payoutService.getPayoutById(
    req.params.id,
    req.user._id,
    req.user.roles,
  );

  baseController.sendSuccess(res, payout, "Payout details retrieved");
}, "handleGetPayout");

const handleCancelPayout = asyncHandler(async (req, res) => {
  const payout = await payoutService.cancelPayout(req.params.id, req.user._id);

  baseController.logAction("payout_cancelled", req, {
    payoutId: payout._id,
    amount: payout.amount,
  });

  baseController.sendSuccess(res, payout, "Payout cancelled");
}, "handleCancelPayout");

// -------------------------------------------
// Admin handlers
// -------------------------------------------

const handleVerifyBankDetails = asyncHandler(async (req, res) => {
  const balance = await payoutService.verifyBankDetails(
    req.params.sellerId,
    req.user._id,
  );

  baseController.logAction("bank_details_verified", req, {
    sellerId: req.params.sellerId,
  });

  baseController.sendSuccess(res, balance, "Bank details verified");
}, "handleVerifyBankDetails");

const handleProcessPayout = asyncHandler(async (req, res) => {
  const { success, bankReference, failureReason, failureMessage } = req.body;

  const payout = await payoutService.processPayout(
    req.params.id,
    req.user._id,
    {
      success,
      bankReference,
      failureReason,
      failureMessage,
    },
  );

  baseController.logAction(
    success ? "payout_completed" : "payout_failed",
    req,
    {
      payoutId: payout._id,
      status: payout.status,
    },
  );

  baseController.sendSuccess(
    res,
    payout,
    success ? "Payout completed" : "Payout marked as failed",
  );
}, "handleProcessPayout");

const handleGetSellerBalance = asyncHandler(async (req, res) => {
  const result = await payoutService.getBalanceWithTransactions(
    req.params.sellerId,
    {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      type: req.query.type,
    },
  );

  baseController.sendSuccess(res, result, "Seller balance retrieved");
}, "handleGetSellerBalance");

const handleGetPendingBankVerifications = asyncHandler(async (req, res) => {
  const result = await payoutService.getPendingBankVerifications({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
  });

  baseController.sendSuccess(
    res,
    result,
    "Pending bank verifications retrieved",
  );
}, "handleGetPendingBankVerifications");

const handleGetPendingPayouts = asyncHandler(async (req, res) => {
  const result = await payoutService.getPendingPayouts({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    status: req.query.status || "pending",
  });

  baseController.sendSuccess(res, result, "Pending payouts retrieved");
}, "handleGetPendingPayouts");

module.exports = {
  handleGetBalance,
  handleUpdatePayoutSettings,
  handleUpdateBankDetails,
  handleRequestPayout,
  handleGetPayoutHistory,
  handleGetPayout,
  handleCancelPayout,
  handleVerifyBankDetails,
  handleProcessPayout,
  handleGetSellerBalance,
  handleGetPendingBankVerifications,
  handleGetPendingPayouts,
};
