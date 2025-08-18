const bcrypt = require("bcryptjs");

const User = require("../../models/user");
const logger = require("../../utils/logger");
const { sanitizeObject, sanitizeInput } = require("../../utils/sanitizer");
const {
  createAuthError,
  createNotFoundError,
  createConflictError,
} = require("../../utils/errors");
const { handleServiceError } = require("../base.service");
const { getTokenPair, verifyRefreshToken } = require("../jwt.service");

const createUser = async (userData) => {
  try {
    // Destructure password, sanitize the rest
    const { password, ...rest } = userData;
    const sanitizedData = sanitizeObject(rest);

    // Add password back (unmodified)
    sanitizedData.password = password;

    const existingUser = await User.findOne({
      email: sanitizedData.email.toLowerCase(),
    });
    if (existingUser) {
      logger.warn("Creating user failed: user already exists", {
        email: sanitizedData.email,
      });
      throw createConflictError(
        "Cannot create user who already exists",
        "USER_ALREADY_EXISTS"
      );
    }

    const user = new User(sanitizedData);
    user.lastActive = new Date();
    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    logger.auth("creating_user", user._id, {
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role,
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return userWithoutPassword;
  } catch (error) {
    handleServiceError(error, "createUser", { userData });
  }
};

const authenticateUser = async (email, password) => {
  try {
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    const user = await User.findByCredentials(sanitizedEmail, password);
    if (!user) {
      throw createAuthError(
        "Invalid email or password",
        "AUTH_INVALID_CREDENTIALS"
      );
    }

    user.lastActive = new Date();
    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    logger.auth("user_authenticated", user._id, {
      email: user.email,
      username: user.username,
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return userWithoutPassword;
  } catch (error) {
    handleServiceError(error, "authenticateUser", { email });
  }
};

const logoutUser = async (userId, refreshToken) => {
  try {
    if (!refreshToken) {
      logger.warn("Logout attempt failed: No refresh token provided", {
        action: "logout_user",
        userId,
      });
      throw createAuthError("No refresh token provided");
    }

    const user = await User.findById(userId).select("+refreshTokens");
    if (!user) {
      logger.warn("Logout attempt failed: User not found", {
        action: "logout_user",
        userId,
        refreshToken,
      });
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }

    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );

    if (user.refreshTokens.length === 0) {
      user.isActive = false;
    }

    await user.save({ validateBeforeSave: false });

    logger.auth("User logged out successfully", user._id, {
      email: user.email,
      action: "logout_user",
    });

    return {
      userId: user._id,
      refreshToken,
    };
  } catch (error) {
    handleServiceError(error, "logoutUser", {
      userId,
      refreshToken,
    });
  }
};

const refreshUserTokens = async (refreshToken) => {
  try {
    if (!refreshToken) {
      logger.warn("Refresh token missing in refreshUserTokens", {
        action: "refresh_tokens",
      });
      throw createAuthError(
        "No refresh token provided",
        "AUTH_NO_REFRESH_TOKEN"
      );
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId).select(
      "+refreshTokens -password -__v"
    );
    if (!user) {
      logger.error("Refresh token failed: User not found", {
        action: "refresh_tokens",
        userId: decoded.userId,
        refreshToken,
      });
      throw createNotFoundError(
        "User not found during token refresh",
        "USER_NOT_FOUND"
      );
    }
    if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      logger.error("Refresh token failed: Token not recognized for user", {
        action: "refresh_tokens",
        userId: decoded.userId,
        refreshToken,
      });
      throw createAuthError(
        "Refresh token is invalid or not associated with user",
        "AUTH_INVALID_REFRESH_TOKEN"
      );
    }

    user.lastActive = new Date();
    user.isActive = true;

    return user;
  } catch (error) {
    handleServiceError(error, "refreshUserTokens", {
      userId: decoded.userId,
      refreshToken,
    });
  }
};

module.exports = {
  createUser,
  authenticateUser,
  logoutUser,
  refreshUserTokens,
};
