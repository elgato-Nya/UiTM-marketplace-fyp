const PaymentMethod = Object.freeze({
  COD: "cod",
  BANK_TRANSFER: "bank_transfer",
  E_WALLET: "e_wallet",
  CREDIT_CARD: "credit_card",
});

const PaymentStatus = Object.freeze({
  COD_CONFIRMED: "cod_confirmed",
  COD_DECLINED: "cod_declined",
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
});

const OrderStatus = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
});

const DeliveryMethod = Object.freeze({
  SELF_PICKUP: "self_pickup",
  DELIVERY: "delivery",
  MEETUP: "meetup",
  CAMPUS_DELIVERY: "campus_delivery",
  ROOM_DELIVERY: "room_delivery",
});

const AddressType = Object.freeze({
  CAMPUS: "campus",
  PERSONAL: "personal",
  PICKUP: "pickup",
});

const CancelReason = Object.freeze({
  BUYER_REQUEST: "buyer_request",
  SELLER_UNAVAILABLE: "seller_unavailable",
  PAYMENT_FAILED: "payment_failed",
  STOCK_INSUFFICIENT: "stock_insufficient",
  DELIVERY_ISSUES: "delivery_issues",
  OTHER: "other",
});

module.exports = {
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  DeliveryMethod,
  CancelReason,
  AddressType,
};
