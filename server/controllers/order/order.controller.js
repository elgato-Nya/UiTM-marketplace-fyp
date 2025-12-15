const BaseController = require("../base.controller");
const {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getOrdersByStatus,
} = require("../../services/order/order.service");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");

const baseController = new BaseController();

const handleCreateOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orderDataDTO = req.body;

  const sanitizedOrderData = sanitizeObject(orderDataDTO);
  const order = await createOrder(userId, sanitizedOrderData);

  baseController.logAction("create_order", req, {
    buyerId: userId.toString(),
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    itemCount: order.items.length,
    totalAmount: order.pricing.totalAmount,
    paymentMethod: order.payment.method,
    deliveryMethod: order.delivery.method,
    sellerId: order.seller.userId.toString(),
  });

  return baseController.sendSuccess(
    res,
    order,
    "Order created successfully",
    201
  );
}, "handle_create_order");

const handleGetOrder = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params;
  const { fields, includeHistory } = sanitizeQuery(req.query);
  const userId = req.user._id;
  const userRoles = req.user.roles;

  const options = {
    userId,
    userRoles,
    fields: fields || "",
    includeHistory: includeHistory === "true",
  };

  const order = await getOrderById(orderId, options);

  return baseController.sendSuccess(res, order, "Order retrieved successfully");
}, "handle_get_order");

const handleGetMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sanitizedQuery = sanitizeQuery(req.query);
  const {
    page = 1,
    limit = 20,
    sort,
    status,
    paymentStatus,
    deliveryStatus,
    startDate,
    endDate,
    fields,
    role,
  } = sanitizedQuery;

  const validRoles = ["buyer", "seller"];
  // ! The role here is not a definitive user role, just a filter for order view perspective
  const orderRole = role && validRoles.includes(role) ? role : "buyer";

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100),
    sort,
    status,
    paymentStatus,
    deliveryStatus,
    startDate,
    endDate,
    fields,
  };

  const orders = await getUserOrders(userId, orderRole, options);

  return baseController.sendSuccess(
    res,
    orders,
    `${
      orderRole === "buyer" ? "Purchase" : "Sales"
    } orders retrieved successfully`
  );
}, "handle_get_my_orders");

const handleUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params;
  const userId = req.user._id;
  const userRoles = req.user.roles;
  const updateOrderDTO = req.body;
  const { status: newStatus, notes } = sanitizeObject(updateOrderDTO);

  const updatedOrder = await updateOrderStatus(
    orderId,
    userId,
    newStatus,
    userRoles,
    notes
  );

  baseController.logAction("update_order_status", req, {
    orderId,
    userId,
    userRoles,
    oldStatus:
      updatedOrder.statusHistory?.[updatedOrder.statusHistory.length - 2]
        ?.status,
    newStatus,
    notes: notes || null,
  });

  return baseController.sendSuccess(
    res,
    updatedOrder,
    `Order status updated to ${newStatus} successfully`
  );
}, "handle_update_order_status");

const handleCancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: orderId } = req.params;
  const cancelOrderDTO = req.body;

  const { reason, description } = sanitizeObject(cancelOrderDTO);
  // TODO: create valid reason enum and validate in validation middleware
  const validReasons = [
    "buyer_request",
    "seller_unavailable",
    "payment_failed",
    "stock_insufficient",
    "delivery_issues",
    "other",
  ];

  if (!validReasons.includes(reason)) {
    return baseController.sendError(
      res,
      `Invalid reason. Must be one of: ${validReasons.join(", ")}`,
      400,
      "INVALID_REASON"
    );
  }

  const cancelledOrder = await cancelOrder(
    orderId,
    userId,
    reason,
    description
  );

  baseController.logAction("cancel_order", req, {
    orderId,
    userId,
    reason,
    description: description || null,
    restoredItems: cancelledOrder.items.length,
  });

  return baseController.sendSuccess(
    res,
    {
      orderId: cancelledOrder._id,
      orderNumber: cancelledOrder.orderNumber,
      status: cancelledOrder.status,
      cancelledAt: cancelledOrder.updatedAt,
      reason,
    },
    "Order cancelled successfully"
  );
}, "handle_cancel_order");

const handleGetOrdersByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page = 1, limit = 50, sort, fields } = sanitizeQuery(req.query);

  const validStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "completed",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    return baseController.sendError(
      res,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      400,
      "INVALID_STATUS"
    );
  }

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100),
    sort,
    fields,
  };

  const orders = await getOrdersByStatus(status, options);

  return baseController.sendSuccess(
    res,
    orders,
    `Orders with status ${status} retrieved successfully`
  );
}, "handle_get_orders_by_status");

const handleGetSellerOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    page = 1,
    limit = 20,
    sort,
    status,
    paymentStatus,
    deliveryStatus,
    startDate,
    endDate,
    fields,
    urgent, // Filter for orders needing attention
  } = sanitizeQuery(req.query);

  let options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100),
    sort,
    status,
    paymentStatus,
    deliveryStatus,
    startDate,
    endDate,
    fields,
  };

  // Handle urgent orders filter
  if (urgent === "true") {
    options.status = "confirmed"; // Orders that need processing
  }

  const result = await getUserOrders(userId, "seller", options);

  const metrics = {
    totalOrders: result.total,
    pendingOrders: result.orders.filter((o) => o.status === "confirmed").length,
    completedToday: result.orders.filter(
      (o) =>
        o.status === "completed" &&
        new Date(o.updatedAt).toDateString() === new Date().toDateString()
    ).length,
  };

  baseController.logAction("get_seller_orders", req, {
    sellerId: userId.toString(),
    filters: { status, paymentStatus, deliveryStatus, urgent },
    metrics,
  });

  return baseController.sendSuccess(
    res,
    {
      ...result,
      metrics,
    },
    "Seller orders retrieved successfully"
  );
}, "handle_get_seller_orders");

const handleGetOrderAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRoles = req.user.roles;
  const { period = "month" } = sanitizeQuery(req.query); // "day", "week", "month", "year"

  // TODO: This would be implemented in the service layer
  // !! For now, return a placeholder structure
  const analytics = {
    period,
    roles: userRoles,
    summary: {
      totalOrders: 0,
      totalValue: 0,
      averageOrderValue: 0,
      completionRate: 0,
    },
    trends: {
      ordersOverTime: [],
      statusDistribution: {},
      topCategories: [],
    },
    insights: [],
  };

  baseController.logAction("get_order_analytics", req, {
    userId,
    userRoles,
    period,
  });

  return baseController.sendSuccess(
    res,
    analytics,
    "Order analytics retrieved successfully"
  );
}, "handle_get_order_analytics");

module.exports = {
  handleCreateOrder,
  handleGetOrder,
  handleGetMyOrders,
  handleUpdateOrderStatus,
  handleCancelOrder,
  handleGetOrdersByStatus,
  handleGetSellerOrders,
  handleGetOrderAnalytics,
};
