const mongoose = require("mongoose");
const { Order, Listing } = require("../../models");
const logger = require("../../utils/logger");
const { extractPaymentChannelInfo } = require("./toyyibpay.service");

const PAYMENT_EXPIRY_MINUTES = Number(process.env.PAYMENT_EXPIRY_MINUTES || 30);

const restoreStockForOrder = async (order, dbSession) => {
  let restoredCount = 0;
  for (const item of order.items || []) {
    if (item.type !== "product") continue;
    if (item.variantId) {
      const updated = await Listing.updateOne(
        { _id: item.listingId, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": item.quantity } },
        { session: dbSession },
      );
      if (updated.modifiedCount > 0) restoredCount += 1;
    } else {
      const updated = await Listing.updateOne(
        { _id: item.listingId },
        { $inc: { stock: item.quantity } },
        { session: dbSession },
      );
      if (updated.modifiedCount > 0) restoredCount += 1;
    }
  }
  return restoredCount;
};

/**
 * Safety rules:
 * - Only expire toyyibpay orders that are still pending_payment and pending status.
 * - Never expire paid orders.
 * - Idempotent by locking on stockRestoredAt=null before restore.
 * - If called twice, second call does nothing.
 */
const expirePendingPaymentsAndRestoreStock = async ({
  now = new Date(),
  limit = 200,
  maxOrderAgeMinutes = PAYMENT_EXPIRY_MINUTES,
} = {}) => {
  const cutoff = new Date(now.getTime() - maxOrderAgeMinutes * 60 * 1000);
  const candidates = await Order.find({
    paymentMethod: "toyyibpay",
    paymentStatus: "pending_payment",
    status: "pending",
    createdAt: { $lte: cutoff },
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .select("_id buyer seller orderNumber paymentStatus status items paymentDetails createdAt");

  let expiredCount = 0;
  let restoredStockOrderCount = 0;

  for (const candidate of candidates) {
    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        const locked = await Order.findOneAndUpdate(
          {
            _id: candidate._id,
            paymentMethod: "toyyibpay",
            paymentStatus: "pending_payment",
            status: "pending",
            $or: [
              { "paymentDetails.stockRestoredAt": { $exists: false } },
              { "paymentDetails.stockRestoredAt": null },
            ],
          },
          {
            $set: {
              paymentStatus: "expired",
              status: "cancelled",
              cancelledAt: now,
              "paymentDetails.paymentExpiredAt": now,
              "paymentDetails.stockRestoredAt": now,
            },
            $push: {
              statusHistory: {
                status: "cancelled",
                note: "Payment expired automatically",
                updatedAt: now,
                updatedBy: candidate.seller?.userId || candidate.buyer?.userId,
              },
            },
          },
          { new: true, session: dbSession },
        );

        if (!locked) return;

        const attempts = Array.isArray(locked.paymentDetails?.toyyibPayAttempts)
          ? locked.paymentDetails.toyyibPayAttempts
          : [];
        attempts.forEach((attempt) => {
          if (attempt?.status === "active" || attempt?.status === "pending") {
            attempt.status = "expired";
          }
        });
        locked.paymentDetails.toyyibPayAttempts = attempts;

        const restored = await restoreStockForOrder(locked, dbSession);
        await locked.save({ session: dbSession });

        expiredCount += 1;
        if (restored > 0) restoredStockOrderCount += 1;

        logger.info("payment.expired", {
          orderId: locked._id.toString(),
          userId: locked.buyer?.userId?.toString?.() || null,
          paymentStatus: locked.paymentStatus,
          attemptStatus: attempts.find((attempt) => attempt.status === "expired")
            ? "expired"
            : null,
        });
        if (restored > 0) {
          logger.info("stock.restored", {
            orderId: locked._id.toString(),
            userId: locked.buyer?.userId?.toString?.() || null,
            paymentStatus: locked.paymentStatus,
            restoredItems: restored,
          });
        }
      });
    } finally {
      await dbSession.endSession();
    }
  }

  return {
    scanned: candidates.length,
    expiredCount,
    restoredStockOrderCount,
    cutoff,
  };
};

const fetchToyyibPayBillTransactions = async (billCode) => {
  if (!billCode) return [];
  const baseUrl = (process.env.TOYYIBPAY_BASE_URL || "https://dev.toyyibpay.com").replace(/\/$/, "");
  const body = new URLSearchParams();
  body.append("billCode", String(billCode));
  const response = await fetch(`${baseUrl}/index.php/api/getBillTransactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!response.ok) return [];
  const text = await response.text();
  try {
    const parsed = JSON.parse(text || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

/**
 * Minimal reconciliation:
 * - Official API: getBillTransactions (ToyyibPay API reference).
 * - Only logs/marks a flag for now; status mutation still depends on callback flow for safety.
 */
const reconcileStalePendingPayments = async ({
  now = new Date(),
  staleMinutes = Number(process.env.PAYMENT_RECONCILE_STALE_MINUTES || 3),
  limit = 50,
} = {}) => {
  const cutoff = new Date(now.getTime() - staleMinutes * 60 * 1000);
  const staleOrders = await Order.find({
    paymentMethod: "toyyibpay",
    paymentStatus: "pending_payment",
    createdAt: { $lte: cutoff },
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .select("_id orderNumber buyer paymentDetails");

  let checked = 0;
  let potentialPaid = 0;
  for (const order of staleOrders) {
    const activeAttempt = (order.paymentDetails?.toyyibPayAttempts || []).find(
      (attempt) => attempt.status === "active" && attempt.billCode,
    );
    if (!activeAttempt?.billCode) continue;

    const tx = await fetchToyyibPayBillTransactions(activeAttempt.billCode);
    checked += 1;
    const lastTx = Array.isArray(tx) && tx.length ? tx[tx.length - 1] : null;
    const channelInfo = extractPaymentChannelInfo(lastTx || {});
    if (
      channelInfo.paymentChannel ||
      channelInfo.paymentMethodLabel ||
      channelInfo.payerInstitution
    ) {
      logger.info("payment.channel.selected", {
        orderId: order._id.toString(),
        billCode: activeAttempt.billCode,
        source: "reconcile",
        paymentChannel: channelInfo.paymentChannel,
        paymentMethodLabel: channelInfo.paymentMethodLabel,
        payerInstitution: channelInfo.payerInstitution,
      });
    }
    const hasSuccess = tx.some(
      (row) => String(row?.billpaymentStatus || row?.billStatus || "") === "1",
    );
    if (hasSuccess) {
      potentialPaid += 1;
      // TODO: A safe direct status mutation requires strong mapping to refno/hash.
      // We intentionally keep callback as source of truth here.
      logger.info("payment.reconcile.potential_paid", {
        orderId: order._id.toString(),
        userId: order.buyer?.userId?.toString?.() || null,
        billCode: activeAttempt.billCode,
      });
    }
  }

  return { scanned: staleOrders.length, checked, potentialPaid };
};

module.exports = {
  PAYMENT_EXPIRY_MINUTES,
  expirePendingPaymentsAndRestoreStock,
  reconcileStalePendingPayments,
};
