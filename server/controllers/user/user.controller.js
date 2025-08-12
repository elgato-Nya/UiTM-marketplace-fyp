const User = require("../../models/user");
const logger = require("../../utils/logger");
const asyncHandler = require("../../utils/asyncHandler");
const {
  createNotFoundError,
  createServerError,
} = require("../../utils/errors");
const sanitize = require("sanitize-html");

// ! NOT COMPLETED YET

/**
 * Get Current User Profile
 *
 * PURPOSE: Retrieve authenticated user's profile information
 * WRAPPED: With asyncHandler for automatic error handling
 * SECURITY: Only returns non-sensitive user data
 */
const getMe = asyncHandler(async (req, res) => {
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

  return res.status(200).json({
    success: true,
    message: "User information retrieved successfully",
    code: "USER_RETRIEVED",
    data: {
      user: {
        _id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
      },
    },
  });
}, "get_user_profile");

/**
 * Update Current User Profile
 *
 * PURPOSE: Allow users to update their profile information
 * WRAPPED: With asyncHandler for clean error handling
 * SECURITY: Sanitizes input and prevents password updates
 * VALIDATION: Should be validated by middleware before reaching here
 */
const updateMe = asyncHandler(async (req, res) => {
  // Prevent password updates here (use separate endpoint for password changes)
  if (req.body.password || req.body.passwordConfirm) {
    return res.status(400).json({
      success: false,
      message: "Password updates not allowed here",
      code: "PASSWORD_UPDATE_NOT_ALLOWED",
    });
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

  return res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    code: "USER_UPDATED",
    data: {
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
  });
}, "update_user_profile");

// TODO: add change password, and other user-related functionality.

module.exports = {
  getMe,
  updateMe,
};
