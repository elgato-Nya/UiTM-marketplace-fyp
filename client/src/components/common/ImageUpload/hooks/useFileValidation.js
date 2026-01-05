import { useCallback } from "react";
import { useSnackbar } from "../../../../hooks/useSnackbar";
import {
  validateFile as validateFilePure,
  validateFiles as validateFilesPure,
  generateFilePreview,
  generateFilePreviews,
  FILE_VALIDATION_DEFAULTS,
} from "../../../../validation/fileValidator";

/**
 * useFileValidation - File validation hook with UI feedback
 *
 * PURPOSE: Wrap pure validation functions with React hooks + snackbar feedback
 * PATTERN: Thin wrapper around validation/ logic
 *
 * ARCHITECTURE:
 * - Pure logic lives in validation/fileValidator.js
 * - This hook adds React dependencies (useCallback, useSnackbar)
 * - Components use this hook for UI-integrated validation
 *
 * @param {Object} options
 * @param {number} options.maxSize - Max file size in MB
 * @param {string[]} options.acceptedTypes - Accepted MIME types
 * @param {number} options.maxFiles - Maximum number of files
 * @returns {Object} - Validation functions with UI feedback
 */
export function useFileValidation(options = {}) {
  const validationOptions = { ...FILE_VALIDATION_DEFAULTS, ...options };
  const { error: showError, warning: showWarning } = useSnackbar();

  /**
   * Validate single file with UI feedback
   */
  const validateFile = useCallback(
    (file) => {
      const result = validateFilePure(file, validationOptions);

      // Show errors via snackbar
      if (!result.valid) {
        result.errors.forEach((error) => showError(error));
      }

      return result.valid;
    },
    [validationOptions, showError]
  );

  /**
   * Validate multiple files with UI feedback
   */
  const validateFiles = useCallback(
    (files) => {
      const result = validateFilesPure(files, validationOptions);

      // Show warnings/errors via snackbar
      if (result.errors.length > 0) {
        const fileCountErrors = result.errors.filter(
          (e) => e.includes("upload up to") || e.includes("Maximum")
        );
        const otherErrors = result.errors.filter(
          (e) => !e.includes("upload up to") && !e.includes("Maximum")
        );

        // Show file count as warning
        fileCountErrors.forEach((error) => showWarning(error));

        // Show validation errors as errors (limit to 3 to avoid spam)
        const errorsToShow = otherErrors.slice(0, 3);
        errorsToShow.forEach((error) => showError(error));

        // If more than 3 errors, show a summary
        if (otherErrors.length > 3) {
          showError(`And ${otherErrors.length - 3} more file(s) have issues.`);
        }
      }

      if (result.validFiles.length === 0 && result.errors.length > 0) {
        showError(
          "None of the selected files are valid. Please check file types and sizes."
        );
      }

      return result.validFiles;
    },
    [validationOptions, showWarning, showError]
  );

  /**
   * Generate file preview (memoized)
   */
  const generatePreview = useCallback(
    (file) => {
      return generateFilePreview(file).catch((error) => {
        showError(error.message);
        return null;
      });
    },
    [showError]
  );

  /**
   * Generate multiple previews (memoized)
   */
  const generatePreviews = useCallback(
    async (files) => {
      try {
        return await generateFilePreviews(files);
      } catch (error) {
        showError("Failed to generate file previews");
        return [];
      }
    },
    [showError]
  );

  return {
    validateFile,
    validateFiles,
    generatePreview,
    generatePreviews,
  };
}
