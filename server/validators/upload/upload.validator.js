/**
 * Pure validation functions for upload-related data
 * Following the exact pattern from UserValidator and ListingValidator
 */
class UploadValidator {
  /**
   * Validates image URL or base64 string
   * @param {string} imageUrl
   * @returns {boolean}
   * NOTE: Consolidates UserValidator.isValidAvatar and ListingValidator.isValidImageUrl
   */
  static isValidImageUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string") return false;

    // S3 URL pattern (after upload)
    const s3UrlPattern = /^https:\/\/[\w-]+\.s3\.[\w-]+\.amazonaws\.com\/.+/;

    // Generic HTTPS URL pattern
    const httpsUrlPattern = /^https:\/\/.+/;

    // Base64 image pattern
    const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;

    return (
      s3UrlPattern.test(imageUrl) ||
      httpsUrlPattern.test(imageUrl) ||
      base64Pattern.test(imageUrl)
    );
  }

  /**
   * Validates array of image URLs
   * @param {Array} images
   * @param {number} maxCount - Maximum number of images allowed
   * @returns {boolean}
   */
  static isValidImagesArray(images, maxCount = 10) {
    if (!Array.isArray(images)) return false;
    if (images.length === 0 || images.length > maxCount) return false;
    return images.every((url) => UploadValidator.isValidImageUrl(url));
  }

  /**
   * Validates folder name
   * @param {string} folder
   * @returns {boolean}
   */
  static isValidFolder(folder) {
    if (!folder || typeof folder !== "string") return false;
    const allowedFolders = [
      "listings",
      "profiles",
      "shops",
      "reviews",
      "reports",
      "documents",
    ];
    return allowedFolders.includes(folder);
  }

  /**
   * Validates subfolder (typically userId or listingId)
   * @param {string} subfolder
   * @returns {boolean}
   */
  static isValidSubfolder(subfolder) {
    if (!subfolder || typeof subfolder !== "string") return false;
    // Allow alphanumeric, hyphens, and underscores (for MongoDB IDs and slugs)
    return /^[a-zA-Z0-9_-]{1,100}$/.test(subfolder);
  }

  /**
   * Validates S3 object key (for deletion)
   * @param {string} key
   * @returns {boolean}
   */
  static isValidS3Key(key) {
    if (!key || typeof key !== "string") return false;
    // S3 key pattern: folder/subfolder/filename
    return /^[\w-]+\/[\w-\/]+\.(jpg|jpeg|png|gif|webp)$/i.test(key);
  }

  /**
   * Validates MIME type
   * @param {string} mimetype
   * @returns {boolean}
   */
  static isValidImageMimeType(mimetype) {
    if (!mimetype || typeof mimetype !== "string") return false;
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    return allowedTypes.includes(mimetype.toLowerCase());
  }

  /**
   * Validates file size
   * @param {number} size - Size in bytes
   * @param {number} maxSize - Maximum size in bytes
   * @returns {boolean}
   */
  static isValidFileSize(size, maxSize = 5 * 1024 * 1024) {
    if (typeof size !== "number") return false;
    return size > 0 && size <= maxSize;
  }
}

/**
 * Error messages for upload validation failures
 */
const uploadErrorMessages = {
  file: {
    required: "File is required",
    invalid: "Invalid file format",
    tooLarge: "File size exceeds maximum allowed",
    mimetype: "Invalid file type. Allowed types: JPEG, PNG, WebP, GIF",
  },
  folder: {
    required: "Folder is required",
    invalid:
      "Invalid folder. Allowed: listings, profiles, shops, reviews, reports, documents",
  },
  subfolder: {
    invalid: "Invalid subfolder format",
  },
  key: {
    required: "S3 key is required",
    invalid: "Invalid S3 key format",
  },
  keys: {
    required: "S3 keys array is required",
    invalid: "Invalid S3 keys array",
    empty: "S3 keys array cannot be empty",
  },
  images: {
    required: "Images are required",
    invalid: "Invalid image URLs",
    tooMany: "Too many images. Maximum allowed: 10",
  },
};

module.exports = {
  UploadValidator,
  uploadErrorMessages,
};
