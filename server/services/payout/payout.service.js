const {
  SellerBalance,
  SellerPayout,
  BalanceTransaction,
  User,
} = require("../../models");
const {
  createForbiddenError,
  createValidationError,
  createNotFoundError,
} = require("../../utils/errors");
const {
  handleServiceError,
  handleNotFoundError,
  buildSort,
} = require("../base.service");
const {
  PayoutStatus,
  PayoutSchedule,
  PayoutLimits,
  PayoutTransactionType,
} = require("../../utils/enums/payout.enum");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/notification.service");
const { NotificationType } = require("../../utils/enums/notification.enum");

// Get or create seller balance
const getSellerBalance = async (sellerId) => {
  try {
    let balance = await SellerBalance.findOne({ sellerId });

    if (!balance) {
      balance = new SellerBalance({ sellerId });
      await balance.save();
      logger.info("Created new seller balance record", { sellerId });
    }

    return balance;
  } catch (error) {
    handleServiceError(error, "get_seller_balance", { sellerId });
  }
};

// Get balance with transaction history
const getBalanceWithTransactions = async (sellerId, options = {}) => {
  try {
    const { page = 1, limit = 20, type } = options;

    const balance = await getSellerBalance(sellerId);

    const transactionQuery = { sellerId };
    if (type) {
      transactionQuery.type = type;
    }

    const skip = (page - 1) * limit;

    const [transactions, totalTransactions] = await Promise.all([
      BalanceTransaction.find(transactionQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BalanceTransaction.countDocuments(transactionQuery),
    ]);

    return {
      balance: {
        available: balance.availableBalance,
        pending: balance.pendingBalance,
        total: balance.totalBalance,
        totalEarned: balance.totalEarned,
        totalPaidOut: balance.totalPaidOut,
      },
      payoutSettings: balance.payoutSettings,
      bankDetails: {
        bankName: balance.bankDetails?.bankName,
        accountNumber: balance.bankDetails?.accountNumber
          ? `****${balance.bankDetails.accountNumber.slice(-4)}`
          : null,
        accountHolderName: balance.bankDetails?.accountHolderName,
        isVerified: balance.bankDetails?.isVerified || false,
      },
      canRequestPayout: balance.canRequestPayout,
      daysUntilForcedPayout: balance.daysUntilForcedPayout,
      nextScheduledPayout: balance.nextScheduledPayout,
      transactions: {
        items: transactions,
        total: totalTransactions,
        page,
        limit,
        totalPages: Math.ceil(totalTransactions / limit),
      },
    };
  } catch (error) {
    handleServiceError(error, "get_balance_with_transactions", { sellerId });
  }
};

// Update payout settings
const updatePayoutSettings = async (sellerId, settings) => {
  try {
    const { schedule, autoPayoutEnabled, minimumPayoutAmount } = settings;

    const balance = await getSellerBalance(sellerId);

    if (schedule) {
      balance.payoutSettings.schedule = schedule;
    }

    if (autoPayoutEnabled !== undefined) {
      balance.payoutSettings.autoPayoutEnabled = autoPayoutEnabled;
    }

    if (minimumPayoutAmount !== undefined) {
      if (minimumPayoutAmount < PayoutLimits.MIN_PAYOUT_AMOUNT) {
        throw createValidationError(
          `Minimum payout amount must be at least RM ${PayoutLimits.MIN_PAYOUT_AMOUNT}`,
          { minimumPayoutAmount },
          "INVALID_MINIMUM_AMOUNT",
        );
      }
      balance.payoutSettings.minimumPayoutAmount = minimumPayoutAmount;
    }

    // Recalculate next scheduled payout
    balance.calculateNextScheduledPayout();

    await balance.save();

    logger.info("Payout settings updated", {
      sellerId,
      newSettings: balance.payoutSettings,
    });

    return balance;
  } catch (error) {
    handleServiceError(error, "update_payout_settings", { sellerId });
  }
};

// Update bank details
const updateBankDetails = async (sellerId, bankDetails) => {
  try {
    const { bankName, bankCode, accountNumber, accountHolderName } =
      bankDetails;

    const balance = await getSellerBalance(sellerId);

    balance.bankDetails = {
      bankName,
      bankCode,
      accountNumber,
      accountHolderName,
      isVerified: false, // Reset verification on update
      verifiedAt: null,
    };

    await balance.save();

    logger.info("Bank details updated", {
      sellerId,
      bankName,
      accountNumberLast4: accountNumber.slice(-4),
    });

    return {
      bankName: balance.bankDetails.bankName,
      accountNumber: `****${balance.bankDetails.accountNumber.slice(-4)}`,
      accountHolderName: balance.bankDetails.accountHolderName,
      isVerified: balance.bankDetails.isVerified,
    };
  } catch (error) {
    handleServiceError(error, "update_bank_details", { sellerId });
  }
};

// Request manual payout
const requestPayout = async (sellerId, amount = null) => {
  try {
    const balance = await getSellerBalance(sellerId);

    // Validate bank details
    if (!balance.bankDetails?.isVerified) {
      throw createValidationError(
        "Bank account must be verified before requesting payout",
        { sellerId },
        "BANK_NOT_VERIFIED",
      );
    }

    // Validate minimum amount
    const payoutAmount = amount || balance.availableBalance;

    if (payoutAmount < PayoutLimits.MIN_PAYOUT_AMOUNT) {
      throw createValidationError(
        `Minimum payout amount is RM ${PayoutLimits.MIN_PAYOUT_AMOUNT}`,
        {
          requestedAmount: payoutAmount,
          minimum: PayoutLimits.MIN_PAYOUT_AMOUNT,
        },
        "BELOW_MINIMUM_PAYOUT",
      );
    }

    if (payoutAmount > balance.availableBalance) {
      throw createValidationError(
        "Requested amount exceeds available balance",
        { requestedAmount: payoutAmount, available: balance.availableBalance },
        "INSUFFICIENT_BALANCE",
      );
    }

    // Check for pending payouts
    const pendingPayout = await SellerPayout.findOne({
      sellerId,
      status: { $in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING] },
    });

    if (pendingPayout) {
      throw createValidationError(
        "You have a pending payout request. Please wait for it to complete.",
        { pendingPayoutId: pendingPayout._id },
        "PENDING_PAYOUT_EXISTS",
      );
    }

    // Create payout request
    const payout = new SellerPayout({
      sellerId,
      amount: payoutAmount,
      processingFee: 0, // No fee for now
      netAmount: payoutAmount,
      requestType: "manual",
      bankDetailsSnapshot: {
        bankName: balance.bankDetails.bankName,
        bankCode: balance.bankDetails.bankCode,
        accountNumber: balance.bankDetails.accountNumber,
        accountHolderName: balance.bankDetails.accountHolderName,
      },
    });

    await payout.save();

    // Deduct from balance
    balance.deductForPayout(payoutAmount);
    balance.lastPayout.payoutId = payout._id;
    await balance.save();

    // Create transaction record
    await BalanceTransaction.createPayoutTransaction({
      sellerId,
      payoutId: payout._id,
      amount: payoutAmount,
      currentBalance: balance.availableBalance,
    });

    logger.info("Payout requested", {
      sellerId,
      payoutId: payout._id,
      amount: payoutAmount,
    });

    // Fire-and-forget: confirm payout request to seller
    createNotification({
      userId: sellerId,
      type: NotificationType.PAYOUT_PROCESSED,
      title: "Payout Requested",
      message: `Your payout request of RM ${payoutAmount.toFixed(2)} has been submitted and is pending processing.`,
      data: {
        payoutId: payout._id,
        amount: payoutAmount,
        status: "pending",
      },
    }).catch((err) =>
      logger.error("Failed to send payout requested notification", {
        error: err.message,
        sellerId,
      })
    );

    return payout;
  } catch (error) {
    handleServiceError(error, "request_payout", { sellerId });
  }
};

// Get payout history
const getPayoutHistory = async (sellerId, options = {}) => {
  try {
    const { status, page = 1, limit = 10 } = options;

    const query = { sellerId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      SellerPayout.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SellerPayout.countDocuments(query),
    ]);

    return {
      payouts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handleServiceError(error, "get_payout_history", { sellerId });
  }
};

// Get single payout details
const getPayoutById = async (payoutId, sellerId, userRoles) => {
  try {
    const payout = await SellerPayout.findById(payoutId);

    if (!payout) {
      throw createNotFoundError("Payout");
    }

    const isOwner = payout.sellerId.toString() === sellerId.toString();
    const isAdmin = userRoles && userRoles.includes("admin");

    if (!isOwner && !isAdmin) {
      throw createForbiddenError("You can only view your own payouts");
    }

    return payout;
  } catch (error) {
    handleServiceError(error, "get_payout_by_id", { payoutId, sellerId });
  }
};

// Cancel payout (only if pending)
const cancelPayout = async (payoutId, sellerId) => {
  try {
    const payout = await SellerPayout.findById(payoutId);

    if (!payout) {
      throw createNotFoundError("Payout");
    }

    if (payout.sellerId.toString() !== sellerId.toString()) {
      throw createForbiddenError("You can only cancel your own payouts");
    }

    if (!payout.canCancel) {
      throw createValidationError(
        "This payout cannot be cancelled",
        { status: payout.status },
        "CANNOT_CANCEL_PAYOUT",
      );
    }

    // Restore balance
    const balance = await getSellerBalance(sellerId);
    balance.availableBalance += payout.amount;
    balance.totalPaidOut -= payout.amount;
    await balance.save();

    // Update payout status
    payout.cancel(sellerId, "Cancelled by seller");
    await payout.save();

    // Create reversal transaction
    await BalanceTransaction.create({
      sellerId,
      type: PayoutTransactionType.ADJUSTMENT,
      amount: payout.amount,
      balanceAfter: balance.availableBalance,
      description: "Payout cancelled - funds restored",
      reference: {
        refType: "SellerPayout",
        refId: payout._id,
      },
    });

    logger.info("Payout cancelled", {
      payoutId,
      sellerId,
      amount: payout.amount,
    });

    return payout;
  } catch (error) {
    handleServiceError(error, "cancel_payout", { payoutId, sellerId });
  }
};

// Admin: Verify bank details
const verifyBankDetails = async (sellerId, adminId) => {
  try {
    const balance = await getSellerBalance(sellerId);

    if (!balance.bankDetails?.accountNumber) {
      throw createValidationError(
        "No bank details to verify",
        { sellerId },
        "NO_BANK_DETAILS",
      );
    }

    balance.bankDetails.isVerified = true;
    balance.bankDetails.verifiedAt = new Date();
    await balance.save();

    logger.info("Bank details verified by admin", {
      sellerId,
      adminId,
    });

    // Fire-and-forget: notify seller that bank details were verified
    createNotification({
      userId: sellerId,
      type: NotificationType.PAYOUT_PROCESSED,
      title: "Bank Account Verified",
      message: "Your bank account details have been verified by our team. You can now request payouts.",
      data: {
        bankName: balance.bankDetails.bankName,
        verifiedBy: adminId,
      },
    }).catch((err) =>
      logger.error("Failed to send bank verified notification", {
        error: err.message,
        sellerId,
      })
    );

    return balance;
  } catch (error) {
    handleServiceError(error, "verify_bank_details", { sellerId, adminId });
  }
};

// Admin: Process payout (mark as completed or failed)
const processPayout = async (payoutId, adminId, result) => {
  try {
    const { success, bankReference, failureReason, failureMessage } = result;

    const payout = await SellerPayout.findById(payoutId);

    if (!payout) {
      throw createNotFoundError("Payout");
    }

    if (
      payout.status !== PayoutStatus.PENDING &&
      payout.status !== PayoutStatus.PROCESSING
    ) {
      throw createValidationError(
        "Payout is not in processable status",
        { status: payout.status },
        "INVALID_PAYOUT_STATUS",
      );
    }

    if (success) {
      payout.markCompleted(bankReference);
      logger.info("Payout completed", {
        payoutId,
        adminId,
        bankReference,
      });
    } else {
      payout.markFailed(failureReason, failureMessage);

      // Restore balance if payout failed
      const balance = await getSellerBalance(payout.sellerId);
      balance.availableBalance += payout.amount;
      balance.totalPaidOut -= payout.amount;
      await balance.save();

      logger.warn("Payout failed", {
        payoutId,
        adminId,
        failureReason,
        failureMessage,
      });
    }

    await payout.save();

    // Fire-and-forget: notify seller about payout result
    const payoutNotifTitle = success ? "Payout Completed" : "Payout Failed";
    const payoutNotifMsg = success
      ? `Your payout of RM ${payout.amount.toFixed(2)} has been processed and transferred to your bank account.`
      : `Your payout of RM ${payout.amount.toFixed(2)} has failed. ${failureMessage || "The funds have been restored to your balance."}  Please check your bank details.`;
    createNotification({
      userId: payout.sellerId,
      type: NotificationType.PAYOUT_PROCESSED,
      title: payoutNotifTitle,
      message: payoutNotifMsg,
      data: {
        payoutId,
        amount: payout.amount,
        success,
        bankReference: bankReference || null,
        failureReason: failureReason || null,
      },
    }).catch((err) =>
      logger.error("Failed to send payout result notification", {
        error: err.message,
        payoutId,
      })
    );

    return payout;
  } catch (error) {
    handleServiceError(error, "process_payout", { payoutId, adminId });
  }
};

// Add earnings to seller balance (called when order completes)
const addEarnings = async (
  sellerId,
  orderId,
  orderNumber,
  amount,
  platformFeeRate = 0,
) => {
  try {
    const balance = await getSellerBalance(sellerId);

    const platformFee = amount * platformFeeRate;
    const netAmount = amount - platformFee;

    balance.addToAvailable(netAmount, new Date());

    if (platformFee > 0) {
      balance.deductPlatformFee(platformFee);
    }

    await balance.save();

    // Create transaction record
    await BalanceTransaction.createOrderPayment({
      sellerId,
      orderId,
      orderNumber,
      grossAmount: amount,
      platformFee,
      stripeFee: 0,
      currentBalance: balance.availableBalance,
    });

    logger.info("Earnings added to seller balance", {
      sellerId,
      orderId,
      grossAmount: amount,
      platformFee,
      netAmount,
    });

    return balance;
  } catch (error) {
    handleServiceError(error, "add_earnings", { sellerId, orderId });
  }
};

// Admin: Get all sellers with pending bank verification
const getPendingBankVerifications = async (options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Find all seller balances with bank details that are not verified
    const query = {
      "bankDetails.accountNumber": { $exists: true, $ne: null },
      "bankDetails.isVerified": false,
    };

    const [balances, total] = await Promise.all([
      SellerBalance.find(query)
        .populate("sellerId", "profile.username email merchantDetails.shopName")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      SellerBalance.countDocuments(query),
    ]);

    return {
      items: balances.map((b) => ({
        sellerId: b.sellerId._id,
        username: b.sellerId.profile?.username,
        email: b.sellerId.email,
        shopName: b.sellerId.merchantDetails?.shopName,
        bankDetails: {
          bankName: b.bankDetails.bankName,
          accountNumber: `****${b.bankDetails.accountNumber.slice(-4)}`,
          accountHolderName: b.bankDetails.accountHolderName,
        },
        availableBalance: b.availableBalance,
        updatedAt: b.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handleServiceError(error, "get_pending_bank_verifications");
  }
};

// Admin: Get all pending payouts
const getPendingPayouts = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status = "pending" } = options;
    const skip = (page - 1) * limit;

    const query = { status };

    const [payouts, total] = await Promise.all([
      SellerPayout.find(query)
        .populate("sellerId", "profile.username email merchantDetails.shopName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SellerPayout.countDocuments(query),
    ]);

    return {
      items: payouts.map((p) => ({
        _id: p._id,
        sellerId: p.sellerId._id,
        username: p.sellerId.profile?.username,
        email: p.sellerId.email,
        shopName: p.sellerId.merchantDetails?.shopName,
        amount: p.amount,
        status: p.status,
        bankDetails: {
          bankName: p.bankDetails?.bankName,
          accountNumber: p.bankDetails?.accountNumber
            ? `****${p.bankDetails.accountNumber.slice(-4)}`
            : null,
        },
        createdAt: p.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handleServiceError(error, "get_pending_payouts");
  }
};

module.exports = {
  getSellerBalance,
  getBalanceWithTransactions,
  updatePayoutSettings,
  updateBankDetails,
  requestPayout,
  getPayoutHistory,
  getPayoutById,
  cancelPayout,
  verifyBankDetails,
  processPayout,
  addEarnings,
  getPendingBankVerifications,
  getPendingPayouts,
};
