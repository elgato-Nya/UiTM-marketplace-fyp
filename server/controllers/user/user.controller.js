const BaseController = require("../base.controller");
const { user: userService } = require("../../services/user");
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
  // Build userDTO from req.body, falling back to req.user for unchanged fields
  const userDTO = {
    _id: req.user._id,
    email: req.user.email,
    profile: {
      avatar: req.body.profile?.avatar,
      username: req.body.profile?.username,
      bio: req.body.profile?.bio,
      phoneNumber: req.body.profile?.phoneNumber,
    },
    role: req.user.role,
  };

  const updatedUser = await userService.updateUserProfile(userDTO._id, userDTO);

  // Only include defined profile fields in updatedFields
  const changedProfileFields = Object.fromEntries(
    Object.entries(userDTO.profile).filter(([_, v]) => v !== undefined)
  );

  baseController.logAction("update_user_profile", req, {
    updatedFields: {
      ...userDTO,
      profile: changedProfileFields,
    },
  });

  // Use BaseController's sendSuccess method for consistent response
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
