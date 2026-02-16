const QuoteStatus = Object.freeze({
  PENDING: "pending",
  QUOTED: "quoted",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
  PAID: "paid",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const QuoteExpiryDays = Object.freeze({
  PENDING_EXPIRY: 7,
  QUOTED_EXPIRY: 14,
  ACCEPTED_EXPIRY: 3,
});

const QuoteCancelReason = Object.freeze({
  BUYER_CHANGED_MIND: "buyer_changed_mind",
  BUYER_FOUND_ALTERNATIVE: "buyer_found_alternative",
  BUYER_BUDGET_ISSUES: "buyer_budget_issues",
  SELLER_UNAVAILABLE: "seller_unavailable",
  SELLER_CANNOT_FULFILL: "seller_cannot_fulfill",
  SELLER_PRICING_ERROR: "seller_pricing_error",
  MUTUAL_AGREEMENT: "mutual_agreement",
  DISPUTE: "dispute",
  OTHER: "other",
});

const QuotePriority = Object.freeze({
  NORMAL: "normal",
  URGENT: "urgent",
  FLEXIBLE: "flexible",
});

const QuoteNotificationType = Object.freeze({
  NEW_QUOTE_REQUEST: "new_quote_request",
  QUOTE_ACCEPTED: "quote_accepted",
  QUOTE_REJECTED: "quote_rejected",
  QUOTE_PAYMENT_RECEIVED: "quote_payment_received",
  QUOTE_RECEIVED: "quote_received",
  QUOTE_EXPIRING_SOON: "quote_expiring_soon",
  QUOTE_EXPIRED: "quote_expired",
  SERVICE_STARTED: "service_started",
  SERVICE_COMPLETED: "service_completed",
  QUOTE_CANCELLED: "quote_cancelled",
});

module.exports = {
  QuoteStatus,
  QuoteExpiryDays,
  QuoteCancelReason,
  QuotePriority,
  QuoteNotificationType,
};
