import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useSnackbar } from "../../../hooks/useSnackbar";
import { useImageUpload } from "../../../hooks/useImageUpload";
import ImageUploadZone from "./ImageUploadZone";
import ImagePreviewGrid from "./ImagePreviewGrid";
import ListingImageCropDialog from "./ListingImageCropDialog";
import { cropListingImage, getImageDimensions } from "../../../utils/imageCrop";

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
 * @param {string[]} props.newlyUploadedImages - Newly uploaded image URLs (in this session)
 * @param {Function} props.onUploadComplete - Callback when upload completes: (result) => {}
 * @param {Function} props.onDeleteExisting - Callback to delete existing image: (url) => {}
 * @param {Function} props.onDeleteNew - Callback to delete newly uploaded image: (url) => {}
 * @param {number} props.maxImages - Maximum images allowed
 * @param {boolean} props.showHeader - Show component header (default: false)
 */
function ListingImageUpload({
  listingId,
  existingImages = [],
  newlyUploadedImages = [],
  onUploadComplete,
  onDeleteExisting,
  onDeleteNew,
  maxImages = 10,
  showHeader = false,
}) {
  const { error: showError, success: showSuccess } = useSnackbar();
  const { uploadListing, isUploading, uploadProgress } = useImageUpload();

  const [localExistingImages, setLocalExistingImages] =
    useState(existingImages);
  const [localNewImages, setLocalNewImages] = useState(newlyUploadedImages);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [cropDialog, setCropDialog] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);

  // Use refs to track previous values for proper comparison
  const prevExistingRef = useRef(existingImages);
  const prevNewRef = useRef(newlyUploadedImages);

  // Sync existing images only when content actually changes
  useEffect(() => {
    const prevExisting = prevExistingRef.current;
    const hasChanged =
      existingImages.length !== prevExisting.length ||
      existingImages.some((img, i) => img !== prevExisting[i]);

    if (hasChanged) {
      setLocalExistingImages(existingImages);
      prevExistingRef.current = existingImages;
    }
  }, [existingImages]);

  // Sync newly uploaded images only when content actually changes
  useEffect(() => {
    const prevNew = prevNewRef.current;
    const hasChanged =
      newlyUploadedImages.length !== prevNew.length ||
      newlyUploadedImages.some((img, i) => img !== prevNew[i]);

    if (hasChanged) {
      setLocalNewImages(newlyUploadedImages);
      prevNewRef.current = newlyUploadedImages;
    }
  }, [newlyUploadedImages]);

  /**
   * Handle file selection - Open crop dialog for first file
   */
  const handleFilesSelected = async (files) => {
    if (files.length === 0) return;

    try {
      // Store all files
      setPendingFiles(files);

      // Show crop dialog for first file
      const firstFile = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        setCurrentFile(firstFile);
        setCurrentPreview(e.target.result);
        setCropDialog(true);
      };

      reader.readAsDataURL(firstFile);
    } catch (error) {
      console.error("File selection error:", error);
      showError("Failed to process selected files");
    }
  };

  /**
   * Handle crop dialog save - Upload current file with crop applied
   */
  const handleCropSave = async (file, cropData) => {
    try {
      // Apply the crop transformation to create new file
      showSuccess("Processing image...");
      const croppedFile = await cropListingImage(file, cropData);

      // Upload the cropped file
      const result = await uploadListing([croppedFile], listingId || "temp");

      // Notify parent with upload result
      if (onUploadComplete && result) {
        onUploadComplete(result);
      }

      // Remove uploaded file from pending
      const remainingFiles = pendingFiles.filter((f) => f !== currentFile);
      setPendingFiles(remainingFiles);

      // If there are more files, show crop dialog for next file
      if (remainingFiles.length > 0) {
        const nextFile = remainingFiles[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          setCurrentFile(nextFile);
          setCurrentPreview(e.target.result);
          // Dialog stays open
        };

        reader.readAsDataURL(nextFile);
      } else {
        // All files processed
        setCropDialog(false);
        setCurrentFile(null);
        setCurrentPreview(null);
        setSelectedFiles([]);
        const totalUploaded = pendingFiles.length;
        showSuccess(
          `${totalUploaded === 1 ? "Image" : `${totalUploaded} images`} uploaded successfully!`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);

      // Enhanced error message handling
      let errorMessage = "Failed to upload image";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.statusCode === 413) {
        errorMessage =
          "File is too large. Please compress your image (max 5MB per file) and try again.";
      } else if (error.statusCode === 400) {
        errorMessage =
          error.details?.message ||
          "Invalid file. Please check file type (JPG, PNG, WEBP only) and size (max 5MB each).";
      }

      showError(errorMessage);

      // Close dialog on error
      setCropDialog(false);
      setCurrentFile(null);
      setCurrentPreview(null);
      setPendingFiles([]);
      setSelectedFiles([]);
    }
  };

  /**
   * Handle crop dialog close
   */
  const handleCropClose = () => {
    setCropDialog(false);
    setCurrentFile(null);
    setCurrentPreview(null);
    setPendingFiles([]);
    setSelectedFiles([]);
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

  /**
   * Handle delete newly uploaded image
   */
  const handleDeleteNew = (imageUrl) => {
    setLocalNewImages((prev) => prev.filter((url) => url !== imageUrl));

    if (onDeleteNew) {
      onDeleteNew(imageUrl);
    }
  };

  const totalImages = localExistingImages.length + localNewImages.length;

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
            variant="subtitle2"
            component="h3"
            sx={{ mb: 1 }}
          >
            Existing Images ({localExistingImages.length})
          </Typography>
          <ImagePreviewGrid
            images={localExistingImages}
            type="existing"
            onRemove={handleDeleteExisting}
          />
        </Box>
      )}

      {/* Newly Uploaded Images */}
      {localNewImages.length > 0 && (
        <Box
          sx={{ mb: 2 }}
          component="section"
          aria-labelledby="new-images-heading"
        >
          <Typography
            id="new-images-heading"
            variant="subtitle2"
            component="h3"
            sx={{ mb: 1 }}
          >
            Newly Uploaded Images ({localNewImages.length})
          </Typography>
          <ImagePreviewGrid
            images={localNewImages}
            type="existing"
            onRemove={handleDeleteNew}
          />
        </Box>
      )}

      {/* Upload Zone - hide internal preview, we show our own below */}
      <Box component="section" aria-label="File upload area">
        <ImageUploadZone
          onFilesSelected={handleFilesSelected}
          multiple={true}
          maxFiles={maxImages - totalImages}
          maxSize={5}
          acceptedTypes={["image/jpeg", "image/jpg", "image/png", "image/webp"]}
          autoUpload={false}
          showProgress={true}
          hidePreview={true}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </Box>

      {/* Crop Dialog */}
      <ListingImageCropDialog
        open={cropDialog}
        onClose={handleCropClose}
        onSave={handleCropSave}
        previewImage={currentPreview}
        selectedFile={currentFile}
        isUploading={isUploading}
      />
    </Box>
  );
}

export default ListingImageUpload;
