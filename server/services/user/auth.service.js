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
      throw createConflictError(
        "Cannot create user who already exists",
        "USER_ALREADY_EXISTS"
      );
    }

    const user = new User(sanitizedData);
    user.lastActive = new Date();
    user.isActive = true;
    await user.save();

    logger.auth("creating_user", user._id, {
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role,
    });
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
  } catch (error) {
    handleServiceError(error, "authenticateUser", { email });
  }
};

const refreshUserTokens = async (refreshToken) => {
  try {
    const decoded = await verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw createAuthError(
        "Invalid or expired refresh token",
        "AUTH_INVALID_REFRESH_TOKEN"
      );
    }

    user.lastActive = new Date();
    user.isActive = true;

    const tokens = await getTokenPair(user); // user saved in getTokenPair
    return tokens;
  } catch (error) {
    handleServiceError(error, "refreshUserTokens", { refreshToken });
  }
};

const logoutUser = async (userId, refreshToken = null) => {
  try {
    const user = await User.findById(userId).select("+refreshTokens");
    if (!user) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }

    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
    } else {
      user.refreshTokens = [];
      user.isActive = false; // If no token provided, assume user is logging out completely
    }

    await user.save({ validateBeforeSave: false });
  } catch (error) {
    handleServiceError(error, "logoutUser", {
      userId,
      refreshToken,
    });
  }
};

module.exports = {
  createUser,
  authenticateUser,
  refreshUserTokens,
  logoutUser,
};
