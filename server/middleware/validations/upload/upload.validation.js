const { body } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");
const {
  UploadValidator,
  uploadErrorMessages,
} = require("../../../validators/upload/upload.validator");

/**
 * Upload Validation Middleware
 * Following the exact pattern from listing.validation.js
 */

// ================ REUSABLE VALIDATION RULE CHAINS ================

const folderValidation = (fieldName = "folder") => {
  return body(fieldName)
    .optional()
    .trim()
    .custom((folder) => {
      if (folder) {
        return UploadValidator.isValidFolder(folder);
      }
      return true;
    })
    .withMessage(uploadErrorMessages.folder.invalid);
};

const subfolderValidation = (fieldName = "subfolder") => {
  return body(fieldName)
    .optional()
    .trim()
    .custom((subfolder) => {
      if (subfolder) {
        return UploadValidator.isValidSubfolder(subfolder);
      }
      return true;
    })
    .withMessage(uploadErrorMessages.subfolder.invalid);
};

const s3KeyValidation = (fieldName = "key") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(uploadErrorMessages.key.required)
    .bail()
    .trim()
    .custom((key) => {
      return UploadValidator.isValidS3Key(key);
    })
    .withMessage(uploadErrorMessages.key.invalid);
};

const s3KeysArrayValidation = (fieldName = "keys") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(uploadErrorMessages.keys.required)
    .bail()
    .isArray({ min: 1 })
    .withMessage(uploadErrorMessages.keys.empty)
    .bail()
    .custom((keys) => {
      return keys.every((key) => UploadValidator.isValidS3Key(key));
    })
    .withMessage(uploadErrorMessages.keys.invalid);
};

// ================ COMPLETE VALIDATION MIDDLEWARES ================

/**
 * Validate upload parameters (folder, subfolder)
 */
const validateUploadParams = [
  folderValidation("folder"),
  subfolderValidation("subfolder"),
  handleValidationErrors,
];

/**
 * Validate single file delete
 */
const validateDeleteImage = [s3KeyValidation("key"), handleValidationErrors];

/**
 * Validate multiple files delete
 */
const validateDeleteMultipleImages = [
  s3KeysArrayValidation("keys"),
  handleValidationErrors,
];

module.exports = {
  validateUploadParams,
  validateDeleteImage,
  validateDeleteMultipleImages,
};
