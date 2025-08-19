const User = require("../../models/user");
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

const findUserById = async (userId, options = {}) => {
  try {
    const selectedOptions = options.includePassword
      ? "+password"
      : "-password -refreshTokens -__v";
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
      role: user.role,
    };
    return options.includeSensitiveData
      ? userData.toObject()
      : sanitizeUserData(userData);
  } catch (error) {
    handleServiceError(error, "findUserById", { userId });
  }
};

const findUserByEmail = async (email, options = {}) => {
  try {
    const selectedOptions = options.includePassword
      ? "+password"
      : "-password -refreshTokens -__v";
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
      role: user.role,
    };
    return options.includeSensitiveData ? userData : sanitizeUserData(userData);
  } catch (error) {
    handleServiceError(error, "findUserByEmail", { email });
  }
};

const updateUserProfile = async (userId, updateData) => {
  // Prevent password updates here (use separate endpoint for password changes)
  if (updateData.password || updateData.passwordConfirm) {
    logger.warn("Password update attempted in profile update", {
      action: "update_me",
      userId,
    });
    throw new AppError(
      "Password updates are not allowed here. Use the change password endpoint.",
      400,
      { action: "update_me", userId }
    );
  }

  try {
    // Sanitize input data
    const sanitizedData = sanitizeObject(updateData);
    const allowedProfileFields = ["avatar", "bio", "phoneNumber"];
    const allowedDirectFields = ["username"];
    const updates = {};

    // Handle direct fields
    allowedDirectFields.forEach((field) => {
      if (sanitizedData[field] !== undefined) {
        updates[field] = sanitizedData[field];
      }
    });

    // Handle profile fields
    if (sanitizedData.profile) {
      const profileUpdates = {};
      allowedProfileFields.forEach((field) => {
        if (sanitizedData.profile[field] !== undefined) {
          profileUpdates[field] = sanitizedData.profile[field];
        }
      });
      if (Object.keys(profileUpdates).length > 0) {
        updates.profile = profileUpdates;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -refreshTokens -__v");

    if (!updatedUser) {
      handleNotFoundError("User", "USER_NOT_FOUND", "update_user_profile", {
        userId,
      });
    }

    return updatedUser.toObject();
  } catch (error) {
    handleServiceError(error, "updateUserProfile", {
      userId,
      updateData,
    });
  }
};

// TODO: delete user, validate user exists, get user statistics, etc.

module.exports = {
  findUserById,
  findUserByEmail,
  updateUserProfile,
};
