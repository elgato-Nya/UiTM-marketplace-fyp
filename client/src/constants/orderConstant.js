export const PAYMENT_METHOD = {
  COD: "cod",
  BANK_TRANSFER: "bank_transfer",
  E_WALLET: "e_wallet",
  CREDIT_CARD: "credit_card",
};

export const PAYMENT_STATUS = {
  COD_CONFIRMED: "cod_confirmed",
  COD_DECLINED: "cod_declined",
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export const DELIVERY_METHOD = {
  SELF_PICKUP: "self_pickup",
  DELIVERY: "delivery",
  MEETUP: "meetup",
  CAMPUS_DELIVERY: "campus_delivery",
  ROOM_DELIVERY: "room_delivery",
};

export const ADDRESS_TYPE = {
  CAMPUS: "campus",
  PERSONAL: "personal",
  PICKUP: "pickup",
};

export const CANCEL_REASON = {
  BUYER_REQUEST: "buyer_request",
  SELLER_UNAVAILABLE: "seller_unavailable",
  PAYMENT_FAILED: "payment_failed",
  STOCK_INSUFFICIENT: "stock_insufficient",
  DELIVERY_ISSUES: "delivery_issues",
  OTHER: "other",
};

// !! idk yet about everything below
// Status display configuration
export const STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    label: "Pending",
    color: "warning",
    icon: "⏳",
    description: "Waiting for seller confirmation",
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: "Confirmed",
    color: "info",
    icon: "✅",
    description: "Order confirmed by seller",
  },
  [ORDER_STATUS.PROCESSING]: {
    label: "Processing",
    color: "info",
    icon: "📦",
    description: "Order is being prepared",
  },
  [ORDER_STATUS.SHIPPED]: {
    label: "Shipped",
    color: "primary",
    icon: "🚚",
    description: "Order is on the way",
  },
  [ORDER_STATUS.DELIVERED]: {
    label: "Delivered",
    color: "success",
    icon: "📬",
    description: "Order has been delivered",
  },
  [ORDER_STATUS.COMPLETED]: {
    label: "Completed",
    color: "success",
    icon: "✔️",
    description: "Order completed successfully",
  },
  [ORDER_STATUS.CANCELLED]: {
    label: "Cancelled",
    color: "error",
    icon: "❌",
    description: "Order has been cancelled",
  },
  [ORDER_STATUS.REFUNDED]: {
    label: "Refunded",
    color: "default",
    icon: "💰",
    description: "Payment has been refunded",
  },
};

// Payment method labels
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.COD]: "Cash on Delivery",
  [PAYMENT_METHOD.BANK_TRANSFER]: "Bank Transfer",
  [PAYMENT_METHOD.E_WALLET]: "E-Wallet",
  [PAYMENT_METHOD.CREDIT_CARD]: "Credit Card",
};

// Delivery method labels
export const DELIVERY_METHOD_LABELS = {
  [DELIVERY_METHOD.SELF_PICKUP]: "Self Pickup",
  [DELIVERY_METHOD.DELIVERY]: "Home Delivery",
  [DELIVERY_METHOD.MEETUP]: "Meet-up",
  [DELIVERY_METHOD.CAMPUS_DELIVERY]: "Campus Delivery",
  [DELIVERY_METHOD.ROOM_DELIVERY]: "Room Delivery",
};

// Cancel reason labels
export const CANCEL_REASON_LABELS = {
  [CANCEL_REASON.BUYER_REQUEST]: "Buyer requested cancellation",
  [CANCEL_REASON.SELLER_UNAVAILABLE]: "Seller unavailable",
  [CANCEL_REASON.PAYMENT_FAILED]: "Payment failed",
  [CANCEL_REASON.STOCK_INSUFFICIENT]: "Insufficient stock",
  [CANCEL_REASON.DELIVERY_ISSUES]: "Delivery issues",
  [CANCEL_REASON.OTHER]: "Other reason",
};
