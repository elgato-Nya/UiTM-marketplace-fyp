const crypto = require("crypto");
const { Order, User } = require("../../models");
const {
  createBadRequestError,
  createValidationError,
} = require("../../utils/errors");
const logger = require("../../utils/logger");
const { getActiveSellerPlan, getPlanRules } = require("../plan/plan.service");

const TOYYIBPAY_RETRY_THROTTLE_SECONDS = Number(
  process.env.TOYYIBPAY_RETRY_THROTTLE_SECONDS || 15,
);

const getBaseUrl = () =>
  (process.env.TOYYIBPAY_BASE_URL || "https://dev.toyyibpay.com").replace(
    /\/$/,
    "",
  );

const sanitizeToyyibpayText = (value, maxLength) =>
  String(value || "")
    .replace(/[^a-zA-Z0-9 _]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const safeParseJson = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return value;
  }
};

const normalizeResponse = (body) => {
  if (!body) return {};

  const parsed = safeParseJson(body);
  if (Array.isArray(parsed)) return parsed[0] || {};
  if (typeof parsed === "string") {
    const parsedAgain = safeParseJson(parsed);
    if (Array.isArray(parsedAgain)) return parsedAgain[0] || {};
    return parsedAgain && typeof parsedAgain === "object" ? parsedAgain : {};
  }
  return parsed;
};

const extractBillCode = (responseBody = {}) => {
  const candidate =
    responseBody?.BillCode ||
    responseBody?.billCode ||
    responseBody?.billcode ||
    responseBody?.bill_code ||
    responseBody?.code ||
    responseBody?.result?.BillCode ||
    responseBody?.result?.billCode ||
    responseBody?.result?.bill_code ||
    null;

  if (candidate) return String(candidate).trim();

  if (typeof responseBody?.raw === "string") {
    const match = responseBody.raw.match(
      /"(?:BillCode|billCode|billcode|bill_code)"\s*:\s*"([^"]+)"/i,
    );
    if (match?.[1]) return match[1].trim();
  }

  return null;
};

const stripHtmlTags = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const summarizeProviderResponse = (value, maxLength = 300) => {
  const text = stripHtmlTags(value);
  return text ? text.slice(0, maxLength) : null;
};

const extractProviderMessage = (normalized = {}, parsedBody = {}, responseText = "") => {
  const directMessage =
    normalized?.msg ||
    normalized?.message ||
    normalized?.error ||
    normalized?.status ||
    parsedBody?.msg ||
    parsedBody?.message ||
    parsedBody?.error ||
    parsedBody?.status ||
    null;

  if (directMessage && String(directMessage).trim()) {
    return String(directMessage).trim();
  }

  if (typeof parsedBody?.raw === "string") {
    const rawMessage = summarizeProviderResponse(parsedBody.raw);
    if (rawMessage) return rawMessage;
  }

  if (typeof responseText === "string") {
    return summarizeProviderResponse(responseText);
  }

  return null;
};

const summarizeBillPayloadForLogs = (payload = {}) => ({
  categoryCode: payload.categoryCode || null,
  billName: payload.billName || null,
  billDescription: payload.billDescription || null,
  billPriceSetting: payload.billPriceSetting ?? null,
  billPayorInfo: payload.billPayorInfo ?? null,
  billPaymentChannel: payload.billPaymentChannel ?? null,
  billChargeToCustomer: payload.billChargeToCustomer ?? null,
  enableDuitNowQR: payload.enableDuitNowQR ?? null,
  chargeDuitNowQR: payload.chargeDuitNowQR ?? null,
  billAmount: payload.billAmount ?? null,
  billReturnUrl: payload.billReturnUrl || null,
  billCallbackUrl: payload.billCallbackUrl || null,
  billExternalReferenceNo: payload.billExternalReferenceNo || null,
  hasBillTo: Boolean(String(payload.billTo || "").trim()),
  hasBillEmail: Boolean(String(payload.billEmail || "").trim()),
  hasBillPhone: Boolean(String(payload.billPhone || "").trim()),
  billExpiryDays: payload.billExpiryDays ?? null,
  metadata: payload.metadata || null,
});

const normalizeAttemptStatus = (status) => {
  const allowedStatuses = new Set([
    "active",
    "obsolete",
    "pending",
    "paid",
    "failed",
    "late_success",
    "ignored",
    "expired",
    "cancelled",
  ]);
  return allowedStatuses.has(status) ? status : "active";
};

const ensureToyyibPayAttempts = (order) => {
  if (!order.paymentDetails) order.paymentDetails = {};

  const legacyBillCode = order.paymentDetails.toyyibPayBillCode;
  const legacyBillUrl = order.paymentDetails.toyyibPayBillUrl;

  const existingAttempts = Array.isArray(order.paymentDetails.toyyibPayAttempts)
    ? order.paymentDetails.toyyibPayAttempts
    : [];

  const normalizedAttempts = existingAttempts.map((attempt) => ({
    ...attempt,
    status: normalizeAttemptStatus(attempt?.status),
  }));

  const hasLegacyAttempt =
    legacyBillCode &&
    normalizedAttempts.some(
      (attempt) => String(attempt?.billCode || "") === String(legacyBillCode),
    );

  if (legacyBillCode && !hasLegacyAttempt) {
    normalizedAttempts.push({
      billCode: legacyBillCode,
      billUrl: legacyBillUrl || `${getBaseUrl()}/${legacyBillCode}`,
      status: order.paymentStatus === "paid" ? "paid" : "active",
      createdAt: order.createdAt || new Date(),
      paidAt: order.paymentDetails?.paidAt || null,
      transactionRef: order.paymentDetails?.toyyibPayCallbackRefNo || null,
      rawCallbackPayload: null,
    });
  }

  order.paymentDetails.toyyibPayAttempts = normalizedAttempts;
  return normalizedAttempts;
};

const getActiveAttemptIndex = (attempts = []) => {
  for (let index = attempts.length - 1; index >= 0; index -= 1) {
    if (attempts[index]?.status === "active") return index;
  }
  return -1;
};

const markActiveAttemptAsObsolete = (attempts = []) => {
  let lastActiveIndex = -1;
  attempts.forEach((attempt, index) => {
    if (attempt?.status === "active") {
      attempts[index].status = "obsolete";
      lastActiveIndex = index;
    }
  });
  return lastActiveIndex;
};

const lockRetryWindow = (order) => {
  order.paymentDetails.toyyibPayRetryLockedUntil = new Date(
    Date.now() + TOYYIBPAY_RETRY_THROTTLE_SECONDS * 1000,
  );
};

const assertRetryNotThrottled = (order) => {
  const lockedUntil = order.paymentDetails?.toyyibPayRetryLockedUntil;
  if (lockedUntil && new Date(lockedUntil).getTime() > Date.now()) {
    const secondsRemaining = Math.ceil(
      (new Date(lockedUntil).getTime() - Date.now()) / 1000,
    );
    throw createValidationError(
      `Please wait ${secondsRemaining}s before retrying payment.`,
      { lockedUntil },
      "TOYYIBPAY_RETRY_THROTTLED",
    );
  }
};

const buildCallbackHash = (status, orderId, refno) => {
  const secretKey = process.env.TOYYIBPAY_SECRET_KEY || "";
  return crypto
    .createHash("md5")
    .update(`${secretKey}${status}${orderId}${refno}ok`)
    .digest("hex");
};

const verifyCallbackHash = ({ status, orderId, refno, hash }) => {
  const expectedHash = buildCallbackHash(status, orderId, refno);
  return expectedHash === String(hash || "").toLowerCase();
};

const buildBillPayload = async ({
  order,
  amount,
  description,
  returnUrl,
  callbackUrl,
}) => {
  const buyer = await User.findById(order.buyer.userId).select(
    "email profile.username profile.phoneNumber",
  );
  const plan = await getActiveSellerPlan(order.seller.userId);
  const rules = getPlanRules(plan.planType);
  const numericAmount = Number(amount);
  const billAmountInCent = Number.isFinite(numericAmount)
    ? Math.max(0, Math.round(numericAmount * 100))
    : NaN;

  if (!Number.isFinite(billAmountInCent) || billAmountInCent <= 0) {
    throw createValidationError(
      "Invalid order amount for ToyyibPay bill",
      { amount },
      "TOYYIBPAY_INVALID_BILL_AMOUNT",
    );
  }

  const billTo = String(buyer?.profile?.username || "").trim();
  const billEmail = String(buyer?.email || "").trim();
  const billPhone = String(buyer?.profile?.phoneNumber || "").trim();
  const hasCompletePayerInfo = Boolean(billTo && billEmail && billPhone);
  const rawBillName = `MarKet_Order_${order.orderNumber}`;
  const rawBillDescription =
    description ||
    `Payment for order ${order.orderNumber} under ${plan.planType} plan`;
  const billName = sanitizeToyyibpayText(rawBillName, 30) || "MarKet_Order";
  const billDescription =
    sanitizeToyyibpayText(rawBillDescription, 100) ||
    "Payment for MarKet order";

  return {
    userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
    categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE,
    billName,
    billDescription,
    billPriceSetting: 1,
    billPayorInfo: hasCompletePayerInfo ? 1 : 0,
    billPaymentChannel: 0,
    billChargeToCustomer: 0,
    enableDuitNowQR: 1,
    chargeDuitNowQR: 0,
    billAmount: billAmountInCent,
    billReturnUrl: returnUrl,
    billCallbackUrl: callbackUrl,
    billExternalReferenceNo: String(order._id),
    billTo: hasCompletePayerInfo ? billTo : "",
    billEmail: hasCompletePayerInfo ? billEmail : "",
    billPhone: hasCompletePayerInfo ? billPhone : "",
    billExpiryDays: 1,
    metadata: {
      planType: plan.planType,
      listingLimit: rules.listingLimit,
      hasCompletePayerInfo,
    },
  };
};

const pickFirstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return null;
};

const extractPaymentChannelInfo = (source = {}) => {
  if (!source || typeof source !== "object") {
    return {
      paymentChannel: null,
      paymentMethodLabel: null,
      payerInstitution: null,
    };
  }

  const paymentChannel = pickFirstNonEmpty(
    source.paymentChannel,
    source.channel,
    source.method,
    source.billpaymentChannel,
    source.billPaymentChannel,
    source.billpaymentType,
    source.billPaymentType,
  );
  const paymentMethodLabel = pickFirstNonEmpty(
    source.paymentMethod,
    source.methodName,
    source.paymentOption,
    source.billpaymentSource,
    source.billPaymentSource,
    source.billpaymentMode,
    source.billPaymentMode,
  );
  const payerInstitution = pickFirstNonEmpty(
    source.bank,
    source.bankName,
    source.bankCode,
    source.fpxBank,
    source.eWallet,
    source.wallet,
    source.provider,
  );

  return {
    paymentChannel,
    paymentMethodLabel,
    payerInstitution,
  };
};

const createBill = async ({
  orderId,
  order: providedOrder = null,
  persistOrder = true,
  externalReferenceNo,
  amount,
  description,
  returnUrl,
  callbackUrl,
  forceNewAttempt = false,
}) => {
  const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
  const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

  if (!secretKey || !categoryCode) {
    throw createBadRequestError(
      "ToyyibPay is not configured",
      "TOYYIBPAY_NOT_CONFIGURED",
    );
  }

  const order =
    providedOrder || (orderId ? await Order.findById(orderId) : null);
  if (!order) {
    throw createValidationError(
      "Order not found",
      { orderId },
      "ORDER_NOT_FOUND",
    );
  }

  const attempts = ensureToyyibPayAttempts(order);
  const activeAttemptIndex = getActiveAttemptIndex(attempts);
  const activeAttempt =
    activeAttemptIndex >= 0 ? attempts[activeAttemptIndex] : null;

  if (order.paymentStatus === "paid") {
    throw createValidationError(
      "Order is already paid",
      { orderId: order._id },
      "ORDER_ALREADY_PAID",
    );
  }

  if (order.paymentDetails?.stockRestoredAt) {
    throw createValidationError(
      "This payment session expired. Please start checkout again.",
      { orderId: order._id },
      "ORDER_PAYMENT_SESSION_EXPIRED",
    );
  }

  if (forceNewAttempt) {
    assertRetryNotThrottled(order);
    markActiveAttemptAsObsolete(attempts);
  } else if (activeAttempt?.billCode) {
    return {
      billCode: activeAttempt.billCode,
      billUrl:
        activeAttempt.billUrl || `${getBaseUrl()}/${activeAttempt.billCode}`,
      order,
      reused: true,
      attemptStatus: activeAttempt.status,
    };
  }

  const payload = await buildBillPayload({
    order,
    amount: amount ?? order.totalAmount,
    description,
    returnUrl:
      returnUrl ||
      process.env.TOYYIBPAY_RETURN_URL ||
      `${process.env.CLIENT_URL}/payment/return`,
    callbackUrl: callbackUrl || process.env.TOYYIBPAY_CALLBACK_URL,
  });

  const billExternalReferenceNo = String(externalReferenceNo || order._id);
  payload.billExternalReferenceNo = billExternalReferenceNo;

  const requestBody = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      requestBody.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : String(value),
      );
    }
  });

  logger.info("payment.dnqr.enabled", {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    enableDuitNowQR: String(payload.enableDuitNowQR || ""),
    chargeDuitNowQR: String(payload.chargeDuitNowQR || ""),
  });

  const response = await fetch(`${getBaseUrl()}/index.php/api/createBill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: requestBody,
  });

  const responseText = await response.text();
  const responseContentType = response.headers.get("content-type") || "";
  let parsedBody = {};
  try {
    parsedBody = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    parsedBody = { raw: responseText };
  }

  if (!response.ok) {
    logger.error("ToyyibPay bill creation failed", {
      orderId: order?._id?.toString?.() || String(orderId || ""),
      status: response.status,
      responseContentType,
      responsePreview: summarizeProviderResponse(responseText),
    });
    throw createBadRequestError(
      "Failed to create ToyyibPay bill",
      "TOYYIBPAY_BILL_CREATE_FAILED",
    );
  }

  const normalized = normalizeResponse(parsedBody);
  const billCode = extractBillCode(normalized);

  if (!billCode) {
    const providerMessage = extractProviderMessage(
      normalized,
      parsedBody,
      responseText,
    );

    logger.error("ToyyibPay bill code missing from response", {
      orderId: order._id.toString(),
      responseContentType,
      responsePreview: summarizeProviderResponse(responseText),
      parsedBody,
      normalized,
      providerMessage,
      payload: summarizeBillPayloadForLogs(payload),
    });
    throw createBadRequestError(
      providerMessage
        ? `ToyyibPay did not return a bill code: ${providerMessage}`
        : "ToyyibPay did not return a bill code",
      "TOYYIBPAY_BILL_CODE_MISSING",
    );
  }

  if (persistOrder && typeof order.save === "function") {
    const latestAttempts = ensureToyyibPayAttempts(order);
    order.paymentDetails.paymentProvider = "toyyibpay";
    order.paymentDetails.toyyibPayBillCode = billCode;
    order.paymentDetails.toyyibPayBillUrl = `${getBaseUrl()}/${billCode}`;
    order.paymentDetails.toyyibPayExternalReferenceNo = billExternalReferenceNo;
    order.paymentDetails.toyyibPayCallbackHashValid = null;
    const existingIndex = latestAttempts.findIndex(
      (attempt) => String(attempt?.billCode || "") === String(billCode),
    );
    if (existingIndex >= 0) {
      latestAttempts[existingIndex] = {
        ...latestAttempts[existingIndex],
        billCode,
        billUrl: `${getBaseUrl()}/${billCode}`,
        status: "active",
      };
    } else {
      latestAttempts.push({
        billCode,
        billUrl: `${getBaseUrl()}/${billCode}`,
        status: "active",
        createdAt: new Date(),
        paidAt: null,
        transactionRef: null,
        rawCallbackPayload: null,
      });
    }
    order.paymentDetails.toyyibPayAttempts = latestAttempts;
    if (forceNewAttempt) {
      lockRetryWindow(order);
    }
    await order.save();
  }

  logger.info("ToyyibPay bill created", {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    billCode,
    externalReferenceNo: billExternalReferenceNo,
  });

  return {
    billCode,
    billUrl: `${getBaseUrl()}/${billCode}`,
    order,
    persisted: persistOrder,
    externalReferenceNo: billExternalReferenceNo,
    response: normalized,
  };
};

const parseCallbackPayload = (body = {}) => {
  const payload = body.billpayment || body;
  const status = String(
    payload.status ?? body.status ?? payload.status_id ?? body.status_id ?? "",
  );
  const orderId = String(
    payload.order_id ||
      payload.orderId ||
      body.order_id ||
      body.orderId ||
      payload.billExternalReferenceNo ||
      body.billExternalReferenceNo ||
      payload.bill_external_reference_no ||
      body.bill_external_reference_no ||
      "",
  );
  const refno = String(
    payload.refno ||
      payload.refNo ||
      body.refno ||
      body.refNo ||
      payload.payment_ref_no ||
      body.payment_ref_no ||
      payload.billCode ||
      body.billCode ||
      payload.bill_code ||
      body.bill_code ||
      payload.billcode ||
      body.billcode ||
      "",
  );
  const billCode = String(
    payload.billcode ||
      body.billcode ||
      payload.billCode ||
      body.billCode ||
      payload.bill_code ||
      body.bill_code ||
      "",
  );
  const hash = String(
    payload.hash || payload.billHash || body.hash || body.billHash || "",
  );

  return { payload, status, orderId, refno, billCode, hash };
};

const getCallbackStatusLabel = (status) => {
  if (String(status) === "1") return "success";
  if (String(status) === "2") return "pending";
  return "failed";
};

module.exports = {
  buildCallbackHash,
  verifyCallbackHash,
  buildBillPayload,
  createBill,
  parseCallbackPayload,
  getCallbackStatusLabel,
  extractPaymentChannelInfo,
  ensureToyyibPayAttempts,
  getActiveAttemptIndex,
  markActiveAttemptAsObsolete,
  TOYYIBPAY_RETRY_THROTTLE_SECONDS,
  getBaseUrl,
};
