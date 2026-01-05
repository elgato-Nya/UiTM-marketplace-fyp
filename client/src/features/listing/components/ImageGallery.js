import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  MobileStepper,
  Paper,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Close as CloseIcon,
  ImageNotSupported as NoImageIcon,
} from "@mui/icons-material";

const ImageGallery = ({ images = [], altText = "Listing image" }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const maxSteps = images.length;

  // Responsive visible thumbnails: 3 for mobile, 5 for desktop
  // This is a simple approach - in a real app you might use useMediaQuery
  const [visibleThumbnails, setVisibleThumbnails] = useState(3);

  // Update visible thumbnails based on window width
  useEffect(() => {
    const updateVisibleThumbnails = () => {
      // md breakpoint is 900px in MUI default theme
      setVisibleThumbnails(window.innerWidth >= 900 ? 5 : 3);
    };

    updateVisibleThumbnails();
    window.addEventListener("resize", updateVisibleThumbnails);
    return () => window.removeEventListener("resize", updateVisibleThumbnails);
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      const newStep = prevActiveStep + 1;
      // Auto-scroll thumbnails if needed
      if (newStep >= thumbnailStartIndex + visibleThumbnails) {
        setThumbnailStartIndex(
          Math.min(
            newStep - visibleThumbnails + 1,
            maxSteps - visibleThumbnails
          )
        );
      }
      return newStep;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      const newStep = prevActiveStep - 1;
      // Auto-scroll thumbnails if needed
      if (newStep < thumbnailStartIndex) {
        setThumbnailStartIndex(Math.max(newStep, 0));
      }
      return newStep;
    });
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
    // Auto-scroll thumbnails to show selected
    if (step < thumbnailStartIndex) {
      setThumbnailStartIndex(step);
    } else if (step >= thumbnailStartIndex + visibleThumbnails) {
      setThumbnailStartIndex(
        Math.min(step - visibleThumbnails + 1, maxSteps - visibleThumbnails)
      );
    }
  };

  const handleThumbnailNext = () => {
    setThumbnailStartIndex((prev) =>
      Math.min(prev + 1, maxSteps - visibleThumbnails)
    );
  };

  const handleThumbnailPrev = () => {
    setThumbnailStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleZoomOpen = () => {
    setIsZoomed(true);
  };

  const handleZoomClose = () => {
    setIsZoomed(false);
  };

  const handleNextInZoom = () => {
    if (activeStep < maxSteps - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBackInZoom = () => {
    if (activeStep > 0) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  // Keyboard navigation for zoom dialog
  useEffect(() => {
    if (!isZoomed) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          handleZoomClose();
          break;
        case "ArrowLeft":
          handleBackInZoom();
          break;
        case "ArrowRight":
          handleNextInZoom();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomed, activeStep, maxSteps]);

  // Handle both string URLs and object with url property
  const getImageUrl = (image) => {
    if (typeof image === "string") return image;
    return image?.url || "https://via.placeholder.com/600x400?text=No+Image";
  };

  if (!images || images.length === 0) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "100%",
          height: { xs: 280, sm: 350, md: 400 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          borderRadius: 2,
          gap: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <NoImageIcon
          sx={{
            fontSize: { xs: 60, sm: 80 },
            color: "text.disabled",
          }}
        />
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            textAlign: "center",
            px: 2,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          No Image Available
        </Typography>
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{
            textAlign: "center",
            px: 2,
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
          }}
        >
          This listing doesn't have any images yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      {/* Main Image Display - FIXED HEIGHT */}
      <Paper
        elevation={3}
        onClick={handleZoomOpen}
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 280, sm: 350, md: 400 }, // Fixed height - no layout shift
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          overflow: "hidden",
          borderRadius: 2,
          cursor: "pointer",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: 6,
          },
        }}
      >
        <Box
          component="img"
          sx={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain", // Maintain aspect ratio, prevent layout shift
            pointerEvents: "none",
            userSelect: "none",
          }}
          src={getImageUrl(images[activeStep])}
          alt={`${altText} ${activeStep + 1}`}
        />
      </Paper>

      {/* Navigation Controls */}
      {maxSteps > 1 && (
        <>
          <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            sx={{
              mt: { xs: 1.5, sm: 2 },
              bgcolor: "transparent",
              px: 0,
            }}
            nextButton={
              <IconButton
                size="small"
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1}
              >
                <KeyboardArrowRight />
              </IconButton>
            }
            backButton={
              <IconButton
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeft />
              </IconButton>
            }
          />

          {/* Thumbnail Strip with Navigation */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: { xs: 1.5, sm: 2 },
              width: "100%",
            }}
          >
            {/* Previous Thumbnail Button */}
            <IconButton
              size="small"
              onClick={handleThumbnailPrev}
              disabled={thumbnailStartIndex === 0}
              sx={{
                flexShrink: 0,
                display: maxSteps > visibleThumbnails ? "flex" : "none",
              }}
            >
              <KeyboardArrowLeft />
            </IconButton>

            {/* Visible Thumbnails */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 0.75, sm: 1 },
                overflow: "hidden",
                flex: 1,
              }}
            >
              {images
                .slice(
                  thumbnailStartIndex,
                  thumbnailStartIndex + visibleThumbnails
                )
                .map((image, relativeIndex) => {
                  const absoluteIndex = thumbnailStartIndex + relativeIndex;
                  return (
                    <Box
                      key={absoluteIndex}
                      onClick={() => handleStepChange(absoluteIndex)}
                      sx={{
                        minWidth: { xs: 64, sm: 80 },
                        width: { xs: 64, sm: 80 },
                        height: { xs: 64, sm: 80 },
                        cursor: "pointer",
                        border: 2,
                        borderColor:
                          activeStep === absoluteIndex
                            ? "primary.main"
                            : "transparent",
                        borderRadius: 1,
                        overflow: "hidden",
                        flexShrink: 0,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "primary.light",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={getImageUrl(image)}
                        alt={`${altText} thumbnail ${absoluteIndex + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  );
                })}
            </Box>

            {/* Next Thumbnail Button */}
            <IconButton
              size="small"
              onClick={handleThumbnailNext}
              disabled={thumbnailStartIndex >= maxSteps - visibleThumbnails}
              sx={{
                flexShrink: 0,
                display: maxSteps > visibleThumbnails ? "flex" : "none",
              }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </Box>
        </>
      )}

      {/* Zoom Dialog / Lightbox */}
      <Dialog
        open={isZoomed}
        onClose={handleZoomClose}
        maxWidth="lg"
        fullWidth
        fullScreen={true} // Make fullscreen on mobile for better experience
        PaperProps={{
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.95)",
            boxShadow: "none",
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogContent
          sx={{
            position: "relative",
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: { xs: "100vh", sm: "80vh" },
            overflow: "hidden",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleZoomClose}
            sx={{
              position: "absolute",
              top: { xs: 8, sm: 16 },
              right: { xs: 8, sm: 16 },
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
              },
              zIndex: 1,
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
            }}
            aria-label="Close zoom view"
          >
            <CloseIcon />
          </IconButton>

          {/* Navigation Buttons in Zoom */}
          {maxSteps > 1 && (
            <>
              <IconButton
                onClick={handleBackInZoom}
                disabled={activeStep === 0}
                sx={{
                  position: "absolute",
                  left: { xs: 8, sm: 16 },
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:disabled": {
                    color: "rgba(255, 255, 255, 0.3)",
                  },
                  zIndex: 1,
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                }}
                aria-label="Previous image"
              >
                <KeyboardArrowLeft fontSize="large" />
              </IconButton>

              <IconButton
                onClick={handleNextInZoom}
                disabled={activeStep === maxSteps - 1}
                sx={{
                  position: "absolute",
                  right: { xs: 8, sm: 16 },
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:disabled": {
                    color: "rgba(255, 255, 255, 0.3)",
                  },
                  zIndex: 1,
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                }}
                aria-label="Next image"
              >
                <KeyboardArrowRight fontSize="large" />
              </IconButton>
            </>
          )}

          {/* Zoomed Image */}
          <Box
            component="img"
            src={getImageUrl(images[activeStep])}
            alt={`${altText} ${activeStep + 1} (zoomed)`}
            sx={{
              maxWidth: "100%",
              maxHeight: { xs: "90vh", sm: "80vh" },
              objectFit: "contain",
              userSelect: "none",
              px: { xs: 1, sm: 2 },
            }}
          />

          {/* Image Counter */}
          {maxSteps > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: { xs: 12, sm: 16 },
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                bgcolor: "rgba(0, 0, 0, 0.6)",
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
                borderRadius: 1,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {activeStep + 1} / {maxSteps}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ImageGallery;
