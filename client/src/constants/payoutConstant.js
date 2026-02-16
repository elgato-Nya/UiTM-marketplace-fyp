export const PAYOUT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  ON_HOLD: "on_hold",
};

export const PAYOUT_SCHEDULE = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  MANUAL: "manual",
};

export const PAYOUT_METHOD = {
  BANK_TRANSFER: "bank_transfer",
};

export const PAYOUT_TRANSACTION_TYPE = {
  ORDER_PAYMENT: "order_payment",
  QUOTE_PAYMENT: "quote_payment",
  REFUND_REVERSAL: "refund_reversal",
  PAYOUT: "payout",
  REFUND: "refund",
  PLATFORM_FEE: "platform_fee",
  ADJUSTMENT: "adjustment",
};

export const PAYOUT_FAILURE_REASON = {
  INVALID_BANK_DETAILS: "invalid_bank_details",
  INSUFFICIENT_BALANCE: "insufficient_balance",
  BANK_REJECTED: "bank_rejected",
  ACCOUNT_SUSPENDED: "account_suspended",
  VERIFICATION_REQUIRED: "verification_required",
  TECHNICAL_ERROR: "technical_error",
  OTHER: "other",
};

export const PAYOUT_LIMITS = {
  MIN_PAYOUT_AMOUNT: 10,
  MAX_PAYOUT_SETTINGS_AMOUNT: 1000,
  MAX_BALANCE_THRESHOLD: 5000,
  MAX_HOLD_DAYS: 30,
  MIN_DAYS_BETWEEN_REQUESTS: 1,
};

// Malaysian banks with SWIFT/BIC codes
export const MALAYSIAN_BANKS = [
  { code: "MBBEMYKL", name: "Maybank" },
  { code: "CIBBMYKL", name: "CIMB Bank" },
  { code: "PBBEMYKL", name: "Public Bank" },
  { code: "RHBBMYKL", name: "RHB Bank" },
  { code: "HLBBMYKL", name: "Hong Leong Bank" },
  { code: "AIABORUMYKL", name: "AmBank" },
  { code: "BIMBMYKL", name: "Bank Islam" },
  { code: "AFBQMYKL", name: "Affin Bank" },
  { code: "BKRMMYKL", name: "Bank Rakyat" },
  { code: "BMMBMYKL", name: "Bank Muamalat" },
  { code: "ALSRMYK1", name: "Alliance Bank" },
  { code: "UOBOBMYKL", name: "United Overseas Bank (UOB)" },
  { code: "OCBCMYKL", name: "OCBC Bank" },
  { code: "HABORUMYKL", name: "HSBC Bank" },
  { code: "SCBLMYKX", name: "Standard Chartered" },
  { code: "CITIMYKL", name: "Citibank" },
  { code: "AABORUMYKL", name: "Agrobank" },
  { code: "BSABORUMYKL", name: "Bank Simpanan Nasional (BSN)" },
];

// Status display configuration
export const PAYOUT_STATUS_CONFIG = {
  [PAYOUT_STATUS.PENDING]: {
    label: "Pending",
    color: "warning",
    icon: "⏳",
    description: "Payout request submitted, awaiting processing",
  },
  [PAYOUT_STATUS.PROCESSING]: {
    label: "Processing",
    color: "info",
    icon: "🔄",
    description: "Bank transfer in progress",
  },
  [PAYOUT_STATUS.COMPLETED]: {
    label: "Completed",
    color: "success",
    icon: "✅",
    description: "Successfully transferred to your bank",
  },
  [PAYOUT_STATUS.FAILED]: {
    label: "Failed",
    color: "error",
    icon: "❌",
    description: "Transfer failed - please check bank details",
  },
  [PAYOUT_STATUS.CANCELLED]: {
    label: "Cancelled",
    color: "default",
    icon: "🚫",
    description: "Payout request was cancelled",
  },
  [PAYOUT_STATUS.ON_HOLD]: {
    label: "On Hold",
    color: "warning",
    icon: "⚠️",
    description: "Payout on hold - verification required",
  },
};

// Schedule display configuration
export const PAYOUT_SCHEDULE_CONFIG = {
  [PAYOUT_SCHEDULE.WEEKLY]: {
    label: "Weekly",
    icon: "📅",
    description: "Automatic payout every Monday",
  },
  [PAYOUT_SCHEDULE.MONTHLY]: {
    label: "Monthly",
    icon: "📆",
    description: "Automatic payout on 1st of each month",
  },
  [PAYOUT_SCHEDULE.MANUAL]: {
    label: "Manual",
    icon: "✋",
    description: "Request payout when you want",
  },
};

// Transaction type display configuration
export const PAYOUT_TRANSACTION_CONFIG = {
  [PAYOUT_TRANSACTION_TYPE.ORDER_PAYMENT]: {
    label: "Order Payment",
    icon: "📦",
    color: "success",
  },
  [PAYOUT_TRANSACTION_TYPE.QUOTE_PAYMENT]: {
    label: "Service Payment",
    icon: "💼",
    color: "success",
  },
  [PAYOUT_TRANSACTION_TYPE.REFUND_REVERSAL]: {
    label: "Refund Reversed",
    icon: "↩️",
    color: "success",
  },
  [PAYOUT_TRANSACTION_TYPE.PAYOUT]: {
    label: "Payout",
    icon: "💰",
    color: "primary",
  },
  [PAYOUT_TRANSACTION_TYPE.REFUND]: {
    label: "Refund",
    icon: "↪️",
    color: "error",
  },
  [PAYOUT_TRANSACTION_TYPE.PLATFORM_FEE]: {
    label: "Platform Fee",
    icon: "🏷️",
    color: "warning",
  },
  [PAYOUT_TRANSACTION_TYPE.ADJUSTMENT]: {
    label: "Adjustment",
    icon: "⚙️",
    color: "default",
  },
};

// Failure reason labels
export const PAYOUT_FAILURE_REASON_LABELS = {
  [PAYOUT_FAILURE_REASON.INVALID_BANK_DETAILS]: "Invalid bank account details",
  [PAYOUT_FAILURE_REASON.INSUFFICIENT_BALANCE]: "Insufficient balance",
  [PAYOUT_FAILURE_REASON.BANK_REJECTED]: "Bank rejected the transfer",
  [PAYOUT_FAILURE_REASON.ACCOUNT_SUSPENDED]: "Account suspended",
  [PAYOUT_FAILURE_REASON.VERIFICATION_REQUIRED]: "Verification required",
  [PAYOUT_FAILURE_REASON.TECHNICAL_ERROR]: "Technical error",
  [PAYOUT_FAILURE_REASON.OTHER]: "Unknown error",
};
