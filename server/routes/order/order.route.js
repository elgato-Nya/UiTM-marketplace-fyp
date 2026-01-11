const express = require("express");

const {
  handleCreateOrder,
  handleGetOrder,
  handleGetMyOrders,
  handleUpdateOrderStatus,
  handleCancelOrder,
  handleGetOrdersByStatus,
  handleGetSellerOrders,
  handleGetOrderAnalytics,
} = require("../../controllers/order/order.controller");
const {
  protect,
  authorize,
  isOrderParticipant,
} = require("../../middleware/auth/auth.middleware");
const {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateCancelOrder,
  validateGetOrder,
  validateGetOrders,
  validateOrderIdParam,
  validateOrderStatusParam,
  validatePagination,
} = require("../../middleware/validations/order/order.validation");
const {
  standardLimiter,
  orderCreateLimiter,
} = require("../../middleware/limiters.middleware");

/**
 * Order Routes
 *
 * PURPOSE: Handle marketplace order operations and management
 * SCOPE: Order CRUD, buyer/seller management, order workflow, analytics
 * AUTHENTICATION: All routes require authentication (no public order access)
 * AUTHORIZATION: Role-based (buyer, seller, admin) with ownership verification
 * RATE LIMITING: standardLimiter for reads, orderCreateLimiter for creation
 *
 * ROUTE STRUCTURE:
 * - /api/orders (order creation and user order retrieval)
 * - /api/orders/:id (individual order operations)
 * - /api/orders/my-orders (current user's orders with role filtering)
 * - /api/orders/seller/orders (seller-specific order management)
 * - /api/orders/status/:status (admin order filtering by status)
 * - /api/orders/analytics (order analytics and metrics)
 *
 * BUSINESS RULES:
 * - Buyers can create orders and view their purchases
 * - Sellers can view and manage their sales orders
 * - Both buyers and sellers can cancel orders under certain conditions
 * - Admins have full access to all orders and analytics
 * - Order modifications require participant verification
 *
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */

const router = express.Router();

// ==================== AUTHENTICATED ROUTES ====================

// Apply authentication and standard rate limiting to all routes
router.use(protect);
router.use(standardLimiter);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (All authenticated users can create orders)
 * @ratelimit 10 requests per 15 minutes (stricter for order creation)
 * @body    items[], deliveryAddress, deliveryMethod, paymentMethod
 * @returns Created order data with order number
 * @note    Validates stock availability and single seller rule
 */
router.post("/", orderCreateLimiter, validateCreateOrder, handleCreateOrder);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get current user's orders with role-based filtering
 * @access  Private
 * @query   role (buyer|seller), page, limit, sort, status, paymentStatus, deliveryStatus, startDate, endDate, fields
 * @returns Paginated user orders (purchases or sales based on role)
 * @note    Role query parameter determines perspective (buyer vs seller view)
 */
router.get(
  "/my-orders",
  validateGetOrders,
  validatePagination,
  handleGetMyOrders
);

/**
 * @route   GET /api/orders/seller/orders
 * @desc    Get seller's order management view with enhanced filtering
 * @access  Private (Sellers and Admins only)
 * @query   page, limit, sort, status, paymentStatus, deliveryStatus, urgent, startDate, endDate, fields
 * @returns Seller orders with business metrics and dashboard data
 * @note    Includes metrics for seller dashboard functionality
 */
router.get(
  "/seller",
  authorize("merchant", "admin"),
  validateGetOrders,
  validatePagination,
  handleGetSellerOrders
);

/**
 * @route   GET /api/orders/analytics
 * @desc    Get order analytics and metrics
 * @access  Private (Role-based analytics)
 * @query   period (day|week|month|year)
 * @returns Analytics data based on user role (buyer, seller, or admin view)
 * @note    Different analytics views for buyers, sellers, and admins
 */
router.get("/analytics", validateGetOrders, handleGetOrderAnalytics);

/**
 * @route   GET /api/orders/status/:status
 * @desc    Get orders by status for admin dashboard
 * @access  Private (Admins only)
 * @params  status - Order status to filter by
 * @query   page, limit, sort, fields
 * @returns Paginated orders with specified status
 * @note    Admin-only endpoint for order management dashboard
 */
router.get(
  "/status/:status",
  authorize("admin"),
  validateOrderStatusParam,
  validateGetOrders,
  validatePagination,
  handleGetOrdersByStatus
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID with permission checking
 * @access  Private (Order participants and admins only)
 * @params  id - Order ID
 * @query   fields, includeHistory
 * @returns Order data with optional status history
 * @note    Only accessible by buyer, seller, or admin
 */
router.get(
  "/:id",
  validateOrderIdParam,
  validateGetOrder,
  isOrderParticipant,
  handleGetOrder
);

// ==================== ORDER MODIFICATION ROUTES ====================

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status with validation
 * @access  Private (Order participants and admins only)
 * @params  id - Order ID
 * @body    status, notes (optional)
 * @returns Updated order with new status
 * @note    Status transitions are validated, requires appropriate permissions
 */
router.patch(
  "/status/:id",
  validateOrderIdParam,
  isOrderParticipant,
  validateUpdateOrderStatus,
  handleUpdateOrderStatus
);

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel order with stock restoration
 * @access  Private (Order participants only)
 * @params  id - Order ID
 * @body    reason, description (optional)
 * @returns Cancelled order confirmation with restored stock info
 * @note    Role-based cancellation rules apply, stock is automatically restored
 */
router.patch(
  "/cancel/:id",
  validateOrderIdParam,
  isOrderParticipant,
  validateCancelOrder,
  handleCancelOrder
);

module.exports = router;
