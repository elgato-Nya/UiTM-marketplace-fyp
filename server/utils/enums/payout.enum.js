const PayoutStatus = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  ON_HOLD: "on_hold",
});

const PayoutSchedule = Object.freeze({
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  MANUAL: "manual",
});

const PayoutMethod = Object.freeze({
  BANK_TRANSFER: "bank_transfer",
});

const PayoutLimits = Object.freeze({
  MIN_PAYOUT_AMOUNT: 10,
  MAX_BALANCE_THRESHOLD: 5000,
  MAX_HOLD_DAYS: 30,
  MIN_DAYS_BETWEEN_REQUESTS: 1,
});

const PayoutTransactionType = Object.freeze({
  ORDER_PAYMENT: "order_payment",
  QUOTE_PAYMENT: "quote_payment",
  REFUND_REVERSAL: "refund_reversal",
  PAYOUT: "payout",
  REFUND: "refund",
  PLATFORM_FEE: "platform_fee",
  ADJUSTMENT: "adjustment",
});

const PayoutFailureReason = Object.freeze({
  INVALID_BANK_DETAILS: "invalid_bank_details",
  INSUFFICIENT_BALANCE: "insufficient_balance",
  BANK_REJECTED: "bank_rejected",
  ACCOUNT_SUSPENDED: "account_suspended",
  VERIFICATION_REQUIRED: "verification_required",
  TECHNICAL_ERROR: "technical_error",
  OTHER: "other",
});

module.exports = {
  PayoutStatus,
  PayoutSchedule,
  PayoutMethod,
  PayoutLimits,
  PayoutTransactionType,
  PayoutFailureReason,
};
