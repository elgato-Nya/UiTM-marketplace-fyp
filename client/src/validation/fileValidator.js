/**
 * File Validation Utilities
 *
 * PURPOSE: Pure validation functions for file uploads
 * PATTERN: Follows validation/ pattern (no React dependencies)
 * USAGE: Can be used anywhere (hooks, components, services)
 */

/**
 * Default validation options
 */
export const FILE_VALIDATION_DEFAULTS = {
  maxSize: 5, // MB
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxFiles: 10,
};

/**
 * Convert bytes to MB
 */
export const bytesToMB = (bytes) => bytes / 1024 / 1024;

/**
 * Get file extension from MIME type
 */
export const getFileExtension = (mimeType) => {
  const map = {
    "image/jpeg": "JPG",
    "image/jpg": "JPG",
    "image/png": "PNG",
    "image/webp": "WEBP",
    "image/gif": "GIF",
  };
  return map[mimeType] || mimeType.split("/")[1]?.toUpperCase() || "Unknown";
};

/**
 * Format accepted types for display
 */
export const formatAcceptedTypes = (types) => {
  return types.map(getFileExtension).join(", ");
};

/**
 * Validate file type
 *
 * @param {File} file - File to validate
 * @param {string[]} acceptedTypes - Accepted MIME types
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateFileType = (
  file,
  acceptedTypes = FILE_VALIDATION_DEFAULTS.acceptedTypes
) => {
  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.name}. Accepted: ${formatAcceptedTypes(acceptedTypes)}`,
    };
  }
  return { valid: true, error: null };
};

/**
 * Validate file size
 *
 * @param {File} file - File to validate
 * @param {number} maxSize - Max size in MB
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateFileSize = (
  file,
  maxSize = FILE_VALIDATION_DEFAULTS.maxSize
) => {
  const fileSizeMB = bytesToMB(file.size);

  if (fileSizeMB > maxSize) {
    return {
      valid: false,
      error: `File too large: ${file.name}. Size: ${fileSizeMB.toFixed(2)}MB. Max: ${maxSize}MB`,
    };
  }
  return { valid: true, error: null };
};

/**
 * Validate single file (type + size)
 *
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateFile = (file, options = {}) => {
  const { maxSize, acceptedTypes } = {
    ...FILE_VALIDATION_DEFAULTS,
    ...options,
  };

  const errors = [];

  // Validate type
  const typeValidation = validateFileType(file, acceptedTypes);
  if (!typeValidation.valid) {
    errors.push(typeValidation.error);
  }

  // Validate size
  const sizeValidation = validateFileSize(file, maxSize);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate multiple files
 *
 * @param {FileList|File[]} files - Files to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { valid: boolean, validFiles: File[], errors: string[] }
 */
export const validateFiles = (files, options = {}) => {
  const { maxFiles, maxSize, acceptedTypes } = {
    ...FILE_VALIDATION_DEFAULTS,
    ...options,
  };

  const fileArray = Array.from(files);
  const errors = [];
  const validFiles = [];

  // Check max files
  if (fileArray.length > maxFiles) {
    errors.push(
      `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed. You selected ${fileArray.length}.`
    );
    // Take only first maxFiles
    fileArray.splice(maxFiles);
  }

  // Validate each file
  fileArray.forEach((file) => {
    const validation = validateFile(file, { maxSize, acceptedTypes });

    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push(...validation.errors);
    }
  });

  return {
    valid: errors.length === 0 && validFiles.length > 0,
    validFiles,
    errors,
  };
};

/**
 * Generate file preview (returns Promise)
 *
 * @param {File} file - File to preview
 * @returns {Promise<Object>} - { file, preview: base64 string }
 */
export const generateFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve({
        file,
        preview: e.target.result,
      });
    };

    reader.onerror = (error) => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Generate multiple file previews
 *
 * @param {File[]} files - Files to preview
 * @returns {Promise<Object[]>} - Array of { file, preview }
 */
export const generateFilePreviews = async (files) => {
  const previewPromises = files.map(generateFilePreview);
  return Promise.all(previewPromises);
};
