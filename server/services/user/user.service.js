const { User } = require("../../models/user");
const logger = require("../../utils/logger");
const { AppError } = require("../../utils/errors");
const { CampusEnum, FacultyEnum } = require("../../utils/enums/user.enum");
const {
  handleServiceError,
  handleNotFoundError,
  sanitizeUserData,
  getEnumValueByKey,
} = require("../base.service");
const { sanitizeInput, sanitizeObject } = require("../../utils/sanitizer");
const { syncMerchantDataToListings } = require("./merchant.service");

const findUserById = async (userId, options = {}) => {
  try {
    const selectedOptions = options.includePassword
      ? "+email +password"
      : "+email -password -refreshTokens -__v";
    const user = await User.findById(userId).select(selectedOptions);
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "find_user_by_id", {
        userId,
      });
    }

    const profile = {
      ...user.profile,
      campus: getEnumValueByKey(CampusEnum, user.profile.campus),
      faculty: getEnumValueByKey(FacultyEnum, user.profile.faculty),
    };
    const userData = {
      _id: user._id,
      email: user.email,
      profile,
      roles: user.roles,
    };
    return options.includeSensitiveData ? userData : sanitizeUserData(userData);
  } catch (error) {
    handleServiceError(error, "findUserById", { userId: userId.toString() });
  }
};

/**
 * Find a user by their email address.
 * @param {String} email - The email address of the user.
 * @param {Object} options - Options for the query.
 * @param {Boolean} options.includePassword - Whether to include the password field.
 * @param {Boolean} options.includeSensitiveData - Whether to include sensitive fields in the returned user object.
 * @returns {Promise<User>|AppError} - The user object if found or throws an error.
 */
const findUserByEmail = async (email, options = {}) => {
  try {
    const selectedOptions = options.includePassword
      ? "+email +password"
      : "+email -password -refreshTokens -__v";
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      selectedOptions
    );

    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "find_user_by_email", {
        email,
      });
    }
    const profile = {
      ...user.profile,
      campus: getEnumValueByKey(CampusEnum, user.profile.campus),
      faculty: getEnumValueByKey(FacultyEnum, user.profile.faculty),
    };
    const userData = {
      _id: user._id,
      email: user.email,
      profile,
      roles: user.roles,
    };
    return options.includeSensitiveData ? userData : sanitizeUserData(userData);
  } catch (error) {
    handleServiceError(error, "findUserByEmail", { email });
  }
};

// TODO: try to understand all of this
const updateUserProfile = async (userId, { sanitizedData }) => {
  try {
    const allowedFields = ["avatar", "bio", "phoneNumber", "username"];
    const updates = {};
    const changedProfileFields = {};

    // Handle nested profile object (preferred format)
    if (sanitizedData.profile && typeof sanitizedData.profile === "object") {
      for (const [key, value] of Object.entries(sanitizedData.profile)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates[`profile.${key}`] = value;
          changedProfileFields[key] = value;
        }
      }
    }

    // Handle direct field formats (for backward compatibility)
    for (const [key, value] of Object.entries(sanitizedData)) {
      if (
        key !== "profile" &&
        allowedFields.includes(key) &&
        value !== undefined
      ) {
        updates[`profile.${key}`] = value;
        changedProfileFields[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      // Still return current user data if no updates
      const currentUser = await User.findById(userId).select(
        "+email -password -refreshTokens -__v"
      );

      const profile = {
        ...currentUser.profile,
        campus: getEnumValueByKey(CampusEnum, currentUser.profile.campus),
        faculty: getEnumValueByKey(FacultyEnum, currentUser.profile.faculty),
      };

      const formattedUser = {
        _id: currentUser._id,
        email: currentUser.email,
        profile,
        roles: currentUser.roles,
      };

      return {
        updatedUser: sanitizeUserData(formattedUser),
        changedProfileFields,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("+email -password -refreshTokens -__v");

    if (!updatedUser) {
      handleNotFoundError("User", "USER_NOT_FOUND", "update_user_profile", {
        userId: userId.toString(),
      });
    }

    // If username changed and user is a merchant, sync to listings
    if (
      changedProfileFields.username &&
      updatedUser.roles.includes("merchant") &&
      updatedUser.merchantDetails?.shopName
    ) {
      logger.info(
        `Username changed for merchant ${userId}, syncing to listings...`
      );
      try {
        await syncMerchantDataToListings(userId, {
          username: updatedUser.profile.username,
          shopName: updatedUser.merchantDetails.shopName,
          shopSlug: updatedUser.merchantDetails.shopSlug,
          isVerified: updatedUser.merchantDetails.isVerified || false,
        });
        logger.info(`Listings synced successfully for merchant ${userId}`);
      } catch (syncError) {
        // Log error but don't fail the profile update
        logger.error(
          `Failed to sync listings for merchant ${userId}:`,
          syncError
        );
      }
    }

    // Format the response to match expected structure
    const profile = {
      ...updatedUser.profile,
      campus: getEnumValueByKey(CampusEnum, updatedUser.profile.campus),
      faculty: getEnumValueByKey(FacultyEnum, updatedUser.profile.faculty),
    };

    const formattedUser = {
      _id: updatedUser._id,
      email: updatedUser.email,
      profile,
      roles: updatedUser.roles,
    };

    return {
      updatedUser: sanitizeUserData(formattedUser),
      changedProfileFields,
    };
  } catch (error) {
    handleServiceError(error, "updateUserProfile", {
      userId: userId.toString(),
      sanitizedData,
    });
  }
};

// TODO: delete user, validate user exists, get user statistics, etc.

module.exports = {
  findUserById,
  findUserByEmail,
  updateUserProfile,
};
