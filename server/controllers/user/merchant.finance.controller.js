const mongoose = require("mongoose");
const BaseController = require("../base.controller");
const asyncHandler = require("../../utils/asyncHandler");
const {
  BankAccount,
  FeaturedListing,
  SellerPlan,
  Listing,
} = require("../../models");
const {
  createValidationError,
  createNotFoundError,
} = require("../../utils/errors");
const logger = require("../../utils/logger");
const walletService = require("../../services/wallet/wallet.service");
const planService = require("../../services/plan/plan.service");
const withdrawalService = require("../../services/withdrawal/withdrawal.service");
const { createBill } = require("../../services/payment/toyyibpay.service");

const baseController = new BaseController();

/**
 * Get seller wallet summary.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends wallet summary and transactions
 */
const handleGetWallet = asyncHandler(async (req, res) => {
  const result = await walletService.getWalletWithTransactions(req.user._id, {
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 20,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Wallet retrieved successfully",
  );
}, "handle_get_wallet");

/**
 * Get seller wallet transaction history.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends paginated wallet transactions
 */
const handleGetWalletTransactions = asyncHandler(async (req, res) => {
  const result = await walletService.getWalletWithTransactions(req.user._id, {
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 20,
  });

  return baseController.sendSuccess(
    res,
    result.transactions,
    "Wallet transactions retrieved successfully",
  );
}, "handle_get_wallet_transactions");

/**
 * Register or update a seller bank account.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends saved bank account data
 */
const handleRegisterBankAccount = asyncHandler(async (req, res) => {
  const { bankName, accountNumber, accountHolderName } = req.body;

  const bankAccount = await BankAccount.findOneAndUpdate(
    { sellerId: req.user._id },
    {
      sellerId: req.user._id,
      bankName,
      accountNumber,
      accountHolderName,
      isVerified: false,
    },
    { new: true, upsert: true, runValidators: true },
  );

  baseController.logAction("seller_bank_account_saved", req, {
    sellerId: req.user._id.toString(),
    bankAccountId: bankAccount._id.toString(),
  });

  return baseController.sendSuccess(
    res,
    bankAccount,
    "Bank account saved successfully",
    201,
  );
}, "handle_register_bank_account");

/**
 * Submit a withdrawal request.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends pending withdrawal request
 */
const handleSubmitWithdrawal = asyncHandler(async (req, res) => {
  const { amount, bankAccountId } = req.body;

  const withdrawalRequest = await withdrawalService.createWithdrawalRequest(
    req.user._id,
    Number(amount),
    bankAccountId,
  );

  baseController.logAction("withdrawal_request_created", req, {
    sellerId: req.user._id.toString(),
    withdrawalRequestId: withdrawalRequest._id.toString(),
    amount: withdrawalRequest.amount,
  });

  return baseController.sendSuccess(
    res,
    withdrawalRequest,
    "Withdrawal request submitted successfully",
    201,
  );
}, "handle_submit_withdrawal");

/**
 * Get seller withdrawal requests.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends paginated withdrawal requests
 */
const handleGetWithdrawals = asyncHandler(async (req, res) => {
  const result = await withdrawalService.getSellerWithdrawalRequests(
    req.user._id,
    {
      status: req.query.status,
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 20,
    },
  );

  return baseController.sendSuccess(
    res,
    result,
    "Withdrawal requests retrieved successfully",
  );
}, "handle_get_withdrawals");

/**
 * Get current seller plan details.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends current plan and limits
 */
const handleGetPlan = asyncHandler(async (req, res) => {
  const plan = await planService.getActiveSellerPlan(req.user._id);

  return baseController.sendSuccess(
    res,
    {
      planType: plan.planType,
      isActive: plan.isActive,
      startedAt: plan.startedAt,
      expiresAt: plan.expiresAt,
      feeRate: plan.rules.feeRate,
      listingLimit: plan.rules.listingLimit,
      freeFeaturedSlotsPerMonth: plan.rules.freeFeaturedSlotsPerMonth,
      freeFeaturedSlotsUsed: plan.freeFeaturedSlotsUsed,
      freeFeaturedSlotsMonthKey: plan.freeFeaturedSlotsMonthKey,
    },
    "Seller plan retrieved successfully",
  );
}, "handle_get_plan");

/**
 * Create ToyyibPay bill for plan upgrade.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends bill details for plan upgrade
 */
const handleUpgradePlan = asyncHandler(async (req, res) => {
  const amount = Number(process.env.PRO_PLAN_PRICE || 9);
  const referenceNo = `PLAN-${req.user._id.toString()}-${Date.now()}`;
  const tempOrder = {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: `PLAN-${Date.now()}`,
    buyer: { userId: req.user._id },
    seller: { userId: req.user._id },
    totalAmount: amount,
    paymentDetails: {},
  };

  const bill = await createBill({
    orderId: tempOrder._id,
    order: tempOrder,
    persistOrder: false,
    amount,
    externalReferenceNo: referenceNo,
    description: "MarKet pro plan upgrade",
    returnUrl: req.body.returnUrl,
    callbackUrl: req.body.callbackUrl,
  });

  await require("../../models").PaymentReference.create({
    referenceNo,
    billCode: bill.billCode,
    sellerId: req.user._id,
    purpose: "plan_upgrade",
    planType: "pro",
    amount,
    status: "pending",
    metadata: {
      billUrl: bill.billUrl,
      currentPlanType: req.body.planType || "pro",
    },
  });

  return baseController.sendSuccess(
    res,
    {
      billCode: bill.billCode,
      billUrl: bill.billUrl,
      referenceNo,
    },
    "Plan upgrade bill created",
    201,
  );
}, "handle_upgrade_plan");

/**
 * Purchase a featured listing slot.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends featured listing record
 */
const handlePurchaseFeaturedListing = asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  const listing = await Listing.findOne({
    _id: listingId,
    "seller.userId": req.user._id,
  });

  if (!listing) {
    throw createNotFoundError("Listing", "LISTING_NOT_FOUND");
  }

  const plan = await planService.getActiveSellerPlan(req.user._id);
  const now = new Date();
  const monthKey = planService.getMonthKey(now);
  const freeSlotsAllowed = plan.rules.freeFeaturedSlotsPerMonth || 0;
  let source = "wallet";
  let amountPaid = Number(process.env.FEATURED_SLOT_PRICE) || 5;

  const sellerPlanDoc = plan.virtual
    ? null
    : await SellerPlan.findById(plan.planId);
  if (sellerPlanDoc && sellerPlanDoc.freeFeaturedSlotsMonthKey !== monthKey) {
    sellerPlanDoc.freeFeaturedSlotsUsed = 0;
    sellerPlanDoc.freeFeaturedSlotsMonthKey = monthKey;
    await sellerPlanDoc.save();
  }

  if (
    sellerPlanDoc &&
    plan.planType === "pro" &&
    sellerPlanDoc.freeFeaturedSlotsUsed < freeSlotsAllowed
  ) {
    source = "free_slot";
    amountPaid = 0;
    sellerPlanDoc.freeFeaturedSlotsUsed += 1;
    sellerPlanDoc.freeFeaturedSlotsMonthKey = monthKey;
    await sellerPlanDoc.save();
  }

  if (source === "wallet") {
    const result = await walletService.debitForWithdrawal({
      sellerId: req.user._id,
      amount: amountPaid,
      description: `Featured listing slot for ${listing._id}`,
    });

    logger.info("Featured listing charged to wallet", {
      sellerId: req.user._id.toString(),
      listingId: listing._id.toString(),
      amountPaid,
      remainingBalance: result.wallet.availableBalance,
    });
  }

  const featuredListing = await FeaturedListing.create({
    listingId: listing._id,
    sellerId: req.user._id,
    startsAt: now,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    amountPaid,
    source,
  });

  return baseController.sendSuccess(
    res,
    featuredListing,
    "Featured listing purchased successfully",
    201,
  );
}, "handle_purchase_featured_listing");

module.exports = {
  handleGetWallet,
  handleGetWalletTransactions,
  handleRegisterBankAccount,
  handleSubmitWithdrawal,
  handleGetWithdrawals,
  handleGetPlan,
  handleUpgradePlan,
  handlePurchaseFeaturedListing,
};
