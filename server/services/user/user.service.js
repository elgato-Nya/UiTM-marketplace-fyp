const User = require("../../models/user");
const { handleServiceError, sanitizeUserData } = require("../base.service");
const logger = require("../../utils/logger");
const {
  createNotFoundError,
  createConflictError,
  AppError,
} = require("../../utils/errors");

const findUserById = async (userId, fields = {}) => {
  try {
    const selectedFields = fields.includePassword
      ? "+password"
      : "-password -refreshTokens -__v";
    const user = await User.findById(userId).select(selectedFields);

    if (!user) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }

    return fields.includeSensitiveData ? user : sanitizeUserData(user);
  } catch (error) {
    handleServiceError(error, "findUserById", { userId });
  }
};

const findUserByEmail = async (email, fields = {}) => {
  try {
    const selectedFields = fields.includePassword
      ? "+password"
      : "-password -refreshTokens -__v";
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      selectedFields
    );

    if (!user) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }
    return fields.includeSensitiveData ? user : sanitizeUserData(user);
  } catch (error) {
    handleServiceError(error, "findUserByEmail", { email });
  }
};

const updateUserProfile = async (userId, updateData) => {
  try {
    const allowedUpdates = ["username", "bio", "avatar"];
    const sanitizedData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        sanitizedData[key] = updateData[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(userId, sanitizedData, {
      new: true,
      runValidators: true,
    }).select("-password -refreshTokens -__v");

    if (!updatedUser) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }
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
