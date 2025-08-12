const BaseController = require("../base.controller");
const User = require("../../models/user/user.model");
const { getTokenPair } = require("../../services/jwt.service");
const { validationResult } = require("express-validator");

/**
 * Authentication Controller (Class Pattern)
 * Handles user authentication operations
 * Extends BaseController for common functionality
 */

class AuthController extends BaseController {
  constructor() {
    super();
  }

  // Helper method to send tokens
  async sendTokenResponse(
    user,
    statusCode,
    res,
    message = "Authentication successful"
  ) {
    try {
      const tokenData = await getTokenPair(user);

      const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      // Log token generation
      this.logger.auth("Tokens generated", user._id, {
        email: user.email,
        hasRefreshToken: !!tokenData.refreshToken,
      });

      return res
        .status(statusCode)
        .cookie("refreshToken", tokenData.refreshToken, cookieOptions)
        .json({
          success: true,
          message,
          data: {
            accessToken: tokenData.accessToken,
            user: {
              id: user._id,
              email: user.email,
              role: user.role,
              profile: user.profile,
            },
          },
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      this.logger.errorWithStack(error, {
        action: "token_generation",
        userId: user._id,
        email: user.email,
      });

      return this.sendError(
        res,
        {
          message: "Failed to generate authentication tokens",
          code: "TOKEN_GENERATION_FAILED",
        },
        500
      );
    }
  }

  // User registration
  register = this.asyncHandler(async (req, res) => {
    this.logAction("register_attempt", req, { email: req.body.email });

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return this.sendValidationError(res, errors.array());
    }

    const { email, password, profile, role } = req.body;
    const userInfo = this.getUserInfo(req);

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        this.logger.warn("Registration attempt with existing email", {
          email: email.toLowerCase(),
          ...userInfo,
        });

        return this.sendError(
          res,
          {
            message: "Email already exists",
            code: "USER_EXISTS",
          },
          409
        );
      }

      // Create new user
      const newUser = new User({
        email: email.toLowerCase(),
        password,
        profile: profile || {},
        role: role || "customer",
      });

      const savedUser = await newUser.save();

      // Log successful registration
      this.logger.info("User registered successfully", {
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        ...userInfo,
      });

      // Send token response
      return await this.sendTokenResponse(
        savedUser,
        201,
        res,
        "Registration successful"
      );
    } catch (error) {
      this.logger.errorWithStack(error, {
        action: "user_registration",
        email: email?.toLowerCase(),
        ...userInfo,
      });

      // Handle duplicate key error
      if (error.code === 11000) {
        return this.sendError(
          res,
          {
            message: "Email already exists",
            code: "USER_EXISTS",
          },
          409
        );
      }

      return this.sendError(res, error, 500);
    }
  });

  // User login
  login = this.asyncHandler(async (req, res) => {
    this.logAction("login_attempt", req, { email: req.body.email });

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return this.sendValidationError(res, errors.array());
    }

    const { email, password } = req.body;
    const userInfo = this.getUserInfo(req);

    try {
      // Find user by email (with password field)
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password"
      );

      if (!user) {
        this.logger.logSecurityEvent(
          "Login attempt with non-existent email",
          "medium",
          {
            email: email.toLowerCase(),
            ...userInfo,
          }
        );

        return this.sendError(
          res,
          {
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS",
          },
          401
        );
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        this.logger.logSecurityEvent(
          "Login attempt with wrong password",
          "high",
          {
            userId: user._id,
            email: user.email,
            ...userInfo,
          }
        );

        return this.sendError(
          res,
          {
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS",
          },
          401
        );
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Log successful login
      this.logger.auth("Login successful", user._id, {
        email: user.email,
        lastLogin: user.lastLogin,
        ...userInfo,
      });

      // Send token response
      return await this.sendTokenResponse(user, 200, res, "Login successful");
    } catch (error) {
      this.logger.errorWithStack(error, {
        action: "user_login",
        email: email?.toLowerCase(),
        ...userInfo,
      });

      return this.sendError(res, error, 500);
    }
  });

  // Refresh token
  refreshToken = this.asyncHandler(async (req, res) => {
    this.logAction("refresh_token_attempt", req);

    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return this.sendError(
        res,
        {
          message: "Refresh token is required",
          code: "MISSING_REFRESH_TOKEN",
        },
        400
      );
    }

    try {
      // Verify and generate new tokens
      const tokenData = await getTokenPair(null, refreshToken);

      this.logger.auth("Token refreshed successfully", tokenData.user._id, {
        ...this.getUserInfo(req),
      });

      return this.sendSuccess(
        res,
        {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          user: tokenData.user,
        },
        "Token refreshed successfully"
      );
    } catch (error) {
      this.logger.logSecurityEvent("Invalid refresh token used", "high", {
        ...this.getUserInfo(req),
        error: error.message,
      });

      // Clear the invalid cookie
      res.clearCookie("refreshToken");

      return this.sendError(
        res,
        {
          message: "Invalid or expired refresh token",
          code: "INVALID_REFRESH_TOKEN",
        },
        401
      );
    }
  });

  // Logout
  logout = this.asyncHandler(async (req, res) => {
    this.logAction("logout", req);

    const userInfo = this.getUserInfo(req);

    try {
      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      this.logger.auth(
        "User logged out",
        req.user?.id || "anonymous",
        userInfo
      );

      return this.sendSuccess(res, null, "Logout successful");
    } catch (error) {
      this.logger.warn("Logout error (non-critical)", {
        error: error.message,
        ...userInfo,
      });

      // Always return success for logout for security reasons
      return this.sendSuccess(res, null, "Logout successful");
    }
  });

  // Get current user profile
  getProfile = this.asyncHandler(async (req, res) => {
    this.logAction("get_profile", req);

    try {
      const user = await User.findById(req.user._id).select("-password");

      if (!user) {
        return this.sendError(
          res,
          {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
          404
        );
      }

      this.logger.debug("Profile retrieved", {
        userId: user._id,
        email: user.email,
      });

      return this.sendSuccess(
        res,
        {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        "Profile retrieved successfully"
      );
    } catch (error) {
      return this.sendError(res, error, 500, {
        action: "get_profile",
        userId: req.user?.id,
      });
    }
  });
}

module.exports = new AuthController();
