const BaseController = require("../base.controller");
const { userService } = require("../../services/user");
const { sanitizeObject } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");
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
  const userId = req.user._id;

  const user = await userService.findUserById(userId);
  return baseController.sendSuccess(
    res,
    user,
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
  // Prevent password updates
  if ("password" in req.body) {
    delete req.body.password;
    logger.warn("Password update attempted in profile update", {
      action: "update_me",
      userId,
    });
  }
  const sanitizedData = sanitizeObject(req.body);

  const { updatedUser, changedProfileFields } =
    await userService.updateUserProfile(req.user._id, {
      sanitizedData,
    });

  baseController.logAction("update_user_profile", req, {
    updatedFields: {
      userId: req.user._id.toString(),
      profile: changedProfileFields,
    },
  });

  return baseController.sendSuccess(
    res,
    updatedUser,
    "User profile updated successfully"
  );
}, "update_user_profile");

// TODO: add change password, and other user-related functionality.

module.exports = {
  getMe,
  updateMe,
};
