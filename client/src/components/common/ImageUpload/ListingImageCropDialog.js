import React, { useState, useRef, useEffect } from "react";
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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CropOriginal,
  ZoomIn,
  ZoomOut,
  PanTool,
  RestartAlt,
} from "@mui/icons-material";

/**
 * ListingImageCropDialog - Image cropping dialog for listing images
 *
 * PURPOSE: Provide image cropping and zoom functionality for listing images
 * PATTERN: Controlled dialog component with rectangular crop area
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSave - Save handler (receives cropped file and crop data)
 * @param {string} props.previewImage - Image preview URL
 * @param {File} props.selectedFile - Selected file
 * @param {boolean} props.isUploading - Upload state
 */
function ListingImageCropDialog({
  open,
  onClose,
  onSave,
  previewImage,
  selectedFile,
  isUploading = false,
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset state when dialog opens with new image
  useEffect(() => {
    if (open && previewImage) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [open, previewImage]);

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;

    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (onSave && selectedFile && containerRef.current && imageRef.current) {
      // Get actual container dimensions
      const containerRect = containerRef.current.getBoundingClientRect();

      // Use square reference (500x500) for consistency
      const standardSize = 500;

      const scaleToStandard = standardSize / containerRect.width;

      // Pass normalized crop data
      onSave(selectedFile, {
        x: position.x * scaleToStandard,
        y: position.y * scaleToStandard,
        scale: zoom,
        previewWidth: standardSize,
        previewHeight: standardSize,
      });
    }
  };

  const handleClose = () => {
    handleReset();
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEnforceFocus
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <CropOriginal />
            <span>Crop & Adjust Image</span>
          </Box>
          <Tooltip title="Reset to original">
            <IconButton
              onClick={handleReset}
              size="small"
              disabled={isUploading}
            >
              <RestartAlt />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <PanTool
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 0.5 }}
            />
            Drag the image to reposition. Use zoom to adjust size. The image
            will be cropped as shown.
          </Typography>

          {previewImage && (
            <Box sx={{ textAlign: "center" }}>
              <Paper
                ref={containerRef}
                elevation={3}
                sx={{
                  width: "100%",
                  maxWidth: 500,
                  aspectRatio: "1 / 1", // Square container for consistency
                  mx: "auto",
                  mb: 3,
                  overflow: "hidden",
                  position: "relative",
                  bgcolor: "background.default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isDragging ? "grabbing" : "grab",
                  userSelect: "none",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: "none" }}
              >
                <img
                  ref={imageRef}
                  src={previewImage}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transition: isDragging ? "none" : "transform 0.1s ease",
                    pointerEvents: "none",
                  }}
                />
              </Paper>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxWidth: 500,
                  mx: "auto",
                }}
              >
                {/* Zoom Control */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <ZoomOut fontSize="small" color="action" />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                      display="block"
                    >
                      Zoom: {zoom.toFixed(1)}x
                    </Typography>
                    <Slider
                      value={zoom}
                      onChange={(_, value) => setZoom(value)}
                      min={0.5}
                      max={3}
                      step={0.1}
                      disabled={isUploading}
                      aria-label="Zoom level"
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 0.5, label: "0.5x" },
                        { value: 1, label: "1x" },
                        { value: 2, label: "2x" },
                        { value: 3, label: "3x" },
                      ]}
                    />
                  </Box>
                  <ZoomIn fontSize="small" color="action" />
                </Box>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2, display: "block" }}
              >
                File: {selectedFile?.name} (
                {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isUploading} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isUploading}
          startIcon={isUploading ? <CircularProgress size={16} /> : null}
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ListingImageCropDialog;
