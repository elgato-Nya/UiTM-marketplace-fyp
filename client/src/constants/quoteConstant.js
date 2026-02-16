export const QUOTE_STATUS = {
  PENDING: "pending",
  QUOTED: "quoted",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
  PAID: "paid",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const QUOTE_PRIORITY = {
  NORMAL: "normal",
  URGENT: "urgent",
  FLEXIBLE: "flexible",
};

export const QUOTE_CANCEL_REASON = {
  BUYER_CHANGED_MIND: "buyer_changed_mind",
  BUYER_FOUND_ALTERNATIVE: "buyer_found_alternative",
  BUYER_BUDGET_ISSUES: "buyer_budget_issues",
  SELLER_UNAVAILABLE: "seller_unavailable",
  SELLER_CANNOT_FULFILL: "seller_cannot_fulfill",
  SELLER_PRICING_ERROR: "seller_pricing_error",
  MUTUAL_AGREEMENT: "mutual_agreement",
  DISPUTE: "dispute",
  OTHER: "other",
};

export const QUOTE_EXPIRY_DAYS = {
  PENDING_EXPIRY: 7,
  QUOTED_EXPIRY: 14,
  ACCEPTED_EXPIRY: 3,
};

// Status display configuration
export const QUOTE_STATUS_CONFIG = {
  [QUOTE_STATUS.PENDING]: {
    label: "Pending",
    color: "warning",
    icon: "⏳",
    description: "Waiting for seller to provide quote",
  },
  [QUOTE_STATUS.QUOTED]: {
    label: "Quote Received",
    color: "info",
    icon: "💬",
    description: "Seller has provided a quote",
  },
  [QUOTE_STATUS.ACCEPTED]: {
    label: "Accepted",
    color: "success",
    icon: "✅",
    description: "Quote accepted, awaiting payment",
  },
  [QUOTE_STATUS.REJECTED]: {
    label: "Rejected",
    color: "error",
    icon: "❌",
    description: "Quote was declined",
  },
  [QUOTE_STATUS.EXPIRED]: {
    label: "Expired",
    color: "default",
    icon: "⌛",
    description: "Quote request has expired",
  },
  [QUOTE_STATUS.PAID]: {
    label: "Paid",
    color: "success",
    icon: "💳",
    description: "Payment received, service will begin",
  },
  [QUOTE_STATUS.IN_PROGRESS]: {
    label: "In Progress",
    color: "primary",
    icon: "🔄",
    description: "Service is being delivered",
  },
  [QUOTE_STATUS.COMPLETED]: {
    label: "Completed",
    color: "success",
    icon: "🎉",
    description: "Service completed successfully",
  },
  [QUOTE_STATUS.CANCELLED]: {
    label: "Cancelled",
    color: "error",
    icon: "🚫",
    description: "Quote request was cancelled",
  },
};

// Priority labels
export const QUOTE_PRIORITY_CONFIG = {
  [QUOTE_PRIORITY.NORMAL]: {
    label: "Normal",
    color: "default",
    icon: "📝",
    description: "Standard response time",
  },
  [QUOTE_PRIORITY.URGENT]: {
    label: "Urgent",
    color: "error",
    icon: "🔥",
    description: "Need response quickly",
  },
  [QUOTE_PRIORITY.FLEXIBLE]: {
    label: "Flexible",
    color: "success",
    icon: "🌿",
    description: "No rush, just exploring",
  },
};

// Cancel reason labels
export const QUOTE_CANCEL_REASON_LABELS = {
  [QUOTE_CANCEL_REASON.BUYER_CHANGED_MIND]: "Changed my mind",
  [QUOTE_CANCEL_REASON.BUYER_FOUND_ALTERNATIVE]: "Found another option",
  [QUOTE_CANCEL_REASON.BUYER_BUDGET_ISSUES]: "Budget constraints",
  [QUOTE_CANCEL_REASON.SELLER_UNAVAILABLE]: "Currently unavailable",
  [QUOTE_CANCEL_REASON.SELLER_CANNOT_FULFILL]: "Cannot fulfill requirements",
  [QUOTE_CANCEL_REASON.SELLER_PRICING_ERROR]: "Pricing error",
  [QUOTE_CANCEL_REASON.MUTUAL_AGREEMENT]: "Mutual agreement",
  [QUOTE_CANCEL_REASON.DISPUTE]: "Dispute",
  [QUOTE_CANCEL_REASON.OTHER]: "Other reason",
};
