import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useSnackbar } from "../../../hooks/useSnackbar";
import { useImageUpload } from "../../../hooks/useImageUpload";
import ImageUploadZone from "./ImageUploadZone";
import ImagePreviewGrid from "./ImagePreviewGrid";

/**
 * ListingImageUpload - Listing-specific image upload component
 *
 * PURPOSE: Handle listing images with thumbnail generation
 * PATTERN: Specialized wrapper for listing image management
 *
 * FEATURES:
 * - Multiple image upload (up to 10)
 * - Existing image management
 * - Thumbnail generation
 * - S3 upload integration
 *
 * @param {Object} props
 * @param {string} props.listingId - Listing ID (used as subfolder)
 * @param {string[]} props.existingImages - Existing image URLs
 * @param {Function} props.onUploadComplete - Callback when upload completes: (result) => {}
 * @param {Function} props.onDeleteExisting - Callback to delete existing image: (url) => {}
 * @param {number} props.maxImages - Maximum images allowed
 * @param {boolean} props.showHeader - Show component header (default: false)
 */
function ListingImageUpload({
  listingId,
  existingImages = [],
  onUploadComplete,
  onDeleteExisting,
  maxImages = 10,
  showHeader = false,
}) {
  const { error: showError, success: showSuccess } = useSnackbar();
  const { uploadListing, isUploading, uploadProgress } = useImageUpload();

  const [localExistingImages, setLocalExistingImages] =
    useState(existingImages);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Sync existing images
  useEffect(() => {
    setLocalExistingImages(existingImages);
  }, [existingImages]);

  /**
   * Handle file selection and trigger upload
   */
  const handleFilesSelected = async (files) => {
    try {
      setSelectedFiles(files);

      // Upload the files immediately using dedicated listing upload
      const result = await uploadListing(files, listingId || "temp");

      // Clear selected files after successful upload
      setSelectedFiles([]);

      // Notify parent with upload result
      if (onUploadComplete && result) {
        onUploadComplete(result);
      }

      showSuccess("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      showError(error.message || "Failed to upload images");
      setSelectedFiles([]); // Clear on error too
    }
  };

  /**
   * Handle delete existing image
   */
  const handleDeleteExisting = (imageUrl) => {
    setLocalExistingImages((prev) => prev.filter((url) => url !== imageUrl));

    if (onDeleteExisting) {
      onDeleteExisting(imageUrl);
    }
  };

  return (
    <Box component="div" role="region" aria-label="Image upload section">
      {showHeader && (
        <Box component="header" sx={{ mb: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Listing Images
          </Typography>

          <Typography variant="body2" color="text.secondary" component="p">
            Upload up to {maxImages} images for your listing. Thumbnails will be
            generated automatically.
          </Typography>
        </Box>
      )}

      {/* Existing Images */}
      {localExistingImages.length > 0 && (
        <Box
          sx={{ mb: 2 }}
          component="section"
          aria-labelledby="existing-images-heading"
        >
          <Typography
            id="existing-images-heading"
            variant="srOnly"
            component="h3"
          >
            Current uploaded images
          </Typography>
          <ImagePreviewGrid
            images={localExistingImages}
            type="existing"
            onRemove={handleDeleteExisting}
          />
        </Box>
      )}

      {/* Upload Zone - hide internal preview, we show our own below */}
      <Box component="section" aria-label="File upload area">
        <ImageUploadZone
          onFilesSelected={handleFilesSelected}
          multiple={true}
          maxFiles={maxImages - localExistingImages.length}
          maxSize={5}
          acceptedTypes={["image/jpeg", "image/jpg", "image/png", "image/webp"]}
          autoUpload={false}
          showProgress={true}
          hidePreview={true}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </Box>
    </Box>
  );
}

export default ListingImageUpload;
