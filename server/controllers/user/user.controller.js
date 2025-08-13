const User = require("../../models/user");
const BaseController = require("../base.controller");
const logger = require("../../utils/logger");
const asyncHandler = require("../../utils/asyncHandler");
const {
  createNotFoundError,
  createServerError,
} = require("../../utils/errors");
const sanitize = require("sanitize-html");

/**
 * User Controller - Function-based approach with BaseController utilities
 *
 * PURPOSE: Handle user profile operations
 * PATTERN: Functions + BaseController helpers (Industry Standard for Express)
 * BENEFITS: Simple, testable, maintainable, follows Express conventions
 */

// Create BaseController instance for utility methods
const baseController = new BaseController();

/**
 * Get Current User Profile
 *
 * PURPOSE: Retrieve authenticated user's profile information
 * PATTERN: Function with BaseController utilities
 * SECURITY: Only returns non-sensitive user data
 */
const getMe = asyncHandler(async (req, res) => {
  // Log action using BaseController utility
  baseController.logAction("get_user_profile", req);

  const user = await User.findById(req.user._id).select(
    "-password -refreshTokens"
  );

  if (!user) {
    logger.warn("User not found in database", {
      action: "get_me",
      userId: req.user._id,
    });
    throw createNotFoundError("User");
  }

  // Use BaseController's sendSuccess method for consistent response
  return baseController.sendSuccess(
    res,
    {
      user: {
        _id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
      },
    },
    "User information retrieved successfully"
  );
}, "get_user_profile");

/**
 * Update Current User Profile
 *
 * PURPOSE: Allow users to update their profile information
 * PATTERN: Function with BaseController utilities and manual validation
 * SECURITY: Sanitizes input and prevents password updates
 */
const updateMe = asyncHandler(async (req, res) => {
  // Log action using BaseController utility
  baseController.logAction("update_user_profile", req);

  // Prevent password updates here (use separate endpoint for password changes)
  if (req.body.password || req.body.passwordConfirm) {
    return baseController.sendError(
      res,
      new Error("Password updates not allowed here"),
      400,
      { action: "update_user_profile", reason: "password_update_attempted" }
    );
  }

  // Only allow certain fields to be updated
  const allowedProfileFields = [
    "avatar",
    "bio",
    "phoneNumber",
    "campus",
    "faculty",
  ];
  const allowedDirectFields = ["username"];
  const updates = {};

  // Handle direct fields
  allowedDirectFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      // Sanitize direct fields if needed (e.g., username)
      updates[field] = sanitize(req.body[field], {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
  });

  // Handle profile fields
  if (req.body.profile) {
    const profileUpdates = {};
    allowedProfileFields.forEach((field) => {
      if (req.body.profile[field] !== undefined) {
        // Use strict sanitization: remove all HTML tags and attributes
        profileUpdates[field] = sanitize(req.body.profile[field], {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
    });
    if (Object.keys(profileUpdates).length > 0) {
      updates.profile = profileUpdates;
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
    select: "-password -refreshTokens",
  });

  if (!user) {
    logger.warn("User not found for update", {
      action: "update_me",
      userId: req.user._id,
    });
    throw createNotFoundError("User");
  }

  // Use BaseController's sendSuccess method for consistent response
  return baseController.sendSuccess(
    res,
    {
      user: {
        _id: user._id,
        email: user.email,
        profile: {
          avatar: user.profile.avatar,
          username: user.profile.username,
          bio: user.profile.bio,
          phoneNumber: user.profile.phoneNumber,
          campus: user.profile.campus,
          faculty: user.profile.faculty,
        },
        role: user.role,
      },
    },
    "User profile updated successfully"
  );
}, "update_user_profile");

// TODO: add change password, and other user-related functionality.

module.exports = {
  getMe,
  updateMe,
};
