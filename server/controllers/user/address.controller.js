const BaseController = require("../base.controller");
const { address: addressService } = require("../../services/user");
const asyncHandler = require("../../utils/asyncHandler");
const { sanitizeObject } = require("../../utils/sanitizer");

const baseController = new BaseController();

const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addresses = await addressService.getUserAddresses(userId);

  return baseController.sendSuccess(
    res,
    addresses,
    "Addresses retrieved successfully"
  );
}, "get_addresses");

const addAddress = asyncHandler(async (req, res) => {
  const addressDTO = {
    userId: req.user._id,
    addressData: req.body,
  };

  const sanitizedAddress = sanitizeObject(addressDTO.addressData);

  const newAddress = await addressService.addUserAddress(
    addressDTO.userId,
    sanitizedAddress
  );

  return baseController.sendSuccess(
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

  return baseController.sendSuccess(
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

  return baseController.sendSuccess(res, data, "Address deleted successfully");
}, "delete_address");

const getDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const type = req.query?.type;
  const address = await addressService.getDefaultAddress(userId, type);

  return baseController.sendSuccess(
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
  getDefaultAddress,
};
