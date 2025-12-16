import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Button,
  Stack,
  LinearProgress,
  CircularProgress,
  alpha,
} from "@mui/material";
import { CloudUpload, Image as ImageIcon } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { useFileValidation } from "./hooks/useFileValidation";
import ImagePreviewGrid from "./ImagePreviewGrid";

/**
 * ImageUploadZone - Generic drag-and-drop image upload component
 *
 * PURPOSE: Provide reusable upload interface with drag-drop support
 * PATTERN: Controlled component with file validation
 *
 * FEATURES:
 * - Drag and drop
 * - File validation
 * - Preview generation
 * - Progress tracking
 * - Multiple/single file support
 *
 * @param {Object} props
 * @param {Function} props.onFilesSelected - Callback when files selected: (files) => {}
 * @param {Function} props.onUpload - Callback to trigger upload: (files) => Promise
 * @param {boolean} props.multiple - Allow multiple files
 * @param {number} props.maxFiles - Maximum files allowed
 * @param {number} props.maxSize - Max file size in MB
 * @param {string[]} props.acceptedTypes - Accepted MIME types
 * @param {boolean} props.disabled - Disable upload
 * @param {boolean} props.isUploading - Upload in progress
 * @param {number} props.uploadProgress - Upload progress (0-100)
 * @param {boolean} props.showProgress - Show progress bar
 * @param {boolean} props.autoUpload - Auto upload on file select
 * @param {boolean} props.hidePreview - Hide internal preview grid
 * @param {React.ReactNode} props.children - Custom content (optional)
 */
function ImageUploadZone({
  onFilesSelected,
  onUpload,
  multiple = false,
  maxFiles = 1,
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  disabled = false,
  isUploading = false,
  uploadProgress = 0,
  showProgress = true,
  autoUpload = false,
  hidePreview = false,
  children,
}) {
  const { theme } = useTheme();
  const fileInputRef = useRef(null);

  const { validateFiles, generatePreviews } = useFileValidation({
    maxSize,
    acceptedTypes,
    maxFiles,
  });

  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    async (files) => {
      const validFiles = validateFiles(files);

      if (validFiles.length === 0) {
        return;
      }

      setSelectedFiles(validFiles);

      // Generate previews
      const previewData = await generatePreviews(validFiles);
      setPreviews(previewData);

      // Notify parent
      if (onFilesSelected) {
        onFilesSelected(validFiles);
      }

      // Auto upload if enabled
      if (autoUpload && onUpload) {
        onUpload(validFiles);
      }
    },
    [validateFiles, generatePreviews, onFilesSelected, autoUpload, onUpload]
  );

  /**
   * File input change handler
   */
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = "";
    }
  };

  /**
   * Drag handlers
   */
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect]
  );

  /**
   * Remove file from selection
   */
  const removeFile = useCallback(
    (index) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);

      setSelectedFiles(newFiles);
      setPreviews(newPreviews);

      if (onFilesSelected) {
        onFilesSelected(newFiles);
      }
    },
    [selectedFiles, previews, onFilesSelected]
  );

  /**
   * Clear all selected files
   */
  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFilesSelected) {
      onFilesSelected([]);
    }
  }, [onFilesSelected]);

  /**
   * Trigger upload
   */
  const handleUploadClick = () => {
    if (onUpload && selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  const isDisabled = disabled || isUploading;

  return (
    <Box>
      {/* Drop Zone */}
      <Paper
        sx={{
          border: `2px dashed ${
            dragActive ? theme.palette.primary.main : theme.palette.divider
          }`,
          borderRadius: 2,
          p: 3,
          bgcolor: dragActive
            ? alpha(theme.palette.primary.main, 0.1)
            : alpha(theme.palette.action.hover, 0.3),
          transition: "all 0.3s ease",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          "&:hover": isDisabled
            ? {}
            : {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
        }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isDisabled && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload image area"
      >
        {children || (
          <Box sx={{ textAlign: "center" }}>
            <CloudUpload
              sx={{
                fontSize: 48,
                color: dragActive
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              color={dragActive ? "primary" : "text.primary"}
              gutterBottom
            >
              {dragActive
                ? "Drop images here"
                : `Drag & drop ${multiple ? "images" : "image"} here`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or click to browse
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              flexWrap="wrap"
            >
              <Chip
                size="small"
                label={
                  maxFiles === 1
                    ? "1 image"
                    : `Add up to ${maxFiles} more ${maxFiles > 1 ? "images" : "image"}`
                }
                icon={<ImageIcon />}
              />
              <Chip size="small" label={`${maxSize}MB max per file`} />
              <Chip size="small" label="JPG, PNG, WEBP" />
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={handleFileInputChange}
        disabled={isDisabled}
        aria-label="File input"
      />

      {/* Preview Grid - only show if hidePreview is false */}
      {!hidePreview && (
        <ImagePreviewGrid
          images={previews}
          type="preview"
          onRemove={removeFile}
          onClearAll={clearAll}
          disabled={isUploading}
        />
      )}

      {/* Upload Button - only show when autoUpload is false AND onUpload callback exists */}
      {!autoUpload && onUpload && selectedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={
              isUploading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CloudUpload />
              )
            }
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading
              ? `Uploading... ${uploadProgress}%`
              : `Upload ${selectedFiles.length} Image${
                  selectedFiles.length > 1 ? "s" : ""
                }`}
          </Button>
        </Box>
      )}

      {/* Progress Bar */}
      {showProgress && isUploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Upload Progress: {uploadProgress}%
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default ImageUploadZone;
