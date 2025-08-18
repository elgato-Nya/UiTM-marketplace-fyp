const User = require("../../models/user");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const logger = require("../../utils/logger");
const { createNotFoundError, AppError } = require("../../utils/errors");
const { sanitizeObject } = require("../../utils/sanitizer");

const getUserAddresses = async (userId) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "get_user_addresses", {
        userId,
      });
    }

    await user.updateLastActive();

    return user.addresses || [];
  } catch (error) {
    handleServiceError(error, "getUserAddresses", { userId });
  }
};

const addUserAddress = async (userId, addressData) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "add_user_address", {
        userId,
      });
    }

    const type = addressData.type;
    const maxPerType = 5; // Set your desired limit
    const countOfType = user.addresses.filter(
      (addr) => addr.type === type
    ).length;
    if (countOfType >= maxPerType) {
      throw new AppError(
        `Maximum ${maxPerType} addresses allowed for type '${type}'`,
        400,
        "ADDRESS_TYPE_LIMIT_EXCEEDED"
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
    user.lastActive = new Date();
    user.isActive = true;
    await user.save();

    const newAddress = user.addresses[user.addresses.length - 1];
    logger.info(`New address added for username: ${user.username}`, {
      userId,
      addressId: newAddress._id,
      addressType: newAddress.type,
    });
    return newAddress;
  } catch (error) {
    handleServiceError(error, "addUserAddress", { userId, addressData });
  }
};

const updateUserAddress = async (userId, addressId, updateData) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      throw createNotFoundError("User", "USER_NOT_FOUND");
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw createNotFoundError("Address", "ADDRESS_NOT_FOUND");
    }

    if (updateData.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr.type === address.type && addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    // the updateData will overwrite the existing address fields
    Object.assign(address, updateData);
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
    await user.save({ validateBeforeSave: false });

    logger.info("Address deleted", { userId, addressId });
    return { userId, addressId };
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
