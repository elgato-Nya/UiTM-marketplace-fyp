const { User } = require("../../models/user");
const { handleServiceError, handleNotFoundError } = require("../base.service");
const logger = require("../../utils/logger");
const { createNotFoundError, AppError } = require("../../utils/errors");

const getUserAddresses = async (userId, addressType) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "get_user_addresses", {
        userId,
      });
    }

    // Update last active in background without blocking the response
    setImmediate(() => {
      User.findByIdAndUpdate(userId, {
        lastActive: new Date(),
        isActive: true,
      }).catch((error) => {
        logger.error("Failed to update last active in address service", {
          userId: userId.toString(),
          error: error.message,
        });
      });
    });

    let addresses = user.addresses || [];
    if (addressType) {
      addresses = addresses.filter((addr) => addr.type === addressType);
    }

    // Return addresses with enum keys - client handles display conversion
    return addresses;
  } catch (error) {
    handleServiceError(error, "getUserAddresses", {
      userId: userId.toString(),
    });
  }
};

const getAddressById = async (userId, addressId) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "get_address_by_id", {
        userId: userId.toString(),
      });
    }

    const address = user.addresses.id(addressId);

    // Return address with enum keys - client handles display conversion
    return address;
  } catch (error) {
    handleServiceError(error, "getAddressById", {
      userId: userId.toString(),
      addressId: addressId.toString(),
    });
  }
};

const addUserAddress = async (userId, addressData) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      handleNotFoundError("User", "USER_NOT_FOUND", "add_user_address", {
        userId: userId.toString(),
      });
    }

    const type = addressData.type;
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

    const newAddress = user.addAddress(addressData);
    user.lastActive = new Date();
    user.isActive = true;
    await user.save();

    // Return address with enum keys - client handles display conversion
    return newAddress;
  } catch (error) {
    handleServiceError(error, "addUserAddress", {
      userId: userId.toString(),
      addressData,
    });
  }
};

const updateUserAddress = async (userId, addressId, updateData) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      throw handleNotFoundError(
        "User",
        "USER_NOT_FOUND",
        "update_user_address",
        {
          userId: userId.toString(),
        }
      );
    }

    // Use the new updateAddress method from User model
    const updatedAddress = user.updateAddress(addressId, updateData);

    if (!updatedAddress) {
      throw createNotFoundError("Address", "ADDRESS_NOT_FOUND");
    }

    await user.save();
    // Return address with enum keys - client handles display conversion
    return updatedAddress;
  } catch (error) {
    handleServiceError(error, "updateUserAddress", {
      userId: userId.toString(),
      addressId: addressId.toString(),
      updateData,
    });
  }
};

const deleteUserAddress = async (userId, addressId) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      throw handleNotFoundError(
        "User",
        "USER_NOT_FOUND",
        "delete_user_address",
        {
          userId: userId.toString(),
        }
      );
    }

    // Find the address being deleted to check if it's default
    const addressToDelete = user.addresses.id(addressId);
    if (!addressToDelete) {
      throw handleNotFoundError(
        "Address",
        "ADDRESS_NOT_FOUND",
        "delete_user_address",
        {
          userId: userId.toString(),
          addressId: addressId.toString(),
        }
      );
    }

    const wasDefault = addressToDelete.isDefault;
    const addressType = addressToDelete.type;

    const wasRemoved = user.removeAddress(addressId);

    if (!wasRemoved) {
      throw handleNotFoundError(
        "Address",
        "ADDRESS_NOT_FOUND",
        "delete_user_address",
        {
          userId: userId.toString(),
          addressId: addressId.toString(),
        }
      );
    }

    // If the deleted address was default, set the first remaining address of the same type as default
    if (wasDefault) {
      const remainingAddressesOfType = user.addresses.filter(
        (addr) => addr.type === addressType
      );

      if (remainingAddressesOfType.length > 0) {
        // Set the first remaining address as default
        remainingAddressesOfType[0].isDefault = true;
        logger.info(
          `Auto-set first remaining ${addressType} address as default`,
          {
            userId: userId.toString(),
            newDefaultAddressId: remainingAddressesOfType[0]._id.toString(),
            deletedAddressId: addressId.toString(),
          }
        );
      }
    }

    // TODO: Business rule: Don't allow deletion of the last address if there are active orders

    await user.save({ validateBeforeSave: false });

    // Return success indicator with the deleted address ID
    return { _id: addressId, deleted: true };
  } catch (error) {
    handleServiceError(error, "deleteUserAddress", {
      userId: userId.toString(),
      addressId: addressId.toString(),
    });
  }
};

const setDefaultAddress = async (userId, addressId, type) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      throw handleNotFoundError(
        "User",
        "USER_NOT_FOUND",
        "set_default_address",
        { userId: userId.toString() }
      );
    }

    // set every address with non-matching id isDefault flag to false
    let found = false;
    user.addresses.forEach((address) => {
      if (address.type === type) {
        if (address._id.toString() === addressId.toString()) {
          address.isDefault = true;
          found = true;
        } else {
          address.isDefault = false;
        }
      }
    });

    if (!found) {
      throw createNotFoundError("Address", "ADDRESS_NOT_FOUND");
    }

    await user.save();
    // Return info about what was updated
    return {
      addressId: addressId.toString(),
      type,
      success: true,
    };
  } catch (error) {
    handleServiceError(error, "setDefaultAddress", {
      userId: userId.toString(),
      addressId: addressId.toString(),
      type,
    });
  }
};

const getDefaultAddress = async (userId, type = null) => {
  try {
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      throw handleNotFoundError(
        "User",
        "USER_NOT_FOUND",
        "get_default_address",
        {
          userId: userId.toString(),
        }
      );
    }

    const defaultAddress = user.addresses.find(
      (address) => address.isDefault && (type ? address.type === type : true)
    );

    // Return address with enum keys - client handles display conversion
    return defaultAddress;
  } catch (error) {
    handleServiceError(error, "getDefaultAddress", {
      userId: userId.toString(),
      type,
    });
  }
};

module.exports = {
  getUserAddresses,
  getAddressById,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  getDefaultAddress,
};
