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
import { PanTool, RestartAlt, ZoomIn, ZoomOut } from "@mui/icons-material";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * ImageCropDialog - Image cropping dialog
 *
 * PURPOSE: Provide image cropping functionality with drag and zoom
 * PATTERN: Controlled dialog component
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSave - Save handler (receives file and crop data)
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
  title = "Modify Your Photo",
  description = "Drag to reposition. Use zoom to adjust size.",
  saveLabel = "Save",
  dialogMaxWidth = "sm",
  cropShape = "circle",
  cropAreaMaxWidth = 300,
  cropAreaAspectRatio = "1 / 1",
  imageFit = "cover",
  previewBackground = "transparent",
  enforceBounds = false,
  savePreviewSize = null,
  desiredInitialZoom = 1,
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [minZoom, setMinZoom] = useState(1);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const getCropMetrics = (zoomLevel = zoom) => {
    if (!enforceBounds || !containerRef.current || !imageRef.current) {
      return {
        minZoom: 1,
        maxOffsetX: Number.POSITIVE_INFINITY,
        maxOffsetY: Number.POSITIVE_INFINITY,
      };
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const naturalWidth = imageRef.current.naturalWidth;
    const naturalHeight = imageRef.current.naturalHeight;

    if (
      !containerRect.width ||
      !containerRect.height ||
      !naturalWidth ||
      !naturalHeight
    ) {
      return {
        minZoom: 1,
        maxOffsetX: 0,
        maxOffsetY: 0,
      };
    }

    const baseScale =
      imageFit === "cover"
        ? Math.max(
            containerRect.width / naturalWidth,
            containerRect.height / naturalHeight
          )
        : Math.min(
            containerRect.width / naturalWidth,
            containerRect.height / naturalHeight
          );

    const baseWidth = naturalWidth * baseScale;
    const baseHeight = naturalHeight * baseScale;
    const requiredZoom = Math.max(
      containerRect.width / baseWidth,
      containerRect.height / baseHeight,
      1
    );
    const effectiveZoom = Math.max(zoomLevel, requiredZoom);
    const scaledWidth = baseWidth * effectiveZoom;
    const scaledHeight = baseHeight * effectiveZoom;

    return {
      minZoom: requiredZoom,
      maxOffsetX: Math.max(0, (scaledWidth - containerRect.width) / 2),
      maxOffsetY: Math.max(0, (scaledHeight - containerRect.height) / 2),
    };
  };

  const clampPosition = (nextPosition, zoomLevel = zoom) => {
    const metrics = getCropMetrics(zoomLevel);

    return {
      x: clamp(nextPosition.x, -metrics.maxOffsetX, metrics.maxOffsetX),
      y: clamp(nextPosition.y, -metrics.maxOffsetY, metrics.maxOffsetY),
    };
  };

  const syncCropBounds = (zoomLevel = zoom, nextPosition = position) => {
    const metrics = getCropMetrics(zoomLevel);

    setMinZoom(metrics.minZoom);
    setPosition(clampPosition(nextPosition, zoomLevel));

    return metrics;
  };

  const getSafeZoom = (zoomLevel = desiredInitialZoom) => {
    const metrics = getCropMetrics(zoomLevel);
    return Math.max(zoomLevel, metrics.minZoom);
  };

  // Reset state when dialog opens with new image
  useEffect(() => {
    if (open && previewImage) {
      setZoom(desiredInitialZoom);
      setMinZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [open, previewImage, desiredInitialZoom]);

  const handleReset = () => {
    const safeZoom = getSafeZoom(desiredInitialZoom);
    const metrics = getCropMetrics(safeZoom);
    setZoom(safeZoom);
    setMinZoom(metrics.minZoom);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition(
      clampPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    );
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
    setPosition(
      clampPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      })
    );
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (_, value) => {
    const nextZoom = Array.isArray(value) ? value[0] : value;
    const metrics = getCropMetrics(nextZoom);
    const clampedZoom = Math.max(nextZoom, metrics.minZoom);

    setMinZoom(metrics.minZoom);
    setZoom(clampedZoom);
    setPosition(clampPosition(position, clampedZoom));
  };

  const handleImageLoad = () => {
    const metrics = syncCropBounds();
    setZoom(Math.max(desiredInitialZoom, metrics.minZoom));
  };

  useEffect(() => {
    if (!open || !previewImage || !enforceBounds) return undefined;

    const timeoutId = window.setTimeout(() => {
      const metrics = syncCropBounds();
      if (zoom < metrics.minZoom) {
        setZoom(Math.max(desiredInitialZoom, metrics.minZoom));
      }
    }, 0);

    const handleResize = () => {
      const metrics = syncCropBounds();
      if (zoom < metrics.minZoom) {
        setZoom(metrics.minZoom);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [open, previewImage, enforceBounds, zoom]);

  const handleSave = () => {
    if (onSave && selectedFile) {
      const safePosition = clampPosition(position);
      const cropData = {
        x: safePosition.x,
        y: safePosition.y,
        scale: Math.max(zoom, minZoom),
      };

      if (savePreviewSize && containerRef.current) {
        const normalizedSize =
          typeof savePreviewSize === "number"
            ? {
                width: savePreviewSize,
                height: savePreviewSize,
              }
            : savePreviewSize;
        const containerRect = containerRef.current.getBoundingClientRect();
        const scaleToStandard = normalizedSize.width / containerRect.width;

        cropData.x = safePosition.x * scaleToStandard;
        cropData.y = safePosition.y * scaleToStandard;
        cropData.previewWidth = normalizedSize.width;
        cropData.previewHeight =
          normalizedSize.height || normalizedSize.width;
      }

      onSave(selectedFile, cropData);
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
      maxWidth={dialogMaxWidth}
      fullWidth
      disableEnforceFocus
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <span>{title}</span>
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
        <Box sx={{ py: { xs: 1.5, sm: 2 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <PanTool
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 0.5 }}
            />
            {description}
          </Typography>

          {previewImage && (
            <Box sx={{ textAlign: "center" }}>
              <Paper
                ref={containerRef}
                sx={{
                  width: "100%",
                  maxWidth: cropAreaMaxWidth,
                  aspectRatio: cropAreaAspectRatio,
                  mx: "auto",
                  mb: 3,
                  overflow: "hidden",
                  position: "relative",
                  borderRadius: cropShape === "circle" ? "50%" : 2,
                  bgcolor: previewBackground,
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
                  onLoad={handleImageLoad}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: imageFit,
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transition: isDragging ? "none" : "transform 0.1s ease",
                    pointerEvents: "none",
                  }}
                />
              </Paper>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    maxWidth: cropAreaMaxWidth,
                    mx: "auto",
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
                      onChange={handleZoomChange}
                      min={minZoom}
                      max={Math.max(3, Math.ceil(minZoom * 10) / 10)}
                      step={0.1}
                      disabled={isUploading}
                      aria-label="Zoom level"
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value.toFixed(1)}x`}
                    />
                  </Box>
                  <ZoomIn fontSize="small" color="action" />
              </Box>
            </Box>
          )}
        </Box>
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
          {isUploading ? "Uploading..." : saveLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImageCropDialog;
