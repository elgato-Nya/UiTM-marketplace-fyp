const { User } = require("../../models/user");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const logger = require("../../utils/logger");
const { createNotFoundError, AppError } = require("../../utils/errors");
const { CampusEnum } = require("../../utils/enums/user.enum");

/**
 * Convert campus display values to enum keys for storage
 * @param {Object} addressData - The address data to transform
 */
const transformCampusForStorage = (addressData) => {
  if (addressData.type === "campus" && addressData.campusAddress?.campus) {
    const campusDisplayValue = addressData.campusAddress.campus;

    // Find matching enum key for the display value
    const campusKey = Object.keys(CampusEnum).find(
      (key) => CampusEnum[key] === campusDisplayValue
    );

    if (campusKey) {
      addressData.campusAddress.campus = campusKey;
    }
    // If no match found, leave as-is for validation to catch
  }
  return addressData;
};

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
    console.log(
      "addUserAddress - Initial addressData:",
      JSON.stringify(addressData, null, 2)
    );

    const user = await User.findById(userId).select("addresses");
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "add_user_address", {
        userId,
      });
    }

    // Transform campus display values to enum keys before validation
    const transformedAddressData = transformCampusForStorage({
      ...addressData,
    });
    console.log(
      "addUserAddress - After transformation:",
      JSON.stringify(transformedAddressData, null, 2)
    );

    const type = transformedAddressData.type;
    const maxPerType = 5;
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

    if (transformedAddressData.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr.type === transformedAddressData.type) {
          addr.isDefault = false;
        }
      });
    }

    user.addresses.push(transformedAddressData);
    user.lastActive = new Date();
    user.isActive = true;
    await user.save();

    const newAddress = user.addresses[user.addresses.length - 1];
    logger.info(`New address added for username: ${user.username}`, {
      userId,
      addressId: newAddress._id,
      addressType: newAddress.type,
    });

    // Return the full user object with addresses for consistency
    return await User.findById(userId).select("addresses");
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

    // Transform campus display values to enum keys before validation
    const transformedUpdateData = transformCampusForStorage({ ...updateData });

    if (transformedUpdateData.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr.type === address.type && addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    // the transformedUpdateData will overwrite the existing address fields
    Object.assign(address, transformedUpdateData);
    await user.save();

    logger.info("Address updated", { userId, addressId });

    // Return the full user object with addresses for consistency
    return await User.findById(userId).select("addresses");
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
    const user = await User.findById(userId).select("addresses");
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

    // Return the full user object with addresses for consistency
    return await User.findById(userId).select("addresses");
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
