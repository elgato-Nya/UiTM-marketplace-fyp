import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  Button,
  alpha,
} from "@mui/material";
import { Close, Delete } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * ImagePreviewGrid - Grid display for image previews
 *
 * PURPOSE: Display selected/existing images in grid layout
 * PATTERN: Presentational component
 *
 * @param {Object} props
 * @param {Array} props.images - Array of image objects [{file, preview} or url strings]
 * @param {string} props.type - "preview" | "existing"
 * @param {Function} props.onRemove - Remove handler (index/url)
 * @param {boolean} props.disabled - Disable actions
 * @param {Function} props.onClearAll - Clear all handler (for previews)
 */
function ImagePreviewGrid({
  images = [],
  type = "preview",
  onRemove,
  disabled = false,
  onClearAll,
}) {
  const { theme } = useTheme();

  if (images.length === 0) {
    return null;
  }

  const isPreview = type === "preview";
  const title = isPreview
    ? `New Images (${images.length})`
    : `Current Images (${images.length})`;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        {isPreview && onClearAll && (
          <Button
            size="small"
            startIcon={<Delete />}
            onClick={onClearAll}
            color="error"
            disabled={disabled}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 2,
        }}
      >
        {images.map((item, index) => {
          // Handle different image formats:
          // - string: direct URL
          // - object with preview: { file, preview }
          // - object with url: { url, name, isLocal, fileIndex }
          const imageUrl =
            typeof item === "string" ? item : item.preview || item.url;

          const fileSize =
            isPreview && item.file
              ? `${(item.file.size / 1024).toFixed(0)} KB`
              : null;

          const isLocalFile = item.isLocal || false;
          const chipLabel = isPreview
            ? fileSize
            : isLocalFile
              ? "Selected"
              : "Existing";
          const chipColor = isPreview
            ? "default"
            : isLocalFile
              ? "primary"
              : "success";

          return (
            <Paper
              key={`${type}-${index}`}
              sx={{
                position: "relative",
                aspectRatio: "1",
                overflow: "hidden",
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                component="img"
                src={imageUrl}
                alt={item.file?.name || item.name || `Image ${index + 1}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Remove Button */}
              {onRemove && (
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    "&:hover": {
                      bgcolor: theme.palette.error.main,
                      color: "white",
                    },
                  }}
                  onClick={() => onRemove(isPreview ? index : item)}
                  disabled={disabled}
                  aria-label={`Remove image ${index + 1}`}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}

              {/* Info Chip */}
              {chipLabel && (
                <Chip
                  size="small"
                  label={chipLabel}
                  color={chipColor}
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    left: 4,
                    fontSize: "0.65rem",
                  }}
                />
              )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

export default ImagePreviewGrid;
