const { User } = require("../../models/user");
const logger = require("../../utils/logger");
const { createAuthError, createConflictError } = require("../../utils/errors");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const { verifyRefreshToken } = require("../jwt.service");
const {
  generateRandomToken,
  hashToken,
  compareToken,
  generateTokenWithExpiry,
} = require("../token.service");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  initializeTransporter,
} = require("../email.service");

const createUser = async (userData, password) => {
  try {
    const completedData = { ...userData, password };
    const user = new User(completedData);
    await user.save({ validateBeforeSave: false });

    return user;
  } catch (error) {
    handleServiceError(error, "createUser", { userData });
  }
};

const authenticateUser = async (email, password) => {
  try {
    const user = await User.findByCredentials(email, password);
    if (!user) {
      createAuthError("Invalid email or password", "AUTH_INVALID_CREDENTIALS");
    }

    // Check if email is verified
    if (!user.emailVerification?.isVerified) {
      logger.warn("Login attempt with unverified email", {
        action: "authenticate_user",
        email: user.email,
        userId: user._id,
      });
      throw createAuthError(
        "Please verify your email address before logging in. Check your inbox for the verification link.",
        "EMAIL_NOT_VERIFIED"
      );
    }

    user.lastActive = new Date();
    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    return user;
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
      handleNotFoundError("User", "USER_NOT_FOUND", "logout_user", {
        userId,
        refreshToken,
      });
    }

    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );

    if (user.refreshTokens.length === 0) {
      user.isActive = false;
    }

    await user.save({ validateBeforeSave: false });

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
      createAuthError("No refresh token provided", "AUTH_NO_REFRESH_TOKEN");
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId).select(
      "+refreshTokens -password -__v"
    );
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "refresh_user_tokens", {
        userId: decoded.userId,
        refreshToken,
      });
    }
    if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      logger.error("Refresh token failed: Token not recognized for user", {
        action: "refresh_tokens",
        userId: decoded.userId,
        refreshToken,
      });
      createAuthError(
        "Refresh token is invalid or not associated with user",
        "AUTH_INVALID_REFRESH_TOKEN"
      );
    }

    // Refresh token rotation: Remove old token before generating new one
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );

    user.lastActive = new Date();
    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    logger.auth("Refresh token rotated successfully", user._id, {
      email: user.email,
      oldTokenRemoved: true,
    });

    return user;
  } catch (error) {
    handleServiceError(error, "refreshUserTokens", {
      userId: decoded?.userId.toString(),
      refreshToken,
    });
  }
};

const generateEmailVerificationToken = async (user) => {
  try {
    const { token, expiresAt } = generateTokenWithExpiry(32, 24 * 60); // 24 hour expiry
    const hashedToken = await hashToken(token);

    await User.findByIdAndUpdate(user._id, {
      "emailVerification.token": hashedToken,
      "emailVerification.tokenExpires": expiresAt,
    });

    logger.auth("Email verification token generated", user._id, {
      email: user.email,
      expires: expiresAt,
    });

    return true;
  } catch (error) {
    logger.error("Failed to generate email verification token", {
      action: "generateEmailVerificationToken",
      userId: user._id,
      error: error.message,
    });
    handleServiceError(error, "generateEmailVerificationToken", {
      userId: user._id,
    });
  }
};

const verifyEmail = async (email, token) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+emailVerification.token +emailVerification.tokenExpires"
    );

    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "verifyEmail", { email });
    }
    if (
      !user.emailVerification?.token ||
      !user.emailVerification?.tokenExpires
    ) {
      createAuthError(
        "No verification token found. Please request a new verification email.",
        "VERIFICATION_TOKEN_INVALID"
      );
    }
    if (user.emailVerification.tokenExpires < new Date()) {
      createAuthError(
        "Verification token has expired",
        "VERIFICATION_TOKEN_EXPIRED"
      );
    }

    if (user.emailVerification?.isVerified) {
      logger.info("Email already verified", {
        action: "verifyEmail",
        userId: user._id,
        email,
      });
      return true;
    }

    const isTokenValid = await compareToken(
      token,
      user.emailVerification.token
    );
    if (!isTokenValid) {
      createAuthError(
        "Invalid verification token",
        "VERIFICATION_TOKEN_INVALID"
      );
    }

    await User.findByIdAndUpdate(user._id, {
      "emailVerification.isVerified": true,
      "emailVerification.token": null,
      "emailVerification.tokenExpires": null,
    });

    logger.auth("Email verified successfully", user._id, { email });
    return true;
  } catch (error) {
    handleServiceError(error, "verifyEmail", { email });
  }
};

const generatePasswordResetToken = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordReset.requestedAt +passwordReset.lastResetAt"
    );
    if (!user) {
      logger.security("Password reset requested for non-existent email", {
        action: "generatePasswordResetToken",
        email: email.toLowerCase(),
      });
      return { status: "email sent" };
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    if (
      user.passwordReset?.requestedAt &&
      user.passwordReset.requestedAt > fiveMinutesAgo
    ) {
      logger.info("Password reset requested within the last 5 minutes", {
        action: "generatePasswordResetToken",
        userId: user._id,
        email: user.email,
        lastRequested: user.passwordReset.requestedAt,
      });
      return {
        status: "recently requested",
        message:
          "Email was already sent, please wait for 5 minutes before requesting again",
      };
    }

    const { token, expiresAt } = generateTokenWithExpiry(32, 15); // 15 minute expiry
    const hashedToken = await hashToken(token);

    await User.findByIdAndUpdate(user._id, {
      "passwordReset.token": hashedToken,
      "passwordReset.tokenExpires": expiresAt,
      "passwordReset.requestedAt": now,
    });

    await sendPasswordResetEmail(user, token);

    logger.info("Password reset token generated and email sent", {
      action: "generatePasswordResetToken",
      userId: user._id,
      email: user.email,
      expires: expiresAt,
    });

    return { status: "email sent" };
  } catch (error) {
    logger.error("Failed to generate password reset token", {
      action: "generatePasswordResetToken",
      email,
      error: error.message,
    });
    handleServiceError(error, "generatePasswordResetToken", { email });
  }
};

const validateResetToken = async (email, token) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordReset.token +passwordReset.tokenExpires"
    );
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "validateResetToken", {
        email,
      });
    }

    if (!user.passwordReset?.token || !user.passwordReset?.tokenExpires) {
      createAuthError(
        "No reset token found. Please request a new password reset.",
        "RESET_TOKEN_INVALID"
      );
    }

    if (user.passwordReset.tokenExpires < new Date()) {
      createAuthError("Reset token has expired", "RESET_TOKEN_EXPIRED");
    }

    const isTokenValid = await compareToken(token, user.passwordReset.token);
    if (!isTokenValid) {
      createAuthError("Invalid reset token", "RESET_TOKEN_INVALID");
    }

    return { valid: true, userId: user._id };
  } catch (error) {
    handleServiceError(error, "validateResetToken", { email });
  }
};

const resetPassword = async (email, token, newPassword) => {
  try {
    const validation = await validateResetToken(email, token);
    if (!validation) {
      createAuthError("Reset token validation failed", "RESET_TOKEN_INVALID");
    }

    const user = await User.findById(validation.userId);
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "resetPassword", {
        userId: validation.userId,
        email,
      });
    }

    user.password = newPassword;
    user.passwordReset = {
      token: null,
      tokenExpires: null,
      requestedAt: user.passwordReset?.requestedAt,
      lastResetAt: new Date(),
    };

    await user.save();

    await User.findByIdAndUpdate(user._id, {
      refreshTokens: [],
      isActive: false, // Force re-login
    });

    logger.info("Password reset successfully", {
      action: "resetPassword",
      userId: user._id,
      email: user.email,
    });

    return true;
  } catch (error) {
    logger.error("Failed to reset password", {
      action: "resetPassword",
      email,
      error: error.message,
    });
    handleServiceError(error, "resetPassword", { email });
  }
};

module.exports = {
  createUser,
  authenticateUser,
  logoutUser,
  refreshUserTokens,
  generateEmailVerificationToken,
  verifyEmail,
  generatePasswordResetToken,
  validateResetToken,
  resetPassword,
};
