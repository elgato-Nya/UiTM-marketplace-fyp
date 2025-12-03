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
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
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
          height: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          borderRadius: 2,
          gap: 2,
        }}
      >
        <NoImageIcon
          sx={{
            fontSize: 80,
            color: "text.disabled",
          }}
        />
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: "center", px: 2 }}
        >
          No Image Available
        </Typography>
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ textAlign: "center", px: 2 }}
        >
          This listing doesn't have any images yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: "100%", flexGrow: 1 }}>
      {/* Main Image Display */}
      <Paper
        elevation={3}
        onClick={handleZoomOpen}
        sx={{
          position: "relative",
          width: "100%",
          height: 400,
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
            objectFit: "contain",
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
            sx={{ mt: 2, bgcolor: "transparent" }}
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

          {/* Thumbnail Strip */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 2,
              overflowX: "auto",
              pb: 1,
            }}
          >
            {images.map((image, index) => (
              <Box
                key={index}
                onClick={() => handleStepChange(index)}
                sx={{
                  minWidth: 80,
                  height: 80,
                  cursor: "pointer",
                  border: 2,
                  borderColor:
                    activeStep === index ? "primary.main" : "transparent",
                  borderRadius: 1,
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: "primary.light",
                  },
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(image)}
                  alt={`${altText} thumbnail ${index + 1}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* Zoom Dialog / Lightbox */}
      <Dialog
        open={isZoomed}
        onClose={handleZoomClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.95)",
            boxShadow: "none",
            m: 2,
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
            minHeight: "80vh",
            overflow: "hidden",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleZoomClose}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
              },
              zIndex: 1,
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
                  left: 16,
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:disabled": {
                    color: "rgba(255, 255, 255, 0.3)",
                  },
                  zIndex: 1,
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
                  right: 16,
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:disabled": {
                    color: "rgba(255, 255, 255, 0.3)",
                  },
                  zIndex: 1,
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
              maxHeight: "80vh",
              objectFit: "contain",
              userSelect: "none",
            }}
          />

          {/* Image Counter */}
          {maxSteps > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                bgcolor: "rgba(0, 0, 0, 0.6)",
                px: 2,
                py: 1,
                borderRadius: 1,
                fontSize: "0.875rem",
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
