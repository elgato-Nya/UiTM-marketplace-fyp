import React, { useState } from "react";
import {
  Box,
  Avatar,
  IconButton,
  Button,
  LinearProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { Edit, PhotoCamera, Delete } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { useSnackbar } from "../../../hooks/useSnackbar";
import { useImageUpload } from "../../../hooks/useImageUpload";
import ImageCropDialog from "./ImageCropDialog";

/**
 * AvatarUploadZone - Avatar-specific upload component
 *
 * PURPOSE: Handle profile picture upload with circular preview and crop
 * PATTERN: Specialized wrapper around file upload logic
 *
 * FEATURES:
 * - Circular avatar display
 * - Crop dialog with zoom
 * - S3 upload integration
 * - Delete functionality
 * - Upload progress
 *
 * @param {Object} props
 * @param {string} props.currentAvatar - Current avatar URL
 * @param {string} props.username - Username for initials
 * @param {Function} props.onUploadComplete - Callback when upload completes: (result) => {}
 * @param {Function} props.onDelete - Callback when avatar deleted
 * @param {number} props.size - Avatar size in pixels
 * @param {boolean} props.editable - Allow editing
 */
function AvatarUploadZone({
  currentAvatar,
  username,
  onUploadComplete,
  onDelete,
  size = 120,
  editable = true,
}) {
  const { theme } = useTheme();
  const { success: showSuccess, error: showError } = useSnackbar();
  const { uploadSingle, isUploading, uploadProgress } = useImageUpload();

  const [cropDialog, setCropDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  /**
   * Get avatar initials
   */
  const getInitials = () => {
    if (!username) return "U";
    return username
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 5) {
      showError("Image must be less than 5MB");
      return;
    }

    // Generate preview and open crop dialog
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedFile(file);
      setPreviewImage(e.target.result);
      setCropDialog(true);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle crop and upload
   */
  const handleCropSave = async (file) => {
    try {
      // Upload to S3
      const result = await uploadSingle(file, "profiles", "avatars");

      showSuccess("Profile picture updated successfully!");

      // Notify parent
      if (onUploadComplete) {
        onUploadComplete(result);
      }

      // Close dialog
      setCropDialog(false);
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (error) {
      showError(error.message || "Failed to upload profile picture");
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Box sx={{ textAlign: "center", position: "relative" }}>
      {/* Avatar Display */}
      <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
        <Avatar
          src={currentAvatar}
          alt={`${username || "User"}'s profile picture`}
          onClick={() => currentAvatar && setPreviewOpen(true)}
          sx={{
            width: size,
            height: size,
            fontSize: size * 0.3,
            bgcolor: theme.palette.primary.main,
            cursor: currentAvatar ? "pointer" : "default",
            border: `4px solid ${theme.palette.background.paper}`,
            boxShadow: theme.shadows[3],
          }}
        >
          {!currentAvatar && getInitials()}
        </Avatar>

        {/* Edit Button */}
        {editable && (
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              bgcolor: theme.palette.primary.main,
              color: "white",
              width: 36,
              height: 36,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
              boxShadow: theme.shadows[2],
            }}
            disabled={isUploading}
            aria-label="Change profile picture"
          >
            {isUploading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Edit sx={{ fontSize: 18 }} />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </IconButton>
        )}
      </Box>

      {/* Action Buttons */}
      {editable && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            component="label"
            disabled={isUploading}
          >
            Upload Photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </Button>
          {currentAvatar && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
              disabled={isUploading}
            >
              Remove
            </Button>
          )}
        </Box>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Uploading: {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Preview</DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <Avatar
            src={currentAvatar}
            alt={`${username}'s profile picture`}
            sx={{
              width: 200,
              height: 200,
              mx: "auto",
              fontSize: "4rem",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Crop Dialog */}
      <ImageCropDialog
        open={cropDialog}
        onClose={() => {
          setCropDialog(false);
          setSelectedFile(null);
          setPreviewImage(null);
        }}
        onSave={handleCropSave}
        previewImage={previewImage}
        selectedFile={selectedFile}
        isUploading={isUploading}
      />
    </Box>
  );
}

export default AvatarUploadZone;
