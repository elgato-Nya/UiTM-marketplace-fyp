const multer = require("multer");
const path = require("path");
const { s3Config } = require("../config/s3.config");
const { createValidationError } = require("../utils/errors");
const logger = require("../utils/logger");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!s3Config.allowedImageTypes.includes(file.mimetype)) {
    logger.security("Invalid file type upload attempt", {
      fileName: file.originalname,
      mimeType: file.mimetype,
      ip: req.ip,
    });

    return cb(
      createValidationError(
        `Invalid file type. Allowed types: ${s3Config.allowedImageTypes.join(
          ", "
        )}`,
        { mimeType: file.mimetype },
        "INVALID_FILE_TYPE"
      ),
      false
    );
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = s3Config.allowedImageTypes.map((type) => {
    return `.${type.split("/")[1]}`;
  });

  if (!allowedExtensions.includes(extension)) {
    logger.security("Invalid file extension upload attempt", {
      fileName: file.originalname,
      extension,
      ip: req.ip,
    });

    return cb(
      createValidationError(
        `Invalid file extension. Allowed extensions: ${allowedExtensions.join(
          ", "
        )}`,
        { extension },
        "INVALID_FILE_EXTENSION"
      ),
      false
    );
  }

  // File is valid
  cb(null, true);
};

// create multer instance for single image
const uploadSingle = multer({
  storage,
  limits: {
    fileSize: s3Config.maxImageSize,
    files: 1, // Max 1 file per upload
  },
  fileFilter,
});

// create multer instance for multiple images
const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: s3Config.maxImageSize,
    files: 10, // Max 10 files per upload
  },
  fileFilter,
});

const handleMulterError = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // multer-specific errors
        if (err.code === "LIMIT_FILE_SIZE") {
          logger.warn("File size limit exceeded", {
            fileName: req.file?.originalname,
            maxSize: `${s3Config.maxFileSize / 1024 / 1024}MB`,
            ip: req.ip,
          });

          return next(
            createValidationError(
              `File too large. Maximum size: ${
                s3Config.maxFileSize / 1024 / 1024
              }MB`,
              { maxSize: s3Config.maxFileSize },
              "LIMIT_FILE_SIZE"
            )
          );
        }

        if (err.code === "LIMIT_FILE_COUNT") {
          logger.warn("File count limit exceeded", {
            maxFiles: 10,
            ip: req.ip,
          });

          return next(
            createValidationError(
              "Too many files. Maximum: 10 files",
              { maxFiles: 10 },
              "LIMIT_FILE_COUNT"
            )
          );
        }

        logger.warn("Multer error occurred", {
          code: err.code,
          message: err.message,
          ip: req.ip,
        });

        return next(
          createValidationError(err.message, { code: err.code }, "MULTER_ERROR")
        );
      } else if (err) {
        // other errors (including our custom validation errors)
        return next(err);
      }

      next();
    });
  };
};

module.exports = {
  uploadSingle: handleMulterError(uploadSingle.single("image")),
  uploadMultiple: handleMulterError(uploadMultiple.array("images", 10)),
};
