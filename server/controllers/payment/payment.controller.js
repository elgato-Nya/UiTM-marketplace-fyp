const BaseController = require("../base.controller");
const asyncHandler = require("../../utils/asyncHandler");
const mongoose = require("mongoose");
const {
  createBill,
  parseCallbackPayload,
  verifyCallbackHash,
  ensureToyyibPayAttempts,
  getActiveAttemptIndex,
  TOYYIBPAY_RETRY_THROTTLE_SECONDS,
} = require("../../services/payment/toyyibpay.service");
const { creditFromOrder } = require("../../services/wallet/wallet.service");
const { clearCartForOrderPaymentSuccess } = require("../../services/checkout/checkout.order.service");
const {
  getActiveSellerPlan,
  activateSellerPlan,
} = require("../../services/plan/plan.service");
const { Order, PaymentReference } = require("../../models");
const { createValidationError } = require("../../utils/errors");
const logger = require("../../utils/logger");
const { OrderStatus } = require("../../utils/enums/order.enum");

const baseController = new BaseController();

const getLatestAttempt = (order) => {
  const attempts = Array.isArray(order?.paymentDetails?.toyyibPayAttempts)
    ? order.paymentDetails.toyyibPayAttempts
    : [];
  if (!attempts.length) return null;
  return [...attempts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
};

/**
 * Create a ToyyibPay bill for an existing order.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends bill code and redirect URL
 */
const handleCreateOrderBill = asyncHandler(async (req, res) => {
  const result = await createBill({
    orderId: req.params.id,
    // Security: never trust bill amount/urls from client for order payments.
    amount: undefined,
    description: undefined,
    returnUrl: undefined,
    callbackUrl: undefined,
  });

  baseController.logAction("create_toyyibpay_bill", req, {
    orderId: req.params.id,
    billCode: result.billCode,
  });
  logger.info("payment.bill.created", {
    orderId: req.params.id,
    userId: req.user?._id?.toString?.() || null,
    billCode: result.billCode,
    paymentStatus: result.order?.paymentStatus || null,
    attemptStatus: result.attemptStatus || (result.reused ? "active" : "active"),
  });

  return baseController.sendSuccess(
    res,
    {
      billCode: result.billCode,
      billUrl: result.billUrl,
      reused: result.reused || false,
    },
    "ToyyibPay bill created",
    201,
  );
}, "handle_create_order_bill");

/**
 * Retry ToyyibPay payment by creating a new bill attempt for an existing order.
 * Old active attempt is marked obsolete by the service layer.
 */
const handleRetryOrderPayment = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;

  const order = await Order.findById(orderId);
  if (!order) {
    throw createValidationError(
      "Order not found",
      { orderId },
      "ORDER_NOT_FOUND",
    );
  }

  if (order.paymentStatus === "paid") {
    return baseController.sendSuccess(
      res,
      {
        alreadyPaid: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
      },
      "Order is already paid",
    );
  }

  const result = await createBill({
    order,
    amount: order.totalAmount,
    forceNewAttempt: true,
  });

  baseController.logAction("retry_toyyibpay_bill", req, {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    billCode: result.billCode,
    retryThrottleSeconds: TOYYIBPAY_RETRY_THROTTLE_SECONDS,
  });
  logger.info("payment.retry.created", {
    orderId: order._id.toString(),
    userId: req.user?._id?.toString?.() || null,
    billCode: result.billCode,
    paymentStatus: order.paymentStatus,
    attemptStatus: "active",
  });

  return baseController.sendSuccess(
    res,
    {
      billCode: result.billCode,
      billUrl: result.billUrl,
      orderId: order._id,
      orderNumber: order.orderNumber,
      reused: false,
    },
    "ToyyibPay retry bill created",
    201,
  );
}, "handle_retry_order_payment");

/**
 * Handle ToyyibPay callback.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Processes order state and wallet credit
 */
/**
 * Handle ToyyibPay callback with atomic idempotency check.
 * Uses database-level constraints to ensure duplicate callbacks are rejected atomically.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends callback processing result
 */
const handleCallback = asyncHandler(async (req, res) => {
  const { payload, status, orderId, refno, billCode, hash } = parseCallbackPayload(req.body);
  logger.info("payment.callback.received", {
    orderId: orderId || null,
    billCode: billCode || null,
    paymentStatus: String(status || ""),
  });

  if (!orderId && !billCode) {
    throw createValidationError(
      "Missing order reference in callback",
      { body: req.body },
      "TOYYIBPAY_CALLBACK_INVALID",
    );
  }

  const hasHash = Boolean(String(hash || "").trim());
  let hashValid = null;
  if (hasHash && orderId && refno) {
    hashValid = verifyCallbackHash({
      status,
      orderId,
      refno,
      hash,
    });

    if (!hashValid) {
      logger.warn("ToyyibPay callback hash mismatch", {
        orderId,
        refno,
        status,
        callbackHashPreview: hash ? `${String(hash).slice(0, 8)}...` : null,
      });
      throw createValidationError(
        "Invalid ToyyibPay callback hash",
        { orderId, refno },
        "TOYYIBPAY_CALLBACK_HASH_MISMATCH",
      );
    }
  } else if (!hasHash) {
    logger.warn("ToyyibPay callback without hash", {
      orderId,
      refno,
      billCode,
      status,
    });
  }

  let order = orderId ? await Order.findById(orderId) : null;
  if (!order && billCode) {
    order = await Order.findOne({
      $or: [
        { "paymentDetails.toyyibPayBillCode": billCode },
        { "paymentDetails.toyyibPayAttempts.billCode": billCode },
      ],
    });
  }

  const paymentReference = order
    ? null
    : await PaymentReference.findOne({
        $or: [
          ...(orderId ? [{ referenceNo: orderId }] : []),
          ...(billCode ? [{ billCode }] : []),
          ...(refno ? [{ billCode: refno }] : []),
        ],
      });

  if (!order && !paymentReference) {
    throw createValidationError(
      "Order or payment reference not found for callback",
      { orderId, refno, billCode },
      "ORDER_NOT_FOUND",
    );
  }

  const processedAt = new Date();

  // ATOMIC IDEMPOTENCY CHECK: For payment references, use similar atomic pattern
  if (paymentReference) {
    const existingRef = await PaymentReference.findOneAndUpdate(
      {
        _id: paymentReference._id,
        callbackProcessedAt: null, // Only update if NOT already processed
      },
      {
        $set: {
          callbackProcessedAt: processedAt,
        },
      },
      { new: false },
    );

    if (!existingRef) {
      const currentRef = await PaymentReference.findById(paymentReference._id);
      return baseController.sendSuccess(
        res,
        { duplicate: true, status: currentRef?.status },
        "Callback already processed",
      );
    }
  }

  if (paymentReference && paymentReference.purpose !== "plan_upgrade") {
    throw createValidationError(
      "Unsupported payment reference",
      { referenceNo: paymentReference.referenceNo },
      "PAYMENT_REFERENCE_UNSUPPORTED",
    );
  }

  // Reload payment reference after atomic updates
  if (paymentReference) {
    const reloadedRef = await PaymentReference.findById(paymentReference._id);
    if (reloadedRef) {
      Object.assign(paymentReference, reloadedRef.toObject());
    }
  }

  if (order) {
    ensureToyyibPayAttempts(order);
    order.paymentDetails = order.paymentDetails || {};
    order.paymentDetails.toyyibPayCallbackReceivedAt = processedAt;
    order.paymentDetails.toyyibPayCallbackProcessedAt = processedAt;
    order.paymentDetails.toyyibPayCallbackRefNo = refno;
    order.paymentDetails.toyyibPayCallbackBillCode = billCode || refno;
    order.paymentDetails.paymentProvider = "toyyibpay";
    order.paymentDetails.toyyibPayCallbackHashValid = hashValid;

    const attempts = order.paymentDetails.toyyibPayAttempts || [];
    const attemptIndex = attempts.findIndex(
      (attempt) => String(attempt?.billCode || "") === String(billCode || refno || ""),
    );
    const activeAttemptIndex = getActiveAttemptIndex(attempts);
    const currentBillCode = String(order.paymentDetails?.toyyibPayBillCode || "");
    const callbackBillCode = String(billCode || refno || "");
    const isCurrentBillCallback =
      currentBillCode && callbackBillCode && currentBillCode === callbackBillCode;
    const isMatchingActiveAttempt =
      (attemptIndex >= 0 && attemptIndex === activeAttemptIndex) || isCurrentBillCallback;

    if (attemptIndex >= 0) {
      attempts[attemptIndex].rawCallbackPayload = payload;
      if (refno) attempts[attemptIndex].transactionRef = refno;
    } else if (billCode) {
      attempts.push({
        billCode,
        billUrl: order.paymentDetails.toyyibPayBillUrl || null,
        status: "ignored",
        createdAt: processedAt,
        paidAt: null,
        transactionRef: refno || null,
        rawCallbackPayload: payload,
      });
    }

    if (String(status) === "1") {
      if (order.paymentStatus === "paid") {
        if (attemptIndex >= 0 && attempts[attemptIndex].status !== "paid") {
          attempts[attemptIndex].status =
            attempts[attemptIndex].status === "active" ? "ignored" : "late_success";
          attempts[attemptIndex].paidAt = processedAt;
        }
        await order.save();
        logger.info("payment.callback.duplicate", {
          orderId: order._id.toString(),
          billCode: billCode || null,
          paymentStatus: order.paymentStatus,
          attemptStatus: attemptIndex >= 0 ? attempts[attemptIndex].status : null,
        });
        return baseController.sendSuccess(
          res,
          {
            duplicate: true,
            orderId: order._id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
          },
          "Order already paid, duplicate callback ignored",
        );
      }

      if (!isMatchingActiveAttempt) {
        if (attemptIndex >= 0) {
          attempts[attemptIndex].status = "late_success";
          attempts[attemptIndex].paidAt = processedAt;
        }
        await order.save();
        logger.info("payment.callback.late_success", {
          orderId: order._id.toString(),
          billCode: billCode || null,
          paymentStatus: order.paymentStatus,
          attemptStatus: attemptIndex >= 0 ? attempts[attemptIndex].status : null,
        });
        return baseController.sendSuccess(
          res,
          {
            orderId: order._id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            callbackStatus: "late_success",
            billCode,
          },
          "Late callback from obsolete attempt ignored",
        );
      }

      attempts.forEach((attempt, index) => {
        if (index !== attemptIndex && attempt?.status === "active") {
          attempts[index].status = "obsolete";
        }
      });
      attempts[attemptIndex].status = "paid";
      attempts[attemptIndex].paidAt = processedAt;

      order.paymentStatus = "paid";
      order.status = OrderStatus.CONFIRMED;
      order.paymentDetails.paidAt = processedAt;
      order.paymentDetails.toyyibPayCallbackStatus = "success";
      order.paymentDetails.toyyibPayBillCode = attempts[attemptIndex].billCode;
      order.paymentDetails.toyyibPayBillUrl =
        attempts[attemptIndex].billUrl || order.paymentDetails.toyyibPayBillUrl;
      order.confirmedAt = order.confirmedAt || processedAt;
      order.statusHistory = order.statusHistory || [];
      const alreadyConfirmedByPayment = order.statusHistory.some(
        (entry) =>
          entry?.status === OrderStatus.CONFIRMED &&
          entry?.note === "Paid via ToyyibPay",
      );
      if (!alreadyConfirmedByPayment) {
        order.statusHistory.push({
          status: OrderStatus.CONFIRMED,
          note: "Paid via ToyyibPay",
          updatedAt: processedAt,
          updatedBy: order.seller.userId,
        });
      }

      // Persist payment success first so concurrent callbacks become no-ops.
      await order.save();

      const plan = await getActiveSellerPlan(order.seller.userId);
      const platformFeeRate = plan.rules?.feeRate ?? 0.1;
      const grossAmount = Number(order.totalAmount || 0);
      const platformFee = Number((grossAmount * platformFeeRate).toFixed(2));
      const netAmount = Number((grossAmount - platformFee).toFixed(2));

      await creditFromOrder({
        sellerId: order.seller.userId,
        orderId: order._id,
        orderNumber: order.orderNumber,
        grossAmount,
        platformFee,
        netAmount,
        description: `Order ${order.orderNumber} paid via ToyyibPay`,
      });
      await clearCartForOrderPaymentSuccess(order);
      logger.info("payment.marked_paid", {
        orderId: order._id.toString(),
        userId: order.buyer?.userId?.toString?.() || null,
        billCode: attempts[attemptIndex]?.billCode || null,
        paymentStatus: order.paymentStatus,
        attemptStatus: attempts[attemptIndex]?.status || null,
      });
    } else if (String(status) === "2") {
      if (attemptIndex >= 0 && attempts[attemptIndex].status === "active") {
        attempts[attemptIndex].status = "active";
      }
      order.paymentDetails.toyyibPayCallbackStatus = "pending";
      await order.save();
    } else {
      const reasonText = String(payload?.reason || payload?.msg || "").toLowerCase();
      let mappedFailureStatus = "payment_failed";
      if (reasonText.includes("expired")) mappedFailureStatus = "expired";
      if (reasonText.includes("cancel")) mappedFailureStatus = "cancelled";

      if (attemptIndex >= 0 && attempts[attemptIndex].status === "active") {
        attempts[attemptIndex].status = "failed";
      } else if (attemptIndex >= 0 && attempts[attemptIndex].status !== "paid") {
        attempts[attemptIndex].status = "ignored";
      }
      if (order.paymentStatus !== "paid") {
        order.paymentStatus = mappedFailureStatus;
      }
      order.paymentDetails.toyyibPayCallbackStatus = "failed";
      await order.save();
    }
  } else if (String(status) === "1") {
    const activatedPlan = await activateSellerPlan({
      sellerId: paymentReference.sellerId,
      planType: paymentReference.planType || "pro",
      durationDays: 30,
    });

    paymentReference.status = "processed";
    paymentReference.callbackStatus = "success";
    paymentReference.metadata = {
      ...paymentReference.metadata,
      activatedPlanId: activatedPlan._id,
      activatedPlanType: activatedPlan.planType,
      activatedPlanExpiresAt: activatedPlan.expiresAt,
    };
    await paymentReference.save();

    baseController.logAction("toyyibpay_plan_upgrade_callback", req, {
      sellerId: paymentReference.sellerId.toString(),
      referenceNo: paymentReference.referenceNo,
      billCode: paymentReference.billCode,
      planType: activatedPlan.planType,
    });

    return baseController.sendSuccess(
      res,
      {
        referenceNo: paymentReference.referenceNo,
        billCode: paymentReference.billCode,
        paymentStatus: paymentReference.status,
        callbackStatus: paymentReference.callbackStatus,
        planType: activatedPlan.planType,
        expiresAt: activatedPlan.expiresAt,
      },
      "ToyyibPay callback processed",
    );
  } else if (String(status) === "2") {
    if (!order) {
      paymentReference.status = "pending";
      paymentReference.callbackStatus = "pending";
      await paymentReference.save();
    }
  } else {
    if (!order) {
      paymentReference.status = "failed";
      paymentReference.callbackStatus = "failed";
      await paymentReference.save();
    }
  }

  baseController.logAction("toyyibpay_callback", req, {
    orderId: order ? order._id.toString() : paymentReference.referenceNo,
    orderNumber: order ? order.orderNumber : paymentReference.billCode,
    status: order
      ? order.paymentDetails.toyyibPayCallbackStatus
      : paymentReference.callbackStatus,
  });

  return baseController.sendSuccess(
    res,
    {
      orderId: order ? order._id : paymentReference.referenceNo,
      orderNumber: order ? order.orderNumber : paymentReference.billCode,
      paymentStatus: order ? order.paymentStatus : paymentReference.status,
      callbackStatus: order
        ? order.paymentDetails.toyyibPayCallbackStatus
        : paymentReference.callbackStatus,
      billCode: order
        ? order.paymentDetails.toyyibPayBillCode
        : paymentReference.billCode,
    },
    "ToyyibPay callback processed",
  );
}, "handle_toyyibpay_callback");

const handleGetOrderPaymentStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const userId = req.user._id;

  const order = await Order.findById(orderId).select(
    "_id orderNumber buyer seller paymentStatus paymentMethod paymentDetails status totalAmount createdAt updatedAt"
  );
  if (!order) {
    throw createValidationError("Order not found", { orderId }, "ORDER_NOT_FOUND");
  }

  const isBuyer = String(order?.buyer?.userId) === String(userId);
  const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes("admin");
  if (!isBuyer && !isAdmin) {
    throw createValidationError("Order not found", { orderId }, "ORDER_NOT_FOUND");
  }

  const latestAttempt = getLatestAttempt(order);
  const showBillUrl =
    latestAttempt?.billUrl &&
    ["pending_payment", "pending", "failed", "cancelled", "expired", "payment_failed"].includes(
      order.paymentStatus,
    );

  return baseController.sendSuccess(
    res,
    {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      latestAttempt: latestAttempt
        ? {
            billCode: latestAttempt.billCode || null,
            billUrl: showBillUrl ? latestAttempt.billUrl : null,
            status: latestAttempt.status || null,
            createdAt: latestAttempt.createdAt || null,
            paidAt: latestAttempt.paidAt || null,
          }
        : null,
      callbackStatus: order.paymentDetails?.toyyibPayCallbackStatus || null,
      updatedAt: order.updatedAt,
    },
    "Order payment status retrieved",
  );
}, "handle_get_order_payment_status");

/**
 * Handle ToyyibPay return URL. No payment state is changed here.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Redirects back to the client app
 */
const handleReturn = asyncHandler(async (req, res) => {
  const redirectBase = process.env.CLIENT_URL || "http://localhost:3000";
  const redirectPath =
    process.env.TOYYIBPAY_CLIENT_RETURN_PATH || "/checkout/payment-return";
  const normalizedPath = redirectPath.startsWith("/")
    ? redirectPath
    : `/${redirectPath}`;
  const target = new URL(`${redirectBase}${normalizedPath}`);

  Object.entries(req.query || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      target.searchParams.set(key, String(value));
    }
  });

  return res.redirect(302, target.toString());
}, "handle_toyyibpay_return");

/**
 * Create a ToyyibPay bill for seller plan upgrade.
 * @param {import("express").Request} req Express request
 * @param {import("express").Response} res Express response
 * @returns {Promise<void>} Sends bill URL for plan upgrade
 */
const handleCreatePlanUpgradeBill = asyncHandler(async (req, res) => {
  const sellerPlan = await getActiveSellerPlan(req.user._id);
  const amount = Number(process.env.PRO_PLAN_PRICE || 9);
  const referenceNo = `PLAN-${req.user._id.toString()}-${Date.now()}`;

  const tempOrderId = new mongoose.Types.ObjectId();
  const tempOrder = {
    _id: tempOrderId,
    orderNumber: `PLAN-${Date.now()}`,
    buyer: { userId: req.user._id },
    seller: { userId: req.user._id },
    totalAmount: amount,
    paymentDetails: {},
  };

  const result = await createBill({
    orderId: tempOrder._id,
    order: tempOrder,
    persistOrder: false,
    amount,
    externalReferenceNo: referenceNo,
    description: "MarKet pro plan upgrade",
    returnUrl: req.body.returnUrl,
    callbackUrl: req.body.callbackUrl,
  });

  await PaymentReference.create({
    referenceNo,
    billCode: result.billCode,
    sellerId: req.user._id,
    purpose: "plan_upgrade",
    planType: "pro",
    amount,
    status: "pending",
    metadata: {
      billUrl: result.billUrl,
      currentPlanType: sellerPlan.planType,
    },
  });

  return baseController.sendSuccess(
    res,
    {
      billCode: result.billCode,
      billUrl: result.billUrl,
      referenceNo,
    },
    "Plan upgrade bill created",
    201,
  );
}, "handle_create_plan_upgrade_bill");

module.exports = {
  handleCreateOrderBill,
  handleRetryOrderPayment,
  handleGetOrderPaymentStatus,
  handleCallback,
  handleReturn,
  handleCreatePlanUpgradeBill,
};
