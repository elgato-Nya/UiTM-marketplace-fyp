const mongoose = require("mongoose");
const {
  BankAccount,
  WithdrawalRequest,
  WalletTransaction,
} = require("../../models");
const {
  createValidationError,
  createNotFoundError,
} = require("../../utils/errors");
const logger = require("../../utils/logger");
const { getOrCreateSellerWallet } = require("../wallet/wallet.service");

const getMinWithdrawal = () => parseFloat(process.env.MIN_WITHDRAWAL) || 10;

const createWithdrawalRequest = async (sellerId, amount, bankAccountId) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const bankAccount = await BankAccount.findOne({ _id: bankAccountId, sellerId }).session(dbSession);
    if (!bankAccount) {
      throw createNotFoundError("Bank account", "BANK_ACCOUNT_NOT_FOUND");
    }

    const wallet = await getOrCreateSellerWallet(sellerId, dbSession);
    const minimum = getMinWithdrawal();

    if (amount < minimum) {
      throw createValidationError(
        `Minimum withdrawal amount is RM ${minimum}`,
        { amount, minimum },
        "WITHDRAWAL_BELOW_MINIMUM",
      );
    }

    if (wallet.availableBalance < amount) {
      throw createValidationError(
        "Withdrawal amount exceeds available balance",
        { availableBalance: wallet.availableBalance, amount },
        "WITHDRAWAL_INSUFFICIENT_BALANCE",
      );
    }

    wallet.availableBalance -= amount;
    await wallet.save({ session: dbSession });

    await WalletTransaction.create(
      [
        {
          sellerId,
          type: "debit",
          amount,
          platformFee: 0,
          netAmount: -amount,
          description: "Withdrawal request debit",
        },
      ],
      { session: dbSession },
    );

    const request = await WithdrawalRequest.create(
      [
        {
          sellerId,
          amount,
          bankAccountId,
          status: "pending",
        },
      ],
      { session: dbSession },
    );

    await dbSession.commitTransaction();

    logger.info("Withdrawal request created", {
      sellerId: sellerId.toString(),
      amount,
      requestId: request[0]._id.toString(),
    });

    return request[0];
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
};

const getSellerWithdrawalRequests = async (sellerId, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const status = options.status;
  const query = { sellerId };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    WithdrawalRequest.find(query)
      .populate("bankAccountId", "bankName accountNumber accountHolderName isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WithdrawalRequest.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

const getAllWithdrawalRequests = async (options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const status = options.status;
  const query = {};

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    WithdrawalRequest.find(query)
      .populate("sellerId", "profile.username email merchantDetails.shopName")
      .populate("bankAccountId", "bankName accountNumber accountHolderName isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WithdrawalRequest.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

const completeWithdrawalRequest = async (requestId, adminId, adminNote = "") => {
  const request = await WithdrawalRequest.findById(requestId);
  if (!request) {
    throw createNotFoundError("Withdrawal request", "WITHDRAWAL_NOT_FOUND");
  }

  if (request.status !== "pending") {
    throw createValidationError(
      "Withdrawal request is not pending",
      { status: request.status },
      "WITHDRAWAL_NOT_PENDING",
    );
  }

  request.status = "completed";
  request.adminNote = adminNote || request.adminNote;
  request.processedAt = new Date();
  request.processedBy = adminId;
  await request.save();

  return request;
};

const rejectWithdrawalRequest = async (requestId, adminId, adminNote = "") => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const request = await WithdrawalRequest.findById(requestId).session(dbSession);
    if (!request) {
      throw createNotFoundError("Withdrawal request", "WITHDRAWAL_NOT_FOUND");
    }

    if (request.status !== "pending") {
      throw createValidationError(
        "Withdrawal request is not pending",
        { status: request.status },
        "WITHDRAWAL_NOT_PENDING",
      );
    }

    const wallet = await getOrCreateSellerWallet(request.sellerId, dbSession);
    wallet.availableBalance += request.amount;
    await wallet.save({ session: dbSession });

    await WalletTransaction.create(
      [
        {
          sellerId: request.sellerId,
          type: "credit",
          amount: request.amount,
          platformFee: 0,
          netAmount: request.amount,
          description: `Refund for rejected withdrawal request ${request._id}`,
        },
      ],
      { session: dbSession },
    );

    request.status = "rejected";
    request.adminNote = adminNote || request.adminNote;
    request.processedAt = new Date();
    request.processedBy = adminId;
    await request.save({ session: dbSession });

    await dbSession.commitTransaction();

    return request;
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
};

const getAdminWalletSummary = async () => {
  const [feeAgg] = await WalletTransaction.aggregate([
    { $match: { type: "fee" } },
    { $group: { _id: null, totalFeesCollected: { $sum: "$amount" } } },
  ]);

  const [pendingAgg] = await WithdrawalRequest.aggregate([
    { $match: { status: "pending" } },
    { $group: { _id: null, totalPendingWithdrawals: { $sum: "$amount" } } },
  ]);

  const [paidOutAgg] = await WithdrawalRequest.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, totalPaidOut: { $sum: "$amount" } } },
  ]);

  return {
    totalFeesCollected: feeAgg?.totalFeesCollected || 0,
    totalPendingWithdrawals: pendingAgg?.totalPendingWithdrawals || 0,
    totalPaidOut: paidOutAgg?.totalPaidOut || 0,
  };
};

const getAdminWalletTransactions = async (options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const type = options.type;
  const skip = (page - 1) * limit;
  const query = {};

  if (type) {
    query.type = type;
  }

  const [items, total] = await Promise.all([
    WalletTransaction.find(query)
      .populate("sellerId", "profile.username email merchantDetails.shopName")
      .populate("orderId", "orderNumber totalAmount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WalletTransaction.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

module.exports = {
  createWithdrawalRequest,
  getSellerWithdrawalRequests,
  getAllWithdrawalRequests,
  completeWithdrawalRequest,
  rejectWithdrawalRequest,
  getAdminWalletSummary,
  getAdminWalletTransactions,
};