import { useState } from "react";
import { Box, IconButton, Paper } from "@mui/material";
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
} from "@mui/icons-material";

const ImageGallery = ({ images = [], altText = "Listing Images" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Paper
        sx={{
          width: "100%",
          paddingTop: "100%",
          position: "relative",
          bgcolor: "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "text.secondary",
          }}
        >
          No images available
        </Box>
      </Paper>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <Box>
      {/** Main Image */}
      <Paper
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "100%",
          overflow: "hidden",
          mb: 2,
        }}
      >
        <Box
          component="img"
          src={images[currentIndex]}
          alt={`${altText} ${currentIndex + 1}`}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/** Navigate Arrows (only when the images is more than 1) */}
        {images.length > 1 && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255, 255, 255, 0.8)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                },
              }}
            >
              <PrevIcon />
            </IconButton>

            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255, 255, 255, 0.8)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                },
              }}
            >
              <NextIcon />
            </IconButton>

            {/** Image Counter */}
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                bgcolor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.875rem",
              }}
            >
              {currentIndex + 1} / {images.length}
            </Box>
          </>
        )}
      </Paper>

      {/** Thumbnails */}
      {images.length > 1 && (
        <Box display="flex" gap={1} flexGrow="wrap">
          {images.map((image, index) => (
            <Paper
              key={index}
              onClick={() => handleThumbnailClick(index)}
              sx={{
                width: 80,
                height: 80,
                cursor: "pointer",
                overflow: "hidden",
                border: selectedIndex === index ? 2 : 0,
                borderColor: "primary.main",
                transition: "all 0.2s",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              <Box
                component="img"
                src={image}
                alt={`${altText} thumbnail ${index + 1}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ImageGallery;
