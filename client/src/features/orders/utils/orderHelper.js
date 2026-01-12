import { format, formatDistanceToNow } from "date-fns";

// format date to "dd MMM yyyy, hh:mm a" (e.g., 05 Oct 2023, 02:30 PM)
export function formatOrderDate(date, formatStr = "dd MMM yyyy, hh:mm a") {
  if (!date) return "N/A";
  try {
    return format(new Date(date), formatStr);
  } catch {
    return "Invalid date";
  }
}

// format date to relative time (e.g., "3 days ago")
export function formatRelativeTime(date) {
  if (!date) return "N/A";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "Invalid date";
  }
}

export function getStatusColor(status) {
  const orderColorMap = {
    pending: "warning",
    confirmed: "info",
    processing: "info",
    shipped: "primary",
    delivered: "success",
    completed: "success",
    cancelled: "error",
    refunded: "default",
  };
  return orderColorMap[status] || "default";
}

// Format currency using locale-aware formatting (e.g., 1234.5 -> MYR 1,234.50)
// honestly, i just need RM sign but why not accommodate other currencies too
export function formatCurrency(amount, currency = "MYR") {
  if (amount === null || amount === undefined) return "N/A";

  const numericAmount =
    typeof amount === "number" ? amount : Number.parseFloat(amount);
  if (!Number.isFinite(numericAmount)) return "N/A";

  const safeCurrency = currency || "MYR";

  try {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  }
}

export function canCancelOrder(order, orderRole) {
  if (!order || !order.status) return false;

  const isBuyer = orderRole === "buyer";
  const isSeller = orderRole === "seller";

  // Buyers can cancel if order is pending
  if (isBuyer && order.status === "pending") {
    return true;
  }

  // Sellers can cancel if order is pending or confirmed
  if (isSeller && ["pending", "confirmed"].includes(order.status)) {
    return true;
  }

  return false;
}

// todo: tryna find a way so that admin can update status and it will be logged
export function canUpdateStatus(order, orderRole) {
  if (!order || !order.status) return false;

  if (orderRole !== "seller") return false;

  // cant update the last stage of order status
  const finalStatuses = ["completed", "cancelled", "refunded"];
  return !finalStatuses.includes(order.status);
}

/**
 * Get valid next statuses for order status updates
 * Enterprise marketplace pattern: Allow flexible status transitions
 * - Sellers can skip intermediate steps for efficiency
 * - Example: confirmed -> completed (for in-person pickup orders)
 */
export function getNextStatuses(currentStatus) {
  const transitions = {
    // Pending: Can confirm, process directly, or cancel
    pending: ["confirmed", "processing", "cancelled"],
    // Confirmed: Can process, ship directly, or even complete (for pickup), or cancel
    confirmed: ["processing", "shipped", "completed", "cancelled"],
    // Processing: Can ship, deliver directly, complete, or cancel
    processing: ["shipped", "delivered", "completed", "cancelled"],
    // Shipped: Can mark delivered or complete
    shipped: ["delivered", "completed"],
    // Delivered: Can complete
    delivered: ["completed"],
    // Terminal states
    completed: [],
    cancelled: [],
    refunded: [],
  };

  return transitions[currentStatus] || [];
}

/**
 * Calculate order summary
 */
export function calculateOrderSummary(order) {
  if (!order) return null;

  // Calculate subtotal from items
  const subtotal =
    order.items?.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0) || 0;

  const deliveryFee = order.deliveryFee || 0;
  const tax = order.tax || 0;
  const discount = order.totalDiscount || 0;
  const total = order.totalAmount || 0;

  return {
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    itemCount: order.items?.length || 0,
  };
}

/**
 * Get delivery method label
 */
export function getDeliveryMethodLabel(method) {
  const labels = {
    self_pickup: "Self Pickup",
    delivery: "Home Delivery",
    meetup: "Meet-up",
    campus_delivery: "Campus Delivery",
    room_delivery: "Room Delivery",
  };
  return labels[method] || method;
}

/**
 * Get payment method label
 */
export function getPaymentMethodLabel(method) {
  const labels = {
    cod: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
    e_wallet: "E-Wallet",
    credit_card: "Credit Card",
  };
  return labels[method] || method;
}
