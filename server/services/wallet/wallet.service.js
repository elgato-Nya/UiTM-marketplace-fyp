const mongoose = require("mongoose");
const {
  SellerWallet,
  WalletTransaction,
} = require("../../models");
const { createValidationError } = require("../../utils/errors");
const logger = require("../../utils/logger");

const getOrCreateSellerWallet = async (sellerId, session = null) => {
  let wallet = await SellerWallet.findOne({ sellerId }).session(session);
  if (!wallet) {
    wallet = new SellerWallet({ sellerId });
    await wallet.save({ session });
    logger.info("Created seller wallet", { sellerId: sellerId.toString() });
  }
  return wallet;
};

const hasCreditTransaction = async (sellerId, orderId, session = null) => {
  const query = { sellerId, orderId, type: "credit" };
  const existing = await WalletTransaction.findOne(query).session(session);
  return !!existing;
};

const creditFromOrder = async ({
  sellerId,
  orderId,
  orderNumber,
  grossAmount,
  platformFee,
  netAmount,
  description,
}) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    if (await hasCreditTransaction(sellerId, orderId, dbSession)) {
      await dbSession.abortTransaction();
      return { duplicated: true };
    }

    const wallet = await getOrCreateSellerWallet(sellerId, dbSession);
    wallet.credit(netAmount);
    await wallet.save({ session: dbSession });

    await WalletTransaction.insertMany(
      [
        {
          sellerId,
          orderId,
          type: "credit",
          amount: netAmount,
          platformFee,
          netAmount,
          description:
            description || `Order payment credited for ${orderNumber}`,
        },
        {
          sellerId,
          orderId,
          type: "fee",
          amount: platformFee,
          platformFee,
          netAmount: 0,
          description: `Platform fee logged for ${orderNumber}`,
        },
      ],
      { session: dbSession, ordered: true },
    );

    await dbSession.commitTransaction();

    return {
      duplicated: false,
      wallet: wallet.toObject(),
      transaction: {
        sellerId,
        orderId,
        grossAmount,
        platformFee,
        netAmount,
      },
    };
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
};

const debitForWithdrawal = async ({ sellerId, amount, description }) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const wallet = await getOrCreateSellerWallet(sellerId, dbSession);
    if (wallet.availableBalance < amount) {
      throw createValidationError(
        "Insufficient wallet balance",
        { availableBalance: wallet.availableBalance, requested: amount },
        "INSUFFICIENT_WALLET_BALANCE",
      );
    }

    wallet.debit(amount);
    await wallet.save({ session: dbSession });

    const transaction = await WalletTransaction.insertMany(
      [
        {
          sellerId,
          type: "debit",
          amount,
          platformFee: 0,
          netAmount: -amount,
          description: description || "Wallet withdrawal debit",
        },
      ],
      { session: dbSession, ordered: true },
    );

    await dbSession.commitTransaction();
    return { wallet: wallet.toObject(), transaction: transaction[0].toObject() };
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
};

const refundWallet = async ({ sellerId, amount, description }) => {
  const wallet = await getOrCreateSellerWallet(sellerId);
  wallet.credit(amount);
  await wallet.save();

  const transaction = await WalletTransaction.create({
    sellerId,
    type: "credit",
    amount,
    platformFee: 0,
    netAmount: amount,
    description: description || "Wallet refund",
  });

  return { wallet: wallet.toObject(), transaction: transaction.toObject() };
};

const getWalletWithTransactions = async (sellerId, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const wallet = await getOrCreateSellerWallet(sellerId);
  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ sellerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WalletTransaction.countDocuments({ sellerId }),
  ]);

  return {
    wallet,
    transactions: {
      items: transactions,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

module.exports = {
  getOrCreateSellerWallet,
  creditFromOrder,
  debitForWithdrawal,
  refundWallet,
  getWalletWithTransactions,
};
