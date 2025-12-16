import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Paper,
  Stack,
} from "@mui/material";
import {
  CameraAlt,
  Close,
  Upload,
  Edit,
  PanTool,
  RestartAlt,
  Info,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { cropImage } from "../../../utils/imageCrop";

/**
 * ShopBrandingUploader Component
 *
 * PURPOSE: Upload shop logo or banner with preview
 * USAGE: <ShopBrandingUploader
 *          type="logo"
 *          currentImage={shop.shopLogo}
 *          onUploadComplete={(result) => updateShop({ shopLogo: result.url })}
 *          onRemove={() => updateShop({ shopLogo: "" })}
 *        />
 *
 * PROPS:
 * - type: "logo" (500x500) or "banner" (1200x300)
 * - currentImage: Current image URL
 * - onUploadComplete: (result) => void - Called after successful upload with {url, key}
 * - onRemove: () => void - Remove handler
 */

function ShopBrandingUploader({
  type = "logo", // "logo" or "banner"
  currentImage = null,
  onUploadComplete,
  onRemove,
}) {
  const { theme } = useTheme();
  const { uploadSingle } = useImageUpload();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isLocalUploading, setIsLocalUploading] = useState(false);
  const [showSaveReminder, setShowSaveReminder] = useState(false);

  // Crop dialog state
  const [cropDialog, setCropDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isLogo = type === "logo";
  const recommendedSize = isLogo ? "500x500px" : "1200x300px";
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const aspectRatio = isLogo ? "1 / 1" : "4 / 1"; // Logo: square, Banner: wide

  // Handle file selection - Open crop dialog
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Validate file type - STRICT CHECK
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError(
        `Invalid file type. Please upload JPG, PNG, or WebP only. SVG is not supported. (Your file: ${file.type})`
      );
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError("Image size must be less than 5MB");
      return;
    }

    // Create preview and open crop dialog
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile(file);
      setPreviewImage(reader.result);
      setCropDialog(true);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle crop and upload - apply crop then upload to S3, don't save to DB yet
  const handleCropSave = async () => {
    if (!selectedFile) return;

    setIsLocalUploading(true);
    try {
      // Apply crop transformation
      const dimensions = isLogo
        ? { width: 500, height: 500 }
        : { width: 1200, height: 300 };
      const croppedFile = await cropImage(
        selectedFile,
        {
          x: crop.x,
          y: crop.y,
          scale: crop.scale,
          ...dimensions,
        },
        isLogo
      ); // circular for logo, rectangular for banner

      const folder = "shops";
      const subfolder = isLogo ? "logos" : "banners";
      const result = await uploadSingle(croppedFile, folder, subfolder);

      // Set preview locally
      setPreview(result.url);

      // Notify parent with upload result (just updates form state, doesn't save to DB)
      if (onUploadComplete) {
        onUploadComplete(result);
      }

      // Show reminder to save changes
      setShowSaveReminder(true);

      // Close crop dialog
      setCropDialog(false);
      setSelectedFile(null);
      setPreviewImage(null);
      setCrop({ x: 0, y: 0, scale: 1 });
    } catch (err) {
      console.error(`${type} upload error:`, err);
      setError(err.message || "Failed to upload image");
    } finally {
      setIsLocalUploading(false);
    }
  };

  // Handle crop dialog close
  const handleCropClose = () => {
    setCropDialog(false);
    setSelectedFile(null);
    setPreviewImage(null);
    setCrop({ x: 0, y: 0, scale: 1 });
    setIsDragging(false);
  };

  // Handle reset crop
  const handleResetCrop = () => {
    setCrop({ x: 0, y: 0, scale: 1 });
  };

  // Handle mouse/touch drag for image repositioning
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setCrop((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - crop.x,
      y: touch.clientY - crop.y,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setCrop((prev) => ({
      ...prev,
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Handle remove
  const handleRemove = async () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      await onRemove();
    }
  };

  // Handle click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayImage = preview || currentImage;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        Shop {isLogo ? "Logo" : "Banner"}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 2 }}
      >
        Recommended size: {recommendedSize} • Max 5MB •{" "}
        <strong>JPG, PNG, or WebP only</strong> (SVG not supported)
      </Typography>

      {/* Image Preview */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: isLogo ? { xs: 180, sm: 220 } : "100%",
          height: isLogo ? { xs: 180, sm: 220 } : { xs: 140, sm: 160 },
          borderRadius: isLogo ? "50%" : 2,
          border: `3px dashed ${theme.palette.divider}`,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.palette.background.paper,
          mb: 2,
          mx: isLogo ? "auto" : 0,
        }}
      >
        {isLocalUploading ? (
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={40} />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Uploading...
            </Typography>
          </Box>
        ) : displayImage ? (
          <>
            <img
              src={displayImage}
              alt={`Shop ${type}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                console.error(`Failed to load ${type} image:`, displayImage);
                e.target.style.display = "none";
              }}
            />
            {/* Remove button */}
            <IconButton
              onClick={handleRemove}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "#fff",
                "&:hover": {
                  backgroundColor: theme.palette.error.main,
                },
                zIndex: 2,
              }}
              size="small"
              aria-label={`Remove shop ${type}`}
            >
              <Close fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              color: theme.palette.text.secondary,
              p: 3,
            }}
          >
            {isLogo ? (
              <CameraAlt sx={{ fontSize: 56, mb: 1, opacity: 0.5 }} />
            ) : (
              <Upload sx={{ fontSize: 56, mb: 1, opacity: 0.5 }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              No {type} uploaded
            </Typography>
          </Box>
        )}
      </Box>

      {/* Upload Button */}
      <Button
        variant="outlined"
        startIcon={<Upload />}
        onClick={handleClick}
        disabled={isLocalUploading}
        fullWidth
        sx={{ mb: 1 }}
        aria-label={`Upload shop ${type}`}
      >
        {isLocalUploading
          ? "Uploading..."
          : displayImage
            ? `Change ${isLogo ? "Logo" : "Banner"}`
            : `Upload ${isLogo ? "Logo" : "Banner"}`}
      </Button>

      {/* Save Reminder - appears after successful upload */}
      {showSaveReminder && (
        <Alert
          severity="warning"
          icon={<Info />}
          onClose={() => setShowSaveReminder(false)}
          sx={{ mt: 1, mb: 1 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            📌 Don't forget to save!
          </Typography>
          <Typography variant="caption" display="block">
            Scroll down and click <strong>"Save All Changes"</strong> to apply
            this {type} to your shop.
          </Typography>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
        aria-label={`Upload shop ${type} file input`}
      />

      {/* Crop Dialog */}
      <Dialog
        open={cropDialog}
        onClose={handleCropClose}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus
        sx={{
          "& .MuiDialog-paper": {
            m: { xs: 1, sm: 2 },
            maxHeight: "90vh",
            width: { xs: "calc(100% - 16px)", sm: "100%" },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Adjust Your {isLogo ? "Logo" : "Banner"}
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 0.5 }}
          >
            <PanTool sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
            Drag to reposition • Use slider to zoom
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          {previewImage && (
            <Box sx={{ textAlign: "center" }}>
              <Paper
                sx={{
                  width: "100%",
                  maxWidth: isLogo
                    ? { xs: 280, sm: 350 }
                    : { xs: "100%", sm: 500 },
                  height: isLogo ? { xs: 280, sm: 350 } : { xs: 180, sm: 220 },
                  mx: "auto",
                  mb: 3,
                  overflow: "hidden",
                  position: "relative",
                  borderRadius: isLogo ? "50%" : 2,
                  border: `2px solid ${theme.palette.divider}`,
                  cursor: isDragging ? "grabbing" : "grab",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  src={previewImage}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transform: `scale(${crop.scale}) translate(${crop.x / crop.scale}px, ${crop.y / crop.scale}px)`,
                    transition: isDragging ? "none" : "transform 0.1s ease",
                    pointerEvents: "none",
                  }}
                />
              </Paper>

              <Stack spacing={2} sx={{ px: { xs: 2, sm: 0 } }}>
                <Box>
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{ fontWeight: 500, mb: 1, textAlign: "center" }}
                  >
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
                    sx={{
                      maxWidth: { xs: "100%", sm: 300 },
                      mx: "auto",
                    }}
                    disabled={isLocalUploading}
                    aria-label="Zoom level"
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Button
                  onClick={handleResetCrop}
                  startIcon={<RestartAlt />}
                  size="small"
                  disabled={isLocalUploading}
                  sx={{ alignSelf: "center" }}
                >
                  Reset Position
                </Button>
              </Stack>

              {/* Reminder about saving */}
              <Alert severity="info" icon={<Info />} sx={{ mt: 2 }}>
                <Typography variant="caption">
                  <strong>Reminder:</strong> After clicking "Apply", scroll down
                  and click <strong>"Save All Changes"</strong> at the bottom of
                  the page to persist this {type} to your shop.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, gap: 1 }}>
          <Button
            onClick={handleCropClose}
            disabled={isLocalUploading}
            sx={{ flex: { xs: 1, sm: "0 1 auto" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropSave}
            variant="contained"
            disabled={isLocalUploading}
            startIcon={isLocalUploading ? <CircularProgress size={16} /> : null}
            sx={{ flex: { xs: 1, sm: "0 1 auto" } }}
          >
            {isLocalUploading ? "Uploading..." : "Apply"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ShopBrandingUploader;
