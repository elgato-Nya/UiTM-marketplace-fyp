const { body, param, validationResult } = require("express-validator");
const logger = require("../../../utils/logger");

const {
  addressErrorMessages,
  AddressValidator,
  UserValidator,
} = require("../../../validators/user");

const errorMessages = addressErrorMessages();
const {
  isValidName,
  isValidAddressType,
  isValidCampusAddress,
  isValidPersonalAddress,
  isValidAddress,
} = AddressValidator;
const { isValidPhoneNumber } = UserValidator;

// ================ VALIDATION ERROR MIDDLEWARE ================
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    logger.error("Validation errors:", {
      formattedErrors,
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
      },
      user: req.user ? { id: req.user._id, email: req.user.email } : null,
      timestamp: new Date().toISOString(),
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
      code: "VALIDATION_ERROR",
    });
  }

  next();
};

// ================ REUSABLE VALIDATION RULE CHAINS ================
const nameValidation = (fieldName = "name") => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Recipient name is required")
    .bail()
    .isString()
    .withMessage("Recipient name must be a string")
    .bail()
    .custom((name) => {
      if (!isValidName(name)) {
        throw new Error(errorMessages.recipientName.invalid);
      }
      return true;
    });
};

const phoneNumberValidation = (fieldName = "phoneNumber") => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Phone number is required")
    .bail()
    .trim()
    .custom((phoneNumber) => {
      if (!isValidPhoneNumber(phoneNumber)) {
        throw new Error(errorMessages.phoneNumber.invalid);
      }
      return true;
    });
};

const addressTypeValidation = (fieldName = "type") => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Address type is required")
    .bail()
    .custom((type) => {
      if (!isValidAddressType(type)) {
        throw new Error(errorMessages.type.invalid);
      }
      return true;
    });
};

const campusAddressValidation = (fieldName = "campusAddress") => {
  return body(fieldName)
    .if(body("type").equals("campus"))
    .notEmpty()
    .withMessage("Campus address is required")
    .custom((campusAddress, { req }) => {
      if (!isValidCampusAddress({ type: "campus", campusAddress })) {
        throw new Error(errorMessages.campusAddress.required);
      }
      return true;
    });
};

const personalAddressValidation = (fieldName = "personalAddress") => {
  return body(fieldName)
    .if(body("type").equals("personal"))
    .notEmpty()
    .withMessage("Personal address is required")
    .custom((personalAddress, { req }) => {
      if (!isValidPersonalAddress({ type: "personal", personalAddress })) {
        throw new Error(errorMessages.personalAddress.required);
      }
      return true;
    });
};

const addressValidationByType = (address = "address") => {
  return body(address)
    .notEmpty()
    .withMessage("Address is required")
    .bail()
    .custom((addr) => {
      if (!isValidAddress(addr)) {
        throw new Error(addressErrorMessages().address.invalid);
      }
    });
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================
const validateCreateAddress = [
  nameValidation(),
  phoneNumberValidation(),
  addressTypeValidation(),
  campusAddressValidation(),
  personalAddressValidation(),
  handleValidationErrors,
];

const validateUpdateAddress = [
  param("addressId")
    .notEmpty()
    .withMessage("Address ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid address ID format"),
  nameValidation(),
  phoneNumberValidation(),
  addressTypeValidation(),
  campusAddressValidation(),
  personalAddressValidation(),
  handleValidationErrors,
];

const validateDeleteAddress = [
  param("addressId")
    .notEmpty()
    .withMessage("Address ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid address ID format"),
  handleValidationErrors,
];

module.exports = {
  validateCreateAddress,
  validateUpdateAddress,
  validateDeleteAddress,
  handleValidationErrors,
};
