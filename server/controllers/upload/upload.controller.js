const BaseController = require("../base.controller");
const s3Service = require("../../services/upload/s3.service");
const imageService = require("../../services/upload/image.service");
const { s3Config } = require("../../config/s3.config");
const { createValidationError } = require("../../utils/errors");
const logger = require("../../utils/logger");
const { sanitizeObject } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");
const { UploadValidator } = require("../../validators");

const baseController = new BaseController();

const uploadSingleImage = asyncHandler(async (req, res) => {
  // checks if file exists
  if (!req.file) {
    throw createValidationError("No file uploaded", {}, "NO_FILE_UPLOADED");
  }

  // get upload folder and subfolder from request body
  const { folder = "listings", subfolder } = sanitizeObject(req.body);

  // Validate folder using UploadValidator
  if (!UploadValidator.isValidFolder(folder)) {
    const allowedFolders = Object.keys(s3Config.folders);
    throw createValidationError(
      `Invalid folder. Allowed folders: ${allowedFolders.join(", ")}`,
      { folder, allowedFolders },
      "INVALID_FOLDER"
    );
  }

  baseController.logAction("UPLOAD_SINGLE_IMAGE", req, {
    fileName: req.file.originalname,
    folder,
    subfolder,
    size: req.file.size,
  });

  logger.info("Uploading single image to S3", {
    folder: `${folder}/${subfolder || ""}`,
    fileName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });

  const validation = await imageService.validateImage(req.file.buffer);
  if (!validation.valid) {
    throw validation.error;
  }

  // optimize image before upload
  const optimized = await imageService.optimizeImage(req.file.buffer, {
    format: "jpeg",
    quality: s3Config.imageQuality,
  });

  const result = await s3Service.uploadFile(
    optimized.buffer,
    req.file.originalname,
    "image/jpeg",
    s3Config.folders[folder],
    subfolder
  );

  logger.info("Image uploaded successfully", {
    url: result.url,
    savings: optimized.metadata.reductionPercent,
  });

  baseController.sendSuccess(
    res,
    {
      url: result.url,
      key: result.key,
      size: result.size,
      originalSize: optimized.metadata.originalSize,
      savings: optimized.metadata.reductionPercent,
    },
    "Image uploaded successfully",
    200
  );
}, "upload_single_image");

const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw createValidationError("No files uploaded", {}, "NO_FILES_UPLOADED");
  }

  const { folder = "listings", subfolder } = sanitizeObject(req.body);

  if (!UploadValidator.isValidFolder(folder)) {
    const allowedFolders = Object.keys(s3Config.folders);
    throw createValidationError(
      `Invalid folder. Allowed folders: ${allowedFolders.join(", ")}`,
      { folder, allowedFolders },
      "INVALID_FOLDER"
    );
  }

  baseController.logAction("UPLOAD_MULTIPLE_IMAGES", req, {
    count: req.files.length,
    folder,
    subfolder,
  });

  logger.info("Processing multiple image upload", {
    count: req.files.length,
    folder,
    subfolder,
  });

  // Process each file in parallel
  const uploadPromises = req.files.map(async (file) => {
    const validation = await imageService.validateImage(file.buffer);
    if (!validation.valid) {
      throw validation.error;
    }

    const optimized = await imageService.optimizeImage(file.buffer, {
      format: "jpeg",
      quality: s3Config.imageQuality,
    });

    const result = await s3Service.uploadFile(
      optimized.buffer,
      file.originalname,
      "image/jpeg",
      s3Config.folders[folder],
      subfolder
    );

    logger.info("Image uploaded successfully", {
      fileName: file.originalname,
      url: result.url,
      savings: optimized.metadata.reductionPercent,
    });

    return {
      url: result.url,
      key: result.key,
      size: result.size,
      originalName: file.originalname,
    };
  });

  const uploadedImages = await Promise.all(uploadPromises);

  baseController.sendSuccess(
    res,
    {
      images: uploadedImages,
      count: uploadedImages.length,
    },
    `${uploadedImages.length} images uploaded successfully`,
    200
  );
}, "upload_multiple_images");

const deleteImage = asyncHandler(async (req, res) => {
  const { key } = sanitizeObject(req.body);

  if (!key || !UploadValidator.isValidS3Key(key)) {
    throw createValidationError(
      "Valid S3 key is required for deletion",
      { key },
      "INVALID_S3_KEY"
    );
  }

  // SECURITY: Authorization check
  const userId = req.user._id.toString();
  const userRoles = req.user.roles || [];

  // Extract the key parts to check ownership
  // Expected format: folder/subfolder/timestamp-randomId-filename.ext
  // e.g., listings/userId123/1234567890-abc123-product.jpg
  const keyParts = key.split("/");

  // Check if user owns this file or is admin
  const isOwner = key.includes(userId);
  const isAdmin = userRoles.includes("admin");

  if (!isOwner && !isAdmin) {
    logger.security("Unauthorized file deletion attempt", {
      key,
      userId,
      roles: userRoles,
      ip: req.ip,
    });

    throw createValidationError(
      "You do not have permission to delete this file",
      { key },
      "UNAUTHORIZED_FILE_DELETION"
    );
  }

  baseController.logAction("DELETE_IMAGE", req, { key });

  logger.info("Deleting image", { key, userId: req.user?._id });

  // Delete from S3
  await s3Service.deleteFile(key);

  logger.info("Image deleted successfully", { key });

  baseController.sendSuccess(res, null, "Image deleted successfully", 200);
}, "delete_image");

const deleteMultipleImages = asyncHandler(async (req, res) => {
  const { keys } = sanitizeObject(req.body);

  if (!keys || !Array.isArray(keys) || keys.length === 0) {
    throw createValidationError(
      "Array of S3 keys is required for deletion",
      { keys },
      "INVALID_S3_KEYS"
    );
  }

  // Validate each key
  const invalidKeys = keys.filter((key) => !UploadValidator.isValidS3Key(key));
  if (invalidKeys.length > 0) {
    throw createValidationError(
      "One or more S3 keys are invalid",
      { invalidKeys },
      "INVALID_S3_KEYS"
    );
  }

  // SECURITY: Authorization check for each key
  const userId = req.user._id.toString();
  const userRoles = req.user.roles || [];
  const isAdmin = userRoles.includes("admin");

  // Check if user owns all files or is admin
  const unauthorizedKeys = [];

  if (!isAdmin) {
    keys.forEach((key) => {
      if (!key.includes(userId)) {
        unauthorizedKeys.push(key);
      }
    });

    if (unauthorizedKeys.length > 0) {
      logger.security("Unauthorized multiple file deletion attempt", {
        unauthorizedKeys,
        userId,
        roles: userRoles,
        ip: req.ip,
      });

      throw createValidationError(
        "You do not have permission to delete one or more files",
        { unauthorizedKeys },
        "UNAUTHORIZED_FILE_DELETION"
      );
    }
  }

  baseController.logAction("DELETE_MULTIPLE_IMAGES", req, {
    count: keys.length,
  });

  logger.info("Deleting multiple images", {
    count: keys.length,
    userId: req.user?._id,
  });

  // Delete from S3
  await s3Service.deleteMultipleFiles(keys);

  logger.info("Multiple images deleted successfully", { count: keys.length });

  baseController.sendSuccess(
    res,
    null,
    `${keys.length} images deleted successfully`,
    200
  );
}, "delete_multiple_images");

const uploadListingImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw createValidationError("No files uploaded", {}, "NO_FILES_UPLOADED");
  }

  const { subfolder } = sanitizeObject(req.body);

  baseController.logAction("UPLOAD_LISTING_IMAGES", req, {
    count: req.files.length,
    subfolder,
  });

  logger.info("Uploading listing images", {
    count: req.files.length,
    subfolder,
  });

  // Process each file in parallel
  const processPromises = req.files.map(async (file) => {
    const processed = await imageService.processListingImage(file.buffer);

    // upload main image
    const mainResult = await s3Service.uploadFile(
      processed.main,
      file.originalname,
      "image/jpeg",
      s3Config.folders["listings"],
      subfolder
    );

    // upload thumbnail
    const thumbResult = await s3Service.uploadFile(
      processed.thumbnail,
      `thumb_${file.originalname}`,
      "image/jpeg",
      s3Config.folders["listings"],
      subfolder
    );

    return {
      main: {
        url: mainResult.url,
        key: mainResult.key,
        size: mainResult.size,
      },
      thumbnail: {
        url: thumbResult.url,
        key: thumbResult.key,
        size: thumbResult.size,
      },
      savings: processed.metadata.reductionPercent,
    };
  });

  const results = await Promise.all(processPromises);

  baseController.sendSuccess(
    res,
    { images: results, count: results.length },
    `${results.length} listing images uploaded successfully`,
    200
  );
}, "upload_listing_images");

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  uploadListingImages,
};
