import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Visibility,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { contactValidator } from "../../utils/validators/contactValidator";

/**
 * Image Upload Field Component
 *
 * PURPOSE: Handle multiple image uploads with preview and validation
 * PROPS:
 * - images: Array of image objects { file, preview, uploaded, url, key }
 * - onChange: Callback when images change
 * - maxImages: Maximum number of images allowed (default 5)
 * - label: Field label
 * - helperText: Helper text
 * - disabled: Disable upload
 */

function ImageUploadField({
  images = [],
  onChange,
  maxImages = 5,
  label = "Upload Images",
  helperText = "Upload up to 5 images (JPEG, PNG, GIF, max 5MB each)",
  disabled = false,
}) {
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(
    (event) => {
      const files = Array.from(event.target.files);
      const newImages = [];
      const newErrors = [];

      // Check total count
      if (images.length + files.length > maxImages) {
        setErrors([`Maximum ${maxImages} images allowed`]);
        return;
      }

      files.forEach((file, index) => {
        // Validate file
        const validation = contactValidator.validateImage(file);
        if (!validation.valid) {
          newErrors.push(`${file.name}: ${validation.error}`);
          return;
        }

        // Create preview
        const preview = URL.createObjectURL(file);
        newImages.push({
          file,
          preview,
          uploaded: false,
          name: file.name,
          size: file.size,
        });
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
      } else {
        setErrors([]);
        onChange([...images, ...newImages]);
      }

      // Reset input
      event.target.value = "";
    },
    [images, maxImages, onChange]
  );

  const handleRemove = useCallback(
    (index) => {
      const newImages = [...images];
      // Revoke object URL to prevent memory leak
      if (newImages[index].preview && !newImages[index].uploaded) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      onChange(newImages);
    },
    [images, onChange]
  );

  const handlePreview = useCallback((image) => {
    // Open image in new tab
    const previewUrl = image.uploaded ? image.url : image.preview;
    window.open(previewUrl, "_blank");
  }, []);

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>

      {/* Upload Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={
            uploading ? <CircularProgress size={20} /> : <CloudUpload />
          }
          disabled={disabled || uploading || images.length >= maxImages}
          fullWidth
        >
          {uploading
            ? "Uploading..."
            : images.length >= maxImages
              ? `Maximum ${maxImages} images reached`
              : "Choose Images"}
          <input
            type="file"
            hidden
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleFileSelect}
            disabled={disabled || uploading || images.length >= maxImages}
          />
        </Button>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {helperText}
        </Typography>
      </Box>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "error.lighter" }}>
          {errors.map((error, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
            >
              <ErrorIcon sx={{ color: "error.main", fontSize: 20 }} />
              <Typography variant="caption" color="error.main">
                {error}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <ImageList cols={3} gap={12} sx={{ maxHeight: 400 }}>
          {images.map((image, index) => (
            <ImageListItem key={index}>
              <img
                src={image.uploaded ? image.url : image.preview}
                alt={image.name || `Image ${index + 1}`}
                loading="lazy"
                style={{
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <ImageListItemBar
                title={image.name || `Image ${index + 1}`}
                subtitle={
                  image.size ? `${(image.size / 1024).toFixed(0)} KB` : ""
                }
                actionIcon={
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(image)}
                      sx={{ color: "white" }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(index)}
                      disabled={disabled || uploading}
                      sx={{ color: "white" }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
}

export default ImageUploadField;
