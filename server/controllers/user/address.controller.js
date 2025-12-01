const BaseController = require("../base.controller");
const { addressService } = require("../../services/user");
const asyncHandler = require("../../utils/asyncHandler");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");
const { createForbiddenError } = require("../../utils/errors");

const baseController = new BaseController();

const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type: addressType } = sanitizeQuery(req.query);
  const addresses = await addressService.getUserAddresses(userId, addressType);

  return baseController.sendStructuredSuccess(
    res,
    addresses,
    "Addresses retrieved successfully"
  );
}, "get_addresses");

const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressData = req.body;

  const sanitizedAddress = sanitizeObject(addressData);

  const newAddress = await addressService.addUserAddress(
    userId,
    sanitizedAddress
  );

  return baseController.sendStructuredSuccess(
    res,
    newAddress,
    "Address added successfully"
  );
}, "add_address");

const updateAddress = asyncHandler(async (req, res) => {
  const addressDTO = {
    userId: req.user._id,
    addressId: req.params?.addressId,
    addressData: req.body,
  };

  const sanitizedAddress = sanitizeObject(addressDTO.addressData);

  const updatedAddress = await addressService.updateUserAddress(
    addressDTO.userId,
    addressDTO.addressId,
    sanitizedAddress
  );

  return baseController.sendStructuredSuccess(
    res,
    updatedAddress,
    "Address updated successfully"
  );
}, "update_address");

const deleteAddress = asyncHandler(async (req, res) => {
  const addressDTO = {
    userId: req.user._id,
    addressId: req.params?.addressId,
  };

  const data = await addressService.deleteUserAddress(
    addressDTO.userId,
    addressDTO.addressId
  );

  return baseController.sendStructuredSuccess(
    res,
    data,
    "Address deleted successfully"
  );
}, "delete_address");

const setDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params?.addressId;
  const { type: bodyType } = sanitizeObject(req.body);
  const { type: queryType } = sanitizeQuery(req.query);
  const type = bodyType || queryType;

  // Validate address belongs to user and is of the correct type
  const address = await addressService.getAddressById(userId, addressId);
  if (!address || address.type !== type) {
    throw createForbiddenError(
      "You do not have permission to set this address as default",
      "FORBIDDEN_ADDRESS_MODIFICATION"
    );
  }

  // Set as default for this type
  const updatedDefault = await addressService.setDefaultAddress(
    userId,
    addressId,
    type
  );

  return baseController.sendStructuredSuccess(
    res,
    updatedDefault,
    `Default ${type} address set successfully`
  );
}, "set_default_address");

/**
 * @route   GET /api/addresses/default
 * @desc    Get default address for current user, optionally filtered by type
 * @access  Private
 * @query   type - Optional address type filter (campus or personal)
 * @returns Default address object or null if none set
 */
const getDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type } = sanitizeQuery(req.query);
  const address = await addressService.getDefaultAddress(userId, type);

  if (!address) {
    return baseController.sendStructuredSuccess(
      res,
      null,
      `No default address set for ${type || "any type"} address`
    );
  }
  return baseController.sendStructuredSuccess(
    res,
    address,
    "Default address retrieved successfully"
  );
}, "get_default_address");

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
};
