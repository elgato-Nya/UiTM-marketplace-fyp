const User = require("../../models/user");
const { handleServiceError } = require("../base.service");
const logger = require("../../utils/logger");
const { createNotFoundError, AppError } = require("../../utils/errors");
const { sanitizeObject } = require("../../utils/sanitizer");

const getUserAddresses = async (userId) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }
    return user.addresses || [];
  } catch (error) {
    handleServiceError(error, "getUserAddresses", { userId });
  }
};

const addUserAddress = async (userId, addressData) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }

    if (user.addresses?.length >= 5) {
      throw new AppError(
        "Maximum 5 addresses allowed per user",
        400,
        "ADDRESS_LIMIT_EXCEEDED"
      );
    }

    if (addressData.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr.type === addressData.type) {
          addr.isDefault = false;
        }
      });
    }

    user.addresses.push(addressData);
    await user.save();

    const newAddress = user.addresses[user.addresses.length - 1];
    logger.info(`New address added for username: ${user.username}`, {
      userId,
      addressId: newAddress._id,
      addressType: addressData.type,
    });
  } catch (error) {
    handleServiceError(error, "addUserAddress", { userId, addressData });
  }
};

const updateUserAddress = async (userId, addressId, updateData) => {
  try {
    const sanitizedAddressData = sanitizeObject(updateData);
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw createNotFoundError("Address", "ADDRESS_NOT_FOUND");
    }

    if (sanitizedAddressData.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr.type === address.type && addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    // the updateData will overwrite the existing address fields
    Object.assign(address, sanitizedAddressData);
    await user.save();

    logger.info("Address updated", { userId, addressId });
    return address;
  } catch (error) {
    handleServiceError(error, "updateUserAddress", {
      userId,
      addressId,
      updateData,
    });
  }
};

const deleteUserAddress = async (userId, addressId) => {
  try {
    const user = User.findById(userId).select("addresses");
    if (!user) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw createNotFoundError("Address", "ADDRESS_NOT_FOUND");
    }

    // TODO: Business rule: Don't allow deletion of the last address if there are active orders

    user.addresses.pull(addressId);
    await user.save();

    logger.info("Address deleted", { userId, addressId });
    return 0;
  } catch (error) {
    handleServiceError(error, "deleteUserAddress", { userId, addressId });
  }
};

const getDefaultAddress = async (userId, type = null) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }

    const defaultAddress = user.addresses.find(
      (address) => address.isDefault && (type ? address.type === type : true)
    );

    return defaultAddress || null;
  } catch (error) {
    handleServiceError(error, "getDefaultAddress", { userId, type });
  }
};

module.exports = {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getDefaultAddress,
};
