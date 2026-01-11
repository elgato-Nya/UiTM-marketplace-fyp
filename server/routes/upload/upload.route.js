const express = require("express");
const router = express.Router();
const uploadController = require("../../controllers/upload/upload.controller");
const {
  uploadSingle,
  uploadMultiple,
} = require("../../middleware/upload.middleware");
const { protect, authorize } = require("../../middleware/auth/auth.middleware");
const {
  validateUploadParams,
  validateDeleteImage,
  validateDeleteMultipleImages,
} = require("../../middleware/validations/upload/upload.validation");
const { uploadLimiter } = require("../../middleware/limiters.middleware");

/**
 * Upload Routes
 *
 * ENDPOINTS:
 * - POST /api/upload/single           - Upload single image
 * - POST /api/upload/multiple         - Upload multiple images
 * - POST /api/upload/listing          - Upload listing images (with thumbnails)
 * - DELETE /api/upload                - Delete single image
 * - DELETE /api/upload/multiple       - Delete multiple images
 *
 * SECURITY:
 * - All routes require authentication (protect middleware)
 * - Listing uploads require merchant role (authorize middleware)
 * - Validates upload parameters and file keys
 * - Rate limited to prevent S3 abuse
 *
 * @see docs/RATE-LIMITING-ENHANCEMENT-PLAN.md
 */

/**
 * @route   POST /api/upload/single
 * @desc    Upload single image (profile, avatar, etc.)
 * @access  Private
 * @ratelimit 30 requests per 15 minutes
 * @body    { image: File, folder: string, subfolder: string }
 */
router.post(
  "/single",
  protect,
  uploadLimiter,
  uploadSingle,
  validateUploadParams,
  uploadController.uploadSingleImage
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple images (up to 10)
 * @access  Private
 * @ratelimit 30 requests per 15 minutes
 * @body    { images: File[], folder: string, subfolder: string }
 */
router.post(
  "/multiple",
  protect,
  uploadLimiter,
  uploadMultiple,
  validateUploadParams,
  uploadController.uploadMultipleImages
);

/**
 * @route   POST /api/upload/listing
 * @desc    Upload listing images with thumbnails
 * @access  Private (Merchant only)
 * @ratelimit 30 requests per 15 minutes
 * @body    { images: File[], subfolder: listingId }
 */
router.post(
  "/listing",
  protect,
  authorize("merchant"),
  uploadLimiter,
  uploadMultiple,
  uploadController.uploadListingImages
);

/**
 * @route   DELETE /api/upload
 * @desc    Delete single image
 * @access  Private
 * @body    { key: string }
 */
router.delete("/", protect, validateDeleteImage, uploadController.deleteImage);

/**
 * @route   DELETE /api/upload/multiple
 * @desc    Delete multiple images
 * @access  Private
 * @body    { keys: string[] }
 */
router.delete(
  "/multiple",
  protect,
  validateDeleteMultipleImages,
  uploadController.deleteMultipleImages
);

/**
 * TESTING ROUTES (Remove in production!)
 * These routes help you test uploads without authentication
 */
if (process.env.NODE_ENV === "development") {
  /**
   * @route   GET /api/upload/test
   * @desc    Test if upload routes are working
   */
  router.get("/test", (req, res) => {
    res.json({
      success: true,
      message: "Upload routes are working!",
      endpoints: {
        single: "POST /api/upload/single",
        multiple: "POST /api/upload/multiple",
        listing: "POST /api/upload/listing",
        delete: "DELETE /api/upload",
      },
      note: "Use Postman or Thunder Client to test uploads",
    });
  });
}

module.exports = router;
