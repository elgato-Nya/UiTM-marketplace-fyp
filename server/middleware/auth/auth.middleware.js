const { User } = require("../../models/user");
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
  // Extract token from Authorization header
  const token = getTokenFromHeader(req);
  if (!token) {
    logger.warn("Unauthorized access attempt: No token provided from header", {
      action: "protect",
      userId: req.user ? req.user._id : "anonymous",
    });
    throw createAuthError("Unauthorized access - No token provided");
  }

  // Verify the access token
  const decoded = verifyAccessToken(token);
  if (!decoded || !decoded.userId) {
    logger.warn("Unauthorized access attempt: Invalid token", {
      action: "protect",
      userId: req.user ? req.user._id : "anonymous",
    });
    throw createAuthError("Invalid token");
  }

  // Find the user and attach to request
  const user = await User.findById(decoded.userId).select(
    "-password -refreshTokens"
  );
  if (!user) {
    logger.warn("Unauthorized access attempt: User not found", {
      action: "protect",
      userId: decoded.userId,
    });
    throw createNotFoundError("User");
  }

  // Attach user to request object for use in subsequent middleware/routes
  req.user = user;

  // Update last active directly without causing async issues
  setImmediate(() => {
    User.findByIdAndUpdate(user._id, {
      lastActive: new Date(),
      isActive: true,
    }).catch((error) => {
      logger.error("Failed to update last active in auth middleware", {
        userId: user._id,
        error: error.message,
      });
    });
  });

  logger.auth("User authenticated successfully", user._id, {
    action: "protect",
    email: user.email,
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
    if (!req.user || !req.user.role) {
      logger.warn("Unauthorized access attempt: No user role", {
        action: "authorize",
        userId: req.user ? req.user._id : "anonymous",
      });
      throw createForbiddenError("No user role found");
    }

    const userRoles = Array.isArray(req.user.role)
      ? req.user.role
      : [req.user.role];
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

module.exports = {
  protect,
  authorize,
};
