import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Upload as UploadIcon, DeleteOutline } from "@mui/icons-material";
import { useImageUpload } from "../../../../hooks/useImageUpload";
import { useSnackbar } from "../../../../hooks/useSnackbar";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const PrimaryOptionImageManager = ({
  options = [],
  uploadSubfolder = "temp",
  disabled = false,
  onImageChange,
}) => {
  const fileInputRefs = useRef({});
  const [uploadingValue, setUploadingValue] = useState("");
  const { uploadListing } = useImageUpload();
  const { success: showSuccess, error: showError } = useSnackbar();

  const sortedOptions = useMemo(() => options.filter(Boolean), [options]);

  const setFileInputRef = (value) => (element) => {
    fileInputRefs.current[value] = element;
  };

  const openFilePicker = (value) => {
    if (disabled || uploadingValue) return;
    fileInputRefs.current[value]?.click();
  };

  const handleFileChange = async (value, event) => {
    const file = event.target.files?.[0];

    if (event.target) {
      event.target.value = "";
    }

    if (!file) {
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type.toLowerCase())) {
      showError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showError("Image size must be 5MB or smaller.");
      return;
    }

    setUploadingValue(value);

    try {
      const result = await uploadListing([file], uploadSubfolder || "temp");
      const uploadedImage = result?.data?.images?.[0] || result?.images?.[0];
      const nextImageUrl = uploadedImage?.main?.url;

      if (!nextImageUrl) {
        throw new Error("Image upload completed, but no image URL was returned.");
      }

      onImageChange(value, nextImageUrl);
      showSuccess(`Image updated for ${value}.`);
    } catch (error) {
      const errorMessage =
        error?.message ||
        "Failed to upload image. Please try again with a supported file.";
      showError(errorMessage);
    } finally {
      setUploadingValue("");
    }
  };

  const handleRemove = (value) => {
    if (disabled || uploadingValue) return;
    onImageChange(value, "");
  };

  if (sortedOptions.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
        Primary Option Images (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Recommended for color, design, pattern, or style variants.
      </Typography>

      <Stack spacing={1.25}>
        {sortedOptions.map((option) => {
          const isUploading = uploadingValue === option.value;
          const hasImage = Boolean(option.imageUrl);

          return (
            <Paper
              key={option.value}
              variant="outlined"
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "action.hover",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {hasImage ? (
                    <Box
                      component="img"
                      src={option.imageUrl}
                      alt={`${option.value} option`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No image
                    </Typography>
                  )}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {option.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {hasImage ? "Shown when this primary option is selected." : "Uses main listing image as fallback."}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <input
                  ref={setFileInputRef(option.value)}
                  type="file"
                  accept={ALLOWED_FILE_TYPES.join(",")}
                  hidden
                  onChange={(event) => handleFileChange(option.value, event)}
                />

                <Button
                  size="small"
                  variant={hasImage ? "outlined" : "contained"}
                  startIcon={
                    isUploading ? <CircularProgress size={14} color="inherit" /> : <UploadIcon fontSize="small" />
                  }
                  onClick={() => openFilePicker(option.value)}
                  disabled={disabled || Boolean(uploadingValue)}
                  sx={{ textTransform: "none" }}
                >
                  {isUploading ? "Uploading..." : hasImage ? "Change" : "Upload"}
                </Button>

                {hasImage && (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<DeleteOutline fontSize="small" />}
                    onClick={() => handleRemove(option.value)}
                    disabled={disabled || Boolean(uploadingValue)}
                    sx={{ textTransform: "none" }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

PrimaryOptionImageManager.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
    })
  ),
  uploadSubfolder: PropTypes.string,
  disabled: PropTypes.bool,
  onImageChange: PropTypes.func.isRequired,
};

export default PrimaryOptionImageManager;
