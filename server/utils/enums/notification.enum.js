/**
 * Notification Type Enum
 *
 * PURPOSE: Define all notification types for the platform
 * PATTERN: Object.freeze (same as QuoteStatus, QuotePriority, etc.)
 *
 * EMAIL POLICY (6 CRITICAL TYPES ONLY - to avoid spam):
 * 1. NEW_ORDER_RECEIVED (Seller) - Business critical
 * 2. ORDER_DELIVERED (Buyer) - Final order status
 * 3. QUOTE_REQUEST_RECEIVED (Seller) - Business opportunity
 * 4. QUOTE_RESPONSE_RECEIVED (Buyer) - Awaited response
 * 5. PASSWORD_RESET - Security critical
 * 6. SECURITY_ALERT - Security critical
 *
 * All other notifications are in-app only.
 */

const NotificationType = Object.freeze({
  // Order Notifications
  ORDER_PLACED: "order_placed",
  ORDER_CONFIRMED: "order_confirmed",
  ORDER_PROCESSING: "order_processing",
  ORDER_SHIPPED: "order_shipped",
  ORDER_DELIVERED: "order_delivered", // Email + In-App (CRITICAL)
  ORDER_CANCELLED: "order_cancelled",
  ORDER_REFUNDED: "order_refunded",

  // Shopping Notifications (In-App Only)
  PRICE_DROP: "price_drop",
  BACK_IN_STOCK: "back_in_stock",
  CART_REMINDER: "cart_reminder",
  WISHLIST_AVAILABLE: "wishlist_available",

  // Merchant Notifications
  NEW_ORDER_RECEIVED: "new_order_received", // Email + In-App (CRITICAL)
  LOW_STOCK_ALERT: "low_stock_alert",
  LISTING_APPROVED: "listing_approved",
  LISTING_REJECTED: "listing_rejected",
  REVIEW_RECEIVED: "review_received",
  PAYOUT_PROCESSED: "payout_processed",

  // Quote Notifications
  QUOTE_REQUEST_RECEIVED: "quote_request_received", // Email + In-App (CRITICAL)
  QUOTE_RESPONSE_RECEIVED: "quote_response_received", // Email + In-App (CRITICAL)
  QUOTE_ACCEPTED: "quote_accepted",
  QUOTE_REJECTED: "quote_rejected",
  QUOTE_EXPIRING_SOON: "quote_expiring_soon",
  QUOTE_EXPIRED: "quote_expired",

  // System Notifications
  WELCOME: "welcome",
  EMAIL_VERIFIED: "email_verified",
  PASSWORD_RESET: "password_reset", // Email + In-App (CRITICAL)
  PASSWORD_CHANGED: "password_changed",
  MERCHANT_VERIFIED: "merchant_verified",
  MERCHANT_REJECTED: "merchant_rejected",
  ACCOUNT_SUSPENDED: "account_suspended",
  SECURITY_ALERT: "security_alert", // Email + In-App (CRITICAL)

  // Admin Notifications (In-App Only)
  PENDING_MERCHANT_VERIFICATION: "pending_merchant_verification",
  FLAGGED_LISTING: "flagged_listing",
  CONTACT_FORM_SUBMISSION: "contact_form_submission",
  PAYMENT_DISPUTE: "payment_dispute",
  SYSTEM_ALERT: "system_alert",
});

const NotificationCategory = Object.freeze({
  ORDER: "order",
  SHOPPING: "shopping",
  MERCHANT: "merchant",
  QUOTE: "quote",
  SYSTEM: "system",
  ADMIN: "admin",
});

const NotificationPriority = Object.freeze({
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
});

/**
 * Notification Configuration Map
 *
 * Maps each notification type to its category, priority, channels, icon, and TTL.
 * Channels determine delivery method:
 * - "in_app": Always shown in notification center
 * - "email": Also sent via email (only for 6 critical types)
 */
const NotificationConfig = Object.freeze({
  // ==================== ORDER NOTIFICATIONS ====================
  [NotificationType.ORDER_PLACED]: {
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "📦",
    ttlDays: 30,
  },
  [NotificationType.ORDER_CONFIRMED]: {
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "✔️",
    ttlDays: 30,
  },
  [NotificationType.ORDER_PROCESSING]: {
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "⚙️",
    ttlDays: 30,
  },
  [NotificationType.ORDER_SHIPPED]: {
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "🚚",
    ttlDays: 30,
  },
  [NotificationType.ORDER_DELIVERED]: {
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.HIGH,
    channels: ["in_app", "email"],
    icon: "✅",
    ttlDays: 30,
  },
  [NotificationType.ORDER_CANCELLED]: {
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "❌",
    ttlDays: 30,
  },
  [NotificationType.ORDER_REFUNDED]: {
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "💸",
    ttlDays: 30,
  },

  // ==================== SHOPPING NOTIFICATIONS ====================
  [NotificationType.PRICE_DROP]: {
    category: NotificationCategory.SHOPPING,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "💰",
    ttlDays: 7,
  },
  [NotificationType.BACK_IN_STOCK]: {
    category: NotificationCategory.SHOPPING,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "📢",
    ttlDays: 7,
  },
  [NotificationType.CART_REMINDER]: {
    category: NotificationCategory.SHOPPING,
    priority: NotificationPriority.LOW,
    channels: ["in_app"],
    icon: "🛒",
    ttlDays: 3,
  },
  [NotificationType.WISHLIST_AVAILABLE]: {
    category: NotificationCategory.SHOPPING,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "❤️",
    ttlDays: 7,
  },

  // ==================== MERCHANT NOTIFICATIONS ====================
  [NotificationType.NEW_ORDER_RECEIVED]: {
    category: NotificationCategory.MERCHANT,
    priority: NotificationPriority.URGENT,
    channels: ["in_app", "email"],
    icon: "🛍️",
    ttlDays: 30,
  },
  [NotificationType.LOW_STOCK_ALERT]: {
    category: NotificationCategory.MERCHANT,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "📉",
    ttlDays: 14,
  },
  [NotificationType.LISTING_APPROVED]: {
    category: NotificationCategory.MERCHANT,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "✅",
    ttlDays: 14,
  },
  [NotificationType.LISTING_REJECTED]: {
    category: NotificationCategory.MERCHANT,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "🚫",
    ttlDays: 30,
  },
  [NotificationType.REVIEW_RECEIVED]: {
    category: NotificationCategory.MERCHANT,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "⭐",
    ttlDays: 14,
  },
  [NotificationType.PAYOUT_PROCESSED]: {
    category: NotificationCategory.MERCHANT,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "💳",
    ttlDays: 30,
  },

  // ==================== QUOTE NOTIFICATIONS ====================
  [NotificationType.QUOTE_REQUEST_RECEIVED]: {
    category: NotificationCategory.QUOTE,
    priority: NotificationPriority.HIGH,
    channels: ["in_app", "email"],
    icon: "💬",
    ttlDays: 30,
  },
  [NotificationType.QUOTE_RESPONSE_RECEIVED]: {
    category: NotificationCategory.QUOTE,
    priority: NotificationPriority.HIGH,
    channels: ["in_app", "email"],
    icon: "💬",
    ttlDays: 30,
  },
  [NotificationType.QUOTE_ACCEPTED]: {
    category: NotificationCategory.QUOTE,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "🤝",
    ttlDays: 30,
  },
  [NotificationType.QUOTE_REJECTED]: {
    category: NotificationCategory.QUOTE,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "🚫",
    ttlDays: 14,
  },
  [NotificationType.QUOTE_EXPIRING_SOON]: {
    category: NotificationCategory.QUOTE,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "⏰",
    ttlDays: 7,
  },
  [NotificationType.QUOTE_EXPIRED]: {
    category: NotificationCategory.QUOTE,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "⌛",
    ttlDays: 7,
  },

  // ==================== SYSTEM NOTIFICATIONS ====================
  [NotificationType.WELCOME]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "👋",
    ttlDays: 30,
  },
  [NotificationType.EMAIL_VERIFIED]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "✉️",
    ttlDays: 14,
  },
  [NotificationType.PASSWORD_RESET]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.URGENT,
    channels: ["in_app", "email"],
    icon: "🔐",
    ttlDays: 7,
  },
  [NotificationType.PASSWORD_CHANGED]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "🔒",
    ttlDays: 14,
  },
  [NotificationType.MERCHANT_VERIFIED]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "🏪",
    ttlDays: 30,
  },
  [NotificationType.MERCHANT_REJECTED]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "🚫",
    ttlDays: 30,
  },
  [NotificationType.ACCOUNT_SUSPENDED]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.URGENT,
    channels: ["in_app"],
    icon: "🔴",
    ttlDays: 30,
  },
  [NotificationType.SECURITY_ALERT]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.URGENT,
    channels: ["in_app", "email"],
    icon: "⚠️",
    ttlDays: 30,
  },

  // ==================== ADMIN NOTIFICATIONS ====================
  [NotificationType.PENDING_MERCHANT_VERIFICATION]: {
    category: NotificationCategory.ADMIN,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "🔍",
    ttlDays: 14,
  },
  [NotificationType.FLAGGED_LISTING]: {
    category: NotificationCategory.ADMIN,
    priority: NotificationPriority.HIGH,
    channels: ["in_app"],
    icon: "🚩",
    ttlDays: 14,
  },
  [NotificationType.CONTACT_FORM_SUBMISSION]: {
    category: NotificationCategory.ADMIN,
    priority: NotificationPriority.NORMAL,
    channels: ["in_app"],
    icon: "📩",
    ttlDays: 14,
  },
  [NotificationType.PAYMENT_DISPUTE]: {
    category: NotificationCategory.ADMIN,
    priority: NotificationPriority.URGENT,
    channels: ["in_app"],
    icon: "⚖️",
    ttlDays: 30,
  },
  [NotificationType.SYSTEM_ALERT]: {
    category: NotificationCategory.ADMIN,
    priority: NotificationPriority.URGENT,
    channels: ["in_app"],
    icon: "🔔",
    ttlDays: 30,
  },
});

module.exports = {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationConfig,
};
