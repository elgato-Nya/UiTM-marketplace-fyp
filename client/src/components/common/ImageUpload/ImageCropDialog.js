import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  Paper,
  CircularProgress,
} from "@mui/material";

/**
 * ImageCropDialog - Image cropping dialog
 *
 * PURPOSE: Provide image cropping functionality
 * PATTERN: Controlled dialog component
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSave - Save handler (receives file)
 * @param {string} props.previewImage - Image preview URL
 * @param {File} props.selectedFile - Selected file
 * @param {boolean} props.isUploading - Upload state
 */
function ImageCropDialog({
  open,
  onClose,
  onSave,
  previewImage,
  selectedFile,
  isUploading = false,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });

  const handleSave = () => {
    if (onSave && selectedFile) {
      onSave(selectedFile, crop);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0, scale: 1 });
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Modify Your Photo</DialogTitle>
      <DialogContent>
        {previewImage && (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Paper
              sx={{
                width: 300,
                height: 300,
                mx: "auto",
                mb: 3,
                overflow: "hidden",
                position: "relative",
                borderRadius: "50%",
              }}
            >
              <img
                src={previewImage}
                alt="Crop preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${crop.scale}) translate(${crop.x}px, ${crop.y}px)`,
                }}
              />
            </Paper>

            <Typography variant="body2" gutterBottom>
              Zoom
            </Typography>
            <Slider
              value={crop.scale}
              onChange={(_, value) =>
                setCrop((prev) => ({ ...prev, scale: value }))
              }
              min={0.5}
              max={3}
              step={0.1}
              sx={{ width: 200 }}
              disabled={isUploading}
              aria-label="Zoom level"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isUploading}
          startIcon={isUploading ? <CircularProgress size={16} /> : null}
        >
          {isUploading ? "Uploading..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImageCropDialog;
