const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");

const {
  addressErrorMessages,
  AddressValidator,
  UserValidator,
} = require("../../../validators/user");

const {
  isValidLabel,
  isValidRecipientName,
  isValidAddressType,
  isValidCampusDetails,
  isValidPersonalDetails,
  isValidAddress,
} = AddressValidator;
const { isValidPhoneNumber } = UserValidator;

// ================ REUSABLE VALIDATION RULE CHAINS ================

const addressLabelValidation = (fieldName = "label") => {
  return body(fieldName)
    .optional()
    .isString()
    .withMessage(addressErrorMessages.label.invalid)
    .bail()
    .custom((label) => {
      return isValidLabel(label);
    })
    .withMessage(addressErrorMessages.label.invalid);
};

const addressTypeValidation = (fieldName = "type") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(addressErrorMessages.type.required)
    .bail()
    .custom((type) => {
      return isValidAddressType(type);
    })
    .withMessage(addressErrorMessages.type.invalid);
};

const recipientNameValidation = (fieldName = "recipientName") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(addressErrorMessages.recipientName.required)
    .bail()
    .isString()
    .withMessage(addressErrorMessages.recipientName.invalid)
    .bail()
    .custom((name) => {
      return isValidRecipientName(name);
    })
    .withMessage(addressErrorMessages.recipientName.invalid);
};

const recipientPhoneValidation = (fieldName = "recipientPhone") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(addressErrorMessages.recipientPhone.required)
    .bail()
    .trim()
    .custom((recipientPhone) => {
      return isValidPhoneNumber(recipientPhone);
    })
    .withMessage(addressErrorMessages.recipientPhone.invalid);
};

const campusAddressValidation = (fieldName = "campusAddress") => {
  return body(fieldName)
    .if(body("type").equals("campus"))
    .custom((address) => {
      return isValidCampusDetails(address);
    })
    .withMessage(addressErrorMessages.campusAddress.invalid);
};

const personalAddressValidation = (fieldName = "personalAddress") => {
  return body(fieldName)
    .if(body("type").equals("personal"))
    .custom((address) => {
      return isValidPersonalDetails(address);
    })
    .withMessage(addressErrorMessages.personalAddress.invalid);
};

// !! might delete later if not used
const addressValidationByType = (address = "address") => {
  return body(address)
    .notEmpty()
    .withMessage(addressErrorMessages.address.required)
    .bail()
    .custom((address) => {
      return isValidAddress(address);
    })
    .withMessage(addressErrorMessages.address.invalid);
};

const paramIdValidation = (fieldName = "addressId") => {
  return param(fieldName)
    .notEmpty()
    .withMessage(addressErrorMessages.addressId.required)
    .bail()
    .isMongoId()
    .withMessage(addressErrorMessages.addressId.invalid);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================
const validateCreateAddress = [
  addressLabelValidation("label"),
  addressTypeValidation("type"),
  recipientNameValidation("recipientName"),
  recipientPhoneValidation("recipientPhone"),
  campusAddressValidation("campusAddress"),
  personalAddressValidation("personalAddress"),
  handleValidationErrors,
];

const validateUpdateAddress = [
  addressLabelValidation("label"),
  addressTypeValidation("type"),
  paramIdValidation("addressId"),
  recipientNameValidation("recipientName"),
  recipientPhoneValidation("recipientPhone"),
  campusAddressValidation("campusAddress"),
  personalAddressValidation("personalAddress"),
  handleValidationErrors,
];

const validateDeleteAddress = [
  paramIdValidation("addressId"),
  handleValidationErrors,
];

module.exports = {
  validateCreateAddress,
  validateUpdateAddress,
  validateDeleteAddress,

  addressValidationByType,
};
