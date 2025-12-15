const { User } = require("../../models/user");
const Listing = require("../../models/listing/listing.model");
const logger = require("../../utils/logger");
const asyncHandler = require("../../utils/asyncHandler");
const {
  createAuthError,
  createNotFoundError,
  createForbiddenError,
} = require("../../utils/errors");
const {
  getTokenFromHeader,
  verifyAccessToken,
} = require("../../services/jwt.service");

/**
 * Authentication Middleware
 *
 * PURPOSE: Protect routes that require authentication
 * WRAPPED: With asyncHandler for automatic error handling
 * PROCESS: Extract token -> Verify -> Find user -> Attach to request
 */
const protect = asyncHandler(async (req, res, next) => {
  const stringUserId = req.user ? req.user._id.toString() : "anonymous";
  // Extract token from Authorization header
  const token = getTokenFromHeader(req);
  if (!token) {
    logger.warn("Unauthorized access attempt: No token provided from header", {
      action: "protect",
      userId: stringUserId,
    });
    throw createAuthError("Unauthorized access - No token provided");
  }

  // Verify the access token
  const decoded = verifyAccessToken(token);
  if (!decoded || !decoded.userId) {
    logger.warn("Unauthorized access attempt: Invalid token", {
      action: "protect",
      userId: stringUserId,
    });
    throw createAuthError("Invalid token");
  }

  // Find the user and attach to request
  const user = await User.findById(decoded.userId).select(
    "+email -password -refreshTokens"
  );
  if (!user) {
    logger.warn("Unauthorized access attempt: User not found", {
      action: "protect",
      userId: decoded.userId.toString(),
    });
    throw createNotFoundError("User");
  }

  // Attach user to request object for use in subsequent middleware/routes
  req.user = user;

  // Update last activity fields directly without causing async issues
  // Using setImmediate to avoid blocking the request
  setImmediate(() => {
    const now = new Date();
    User.findByIdAndUpdate(user._id, {
      lastActive: now,
      lastActivityAt: now,
      isActive: true,
    }).catch((error) => {
      logger.error("Failed to update user activity in auth middleware", {
        userId: user._id.toString(),
        error: error.message,
      });
    });
  });

  next();
}, "auth_protection");

/**
 * Role-based Authorization Middleware
 *
 * PURPOSE: Restrict access based on user roles
 * USAGE: authorize('admin', 'merchant') - allows admin OR merchant
 * NOTE: This is NOT wrapped with asyncHandler because it's a higher-order function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      logger.warn("Unauthorized access attempt: No user roles", {
        action: "authorize",
        userId: req.user ? req.user._id : "anonymous",
      });
      throw createForbiddenError("No user roles found");
    }

    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];
    const hasPermission = roles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      logger.warn("Insufficient permissions", {
        userId: req.user._id,
        userRoles: userRoles,
        requiredRoles: roles,
        route: req.originalUrl,
      });
      throw createForbiddenError("Insufficient permissions");
    }

    next();
  };
};

/**
 * Listing Ownership Authorization Middleware
 *
 * PURPOSE: Verify user owns the listing or has admin privileges
 * USAGE: isListingOwner('listingId') - checks ownership of listing in params
 * WRAPPED: With asyncHandler for automatic error handling
 * PROCESS: Check admin role -> Find listing -> Verify ownership -> Attach to request
 */
const isListingOwner = (paramName = "id") => {
  return asyncHandler(async (req, res, next) => {
    const listingId = req.params[paramName];
    const userId = req.user._id;

    if (!listingId) {
      logger.warn("Listing ownership check: No listing ID provided", {
        action: "listing_ownership_check",
        userId: userId,
        route: req.originalUrl,
        paramName: paramName,
      });
      throw createForbiddenError("Listing ID is required");
    }

    // Admins bypass ownership checks (following your role-based pattern)
    if (req.user.roles && req.user.roles.includes("admin")) {
      logger.info("Admin accessing listing", {
        action: "admin_listing_access",
        userId: userId,
        listingId: listingId,
        route: req.originalUrl,
      });
      return next();
    }

    // Find listing and verify ownership
    const listing = await Listing.findById(listingId).select(
      "seller.userId name"
    );

    if (!listing) {
      logger.warn("Listing ownership check: Listing not found", {
        action: "listing_ownership_check",
        userId: userId,
        listingId: listingId,
        route: req.originalUrl,
      });
      throw createNotFoundError("Listing");
    }

    // Verify ownership (following your ownership pattern)
    if (listing.seller.userId.toString() !== userId.toString()) {
      logger.security("Unauthorized listing access attempt", {
        listingId: listingId,
        listingName: listing.name,
        listingOwnerId: listing.seller.userId,
        attemptedBy: userId,
        action: "unauthorized_listing_access",
        route: req.originalUrl,
        method: req.method,
      });
      throw createForbiddenError("You can only access your own listings");
    }

    // Attach listing to request for service to use (optimization)
    req.listing = listing;

    logger.info("Listing ownership verified", {
      action: "listing_ownership_verified",
      userId: userId,
      listingId: listingId,
      route: req.originalUrl,
    });

    next();
  }, "listing_ownership_check");
};

const isOrderParticipant = asyncHandler(async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    const userRoles = req.user.roles;

    // Admins have access to all orders
    if (userRoles.includes("admin")) {
      return next();
    }

    const { Order } = require("../../models/order");
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        code: "ORDER_NOT_FOUND",
      });
    }

    // Check if user is buyer or seller
    const isBuyer = order.buyer.userId.toString() === userId.toString();
    const isSeller = order.seller.userId.toString() === userId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a participant in this order.",
        code: "ORDER_ACCESS_DENIED",
      });
    }

    // Attach order to request for use in controller
    req.order = order;
    next();
  } catch (error) {
    logger.error("Order participant check failed:", {
      error: error.message,
      orderId: req.params.id,
      userId: req.user._id,
    });

    return res.status(500).json({
      success: false,
      message: "Order access verification failed",
      code: "ORDER_AUTH_ERROR",
    });
  }
});

/**
 * Optional Authentication Middleware
 *
 * PURPOSE: Attach user to request if authenticated, but allow request to proceed if not
 * USE CASE: Public endpoints that benefit from knowing if user is authenticated
 *           (e.g., contact form - can pre-fill user info if logged in)
 * BEHAVIOR:
 * - If valid token: Attach user to req.user
 * - If no token or invalid: Continue without user (req.user = null)
 * - Never throws error (unlike protect middleware)
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = getTokenFromHeader(req);

    // If no token, continue as guest
    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify the token
    const decoded = verifyAccessToken(token);

    // If token invalid or no userId, continue as guest
    if (!decoded || !decoded.userId) {
      req.user = null;
      return next();
    }

    // Try to find the user
    const user = await User.findById(decoded.userId).select(
      "+email -password -refreshTokens"
    );

    // Attach user if found, otherwise continue as guest
    req.user = user || null;

    next();
  } catch (error) {
    // If any error occurs, just continue as guest
    logger.debug("Optional auth failed, continuing as guest:", {
      error: error.message,
    });
    req.user = null;
    next();
  }
});

module.exports = {
  protect,
  authorize,
  optionalAuth,
  isListingOwner,
  isOrderParticipant,
};
